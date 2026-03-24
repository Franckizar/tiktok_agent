package com.example.security.intelligence;

import com.example.security.Users.User;
import com.example.security.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IntelligenceService {

    private final ApifyJobRepository apifyJobRepository;
    private final HashtagTrendRepository hashtagTrendRepository;
    private final CompetitorProfileRepository competitorProfileRepository;
    private final AiSuggestionRepository aiSuggestionRepository;
    private final NicheReportRepository nicheReportRepository;
    private final UserRepository userRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${apify.api.token}")
    private String apifyToken;

    @Value("${anthropic.api.key}")
    private String anthropicApiKey;

    // Apify actor ID for TikTok hashtag scraper
    private static final String APIFY_ACTOR_ID = "clockworks/tiktok-scraper";
    private static final String APIFY_BASE_URL  = "https://api.apify.com/v2";
    private static final String CLAUDE_API_URL  = "https://api.anthropic.com/v1/messages";

    // ========================================
    // TRIGGER NICHE ANALYSIS — entry point
    // Starts the job and returns immediately
    // Processing happens async in background
    // ========================================
    public ApifyJob triggerNicheAnalysis(Long userId, String nicheKeyword) {
        log.info("Triggering niche analysis for userId={} keyword='{}'", userId, nicheKeyword);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ApifyJob job = ApifyJob.builder()
                .user(user)
                .nicheKeyword(nicheKeyword)
                .status(ApifyJob.JobStatus.PENDING)
                .build();

        ApifyJob savedJob = apifyJobRepository.save(job);

        // Run async — don't block the HTTP response
        runAnalysisPipeline(savedJob.getId(), nicheKeyword);

        return savedJob;
    }

    // ========================================
    // FULL PIPELINE — runs in background
    // ========================================
    @Async
    public void runAnalysisPipeline(Long jobId, String nicheKeyword) {
        ApifyJob job = apifyJobRepository.findById(jobId).orElseThrow();

        try {
            // Step 1 — Trigger Apify scraper
            log.info("Step 1: Triggering Apify for keyword='{}'", nicheKeyword);
            String apifyRunId = triggerApifyScraper(nicheKeyword);
            job.setApifyRunId(apifyRunId);
            job.setStatus(ApifyJob.JobStatus.RUNNING);
            apifyJobRepository.save(job);

            // Step 2 — Poll until Apify finishes (max 5 min)
            log.info("Step 2: Polling Apify run={}", apifyRunId);
            String rawResult = pollApifyUntilComplete(apifyRunId);
            job.setRawResult(rawResult);
            apifyJobRepository.save(job);

            // Step 3 — Parse hashtag trends
            log.info("Step 3: Parsing hashtag trends");
            parseAndSaveHashtagTrends(job, rawResult);

            // Step 4 — Parse competitor profiles
            log.info("Step 4: Parsing competitor profiles");
            parseAndSaveCompetitors(job, rawResult);

            // Step 5 — Send to AI for suggestions
            log.info("Step 5: Sending to Claude for AI suggestions");
            generateAiSuggestions(job);

            // Step 6 — Generate full niche report
            log.info("Step 6: Generating niche report");
            generateNicheReport(job);

            job.setStatus(ApifyJob.JobStatus.COMPLETED);
            job.setCompletedAt(LocalDateTime.now());
            apifyJobRepository.save(job);

            log.info("Analysis pipeline complete for jobId={}", jobId);

        } catch (Exception e) {
            log.error("Analysis pipeline failed for jobId={}: {}", jobId, e.getMessage(), e);
            job.setStatus(ApifyJob.JobStatus.FAILED);
            job.setErrorMessage(e.getMessage());
            apifyJobRepository.save(job);
        }
    }

    // ========================================
    // STEP 1 — TRIGGER APIFY SCRAPER
    // ========================================
    private String triggerApifyScraper(String keyword) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apifyToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> input = new HashMap<>();
        input.put("hashtags", List.of(keyword.replace(" ", "")));
        input.put("resultsPerPage", 30);
        input.put("maxProfilesPerQuery", 10);
        input.put("shouldDownloadVideos", false);
        input.put("shouldDownloadCovers", false);

        String url = APIFY_BASE_URL + "/acts/" + APIFY_ACTOR_ID + "/runs";
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(input, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        JsonNode json = objectMapper.readTree(response.getBody());
        return json.get("data").get("id").asText();
    }

    // ========================================
    // STEP 2 — POLL APIFY UNTIL DONE
    // ========================================
    private String pollApifyUntilComplete(String runId) throws Exception {
        String statusUrl = APIFY_BASE_URL + "/actor-runs/" + runId;

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apifyToken);
        HttpEntity<String> request = new HttpEntity<>(headers);

        for (int i = 0; i < 60; i++) { // max 60 polls = 5 minutes
            Thread.sleep(5000); // wait 5 seconds between polls

            ResponseEntity<String> response = restTemplate.exchange(
                    statusUrl, HttpMethod.GET, request, String.class);
            JsonNode json = objectMapper.readTree(response.getBody());
            String status = json.get("data").get("status").asText();

            log.debug("Apify run {} status: {}", runId, status);

            if ("SUCCEEDED".equals(status)) {
                // Fetch the dataset results
                String datasetId = json.get("data").get("defaultDatasetId").asText();
                return fetchApifyDataset(datasetId);
            } else if ("FAILED".equals(status) || "ABORTED".equals(status)) {
                throw new RuntimeException("Apify run failed with status: " + status);
            }
        }

        throw new RuntimeException("Apify polling timed out after 5 minutes");
    }

    // ========================================
    // FETCH APIFY DATASET RESULTS
    // ========================================
    private String fetchApifyDataset(String datasetId) throws Exception {
        String url = APIFY_BASE_URL + "/datasets/" + datasetId + "/items?format=json";

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apifyToken);
        HttpEntity<String> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        return response.getBody();
    }

    // ========================================
    // STEP 3 — PARSE HASHTAG TRENDS
    // ========================================
    private void parseAndSaveHashtagTrends(ApifyJob job, String rawResult) throws Exception {
        JsonNode items = objectMapper.readTree(rawResult);

        Map<String, long[]> hashtagStats = new HashMap<>();
        // long[] = [totalViews, totalLikes, totalShares, videoCount]

        for (JsonNode item : items) {
            if (item.has("challenges")) {
                for (JsonNode challenge : item.get("challenges")) {
                    String tag = challenge.has("title") ? "#" + challenge.get("title").asText() : null;
                    if (tag == null) continue;

                    long views  = item.has("playCount")  ? item.get("playCount").asLong()  : 0L;
                    long likes  = item.has("diggCount")  ? item.get("diggCount").asLong()  : 0L;
                    long shares = item.has("shareCount") ? item.get("shareCount").asLong() : 0L;

                    hashtagStats.merge(tag, new long[]{views, likes, shares, 1},
                            (a, b) -> new long[]{a[0]+b[0], a[1]+b[1], a[2]+b[2], a[3]+b[3]});
                }
            }
        }

        for (Map.Entry<String, long[]> entry : hashtagStats.entrySet()) {
            long[] stats = entry.getValue();
            long count = stats[3];
            long avgViews = count > 0 ? stats[0] / count : 0;
            long avgLikes = count > 0 ? stats[1] / count : 0;
            long avgShares = count > 0 ? stats[2] / count : 0;
            float engagement = avgViews > 0 ? ((avgLikes + avgShares) * 100f) / avgViews : 0f;

            HashtagTrend trend = HashtagTrend.builder()
                    .apifyJob(job)
                    .hashtag(entry.getKey())
                    .videoCount(count)
                    .avgViews(avgViews)
                    .avgLikes(avgLikes)
                    .avgShares(avgShares)
                    .engagementRate(engagement)
                    .trendDirection(HashtagTrend.TrendDirection.STABLE)
                    .build();

            hashtagTrendRepository.save(trend);
        }

        log.info("Saved {} hashtag trends for jobId={}", hashtagStats.size(), job.getId());
    }

    // ========================================
    // STEP 4 — PARSE COMPETITOR PROFILES
    // ========================================
    private void parseAndSaveCompetitors(ApifyJob job, String rawResult) throws Exception {
        JsonNode items = objectMapper.readTree(rawResult);

        Map<String, JsonNode> authorMap = new HashMap<>();
        for (JsonNode item : items) {
            if (item.has("authorMeta")) {
                JsonNode author = item.get("authorMeta");
                String handle = author.has("name") ? author.get("name").asText() : null;
                if (handle != null && !authorMap.containsKey(handle)) {
                    authorMap.put(handle, item);
                }
            }
        }

        for (Map.Entry<String, JsonNode> entry : authorMap.entrySet()) {
            JsonNode item = entry.getValue();
            JsonNode author = item.get("authorMeta");

            CompetitorProfile profile = CompetitorProfile.builder()
                    .apifyJob(job)
                    .tiktokHandle(entry.getKey())
                    .displayName(author.has("nickName") ? author.get("nickName").asText() : entry.getKey())
                    .followerCount(author.has("fans") ? author.get("fans").asLong() : 0L)
                    .avgViews(item.has("playCount") ? item.get("playCount").asLong() : 0L)
                    .avgLikes(item.has("diggCount") ? item.get("diggCount").asLong() : 0L)
                    .build();

            competitorProfileRepository.save(profile);
        }

        log.info("Saved {} competitor profiles for jobId={}", authorMap.size(), job.getId());
    }

    // ========================================
    // STEP 5 — AI SUGGESTIONS via Claude
    // ========================================
    private void generateAiSuggestions(ApifyJob job) throws Exception {
        List<HashtagTrend> trends = hashtagTrendRepository
                .findByApifyJobIdOrderByAvgViewsDesc(job.getId());
        List<CompetitorProfile> competitors = competitorProfileRepository
                .findByApifyJobIdOrderByFollowerCountDesc(job.getId());

        String prompt = buildSuggestionsPrompt(job.getNicheKeyword(), trends, competitors);
        String aiResponse = callClaudeApi(prompt);

        // Save as a TREND suggestion
        AiSuggestion suggestion = AiSuggestion.builder()
                .user(job.getUser())
                .apifyJob(job)
                .suggestionType(AiSuggestion.SuggestionType.TREND)
                .content(aiResponse)
                .confidenceScore(0.85f)
                .build();

        aiSuggestionRepository.save(suggestion);
        log.info("AI suggestions saved for jobId={}", job.getId());
    }

    // ========================================
    // STEP 6 — FULL NICHE REPORT via Claude
    // ========================================
    private void generateNicheReport(ApifyJob job) throws Exception {
        List<HashtagTrend> trends = hashtagTrendRepository
                .findByApifyJobIdOrderByAvgViewsDesc(job.getId());
        List<CompetitorProfile> competitors = competitorProfileRepository
                .findByApifyJobIdOrderByFollowerCountDesc(job.getId());

        String prompt = buildNicheReportPrompt(job.getNicheKeyword(), trends, competitors);
        String aiResponse = callClaudeApi(prompt);

        NicheReport report = NicheReport.builder()
                .user(job.getUser())
                .apifyJob(job)
                .niche(job.getNicheKeyword())
                .summary(aiResponse)
                .growthStrategy(aiResponse)
                .build();

        nicheReportRepository.save(report);
        log.info("Niche report saved for jobId={}", job.getId());
    }

    // ========================================
    // CLAUDE API CALL
    // ========================================
    private String callClaudeApi(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "claude-sonnet-4-20250514");
        body.put("max_tokens", 2000);
        body.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(
                CLAUDE_API_URL, HttpMethod.POST, request, String.class);

        JsonNode json = objectMapper.readTree(response.getBody());
        return json.get("content").get(0).get("text").asText();
    }

    // ========================================
    // PROMPT BUILDERS
    // ========================================
    private String buildSuggestionsPrompt(String niche,
            List<HashtagTrend> trends, List<CompetitorProfile> competitors) {

        StringBuilder sb = new StringBuilder();
        sb.append("You are a TikTok growth expert. Analyze this data for the niche: ").append(niche).append("\n\n");

        sb.append("TOP HASHTAGS:\n");
        trends.stream().limit(10).forEach(t ->
                sb.append("- ").append(t.getHashtag())
                  .append(" | avgViews: ").append(t.getAvgViews())
                  .append(" | engagement: ").append(t.getEngagementRate()).append("%\n"));

        sb.append("\nTOP COMPETITORS:\n");
        competitors.stream().limit(5).forEach(c ->
                sb.append("- @").append(c.getTiktokHandle())
                  .append(" | followers: ").append(c.getFollowerCount())
                  .append(" | avgViews: ").append(c.getAvgViews()).append("\n"));

        sb.append("\nGive 5 specific actionable suggestions to grow in this niche. ");
        sb.append("Focus on: best hashtags to use, posting times, content formats that work. ");
        sb.append("Be specific and data-driven. Keep it concise.");

        return sb.toString();
    }

    private String buildNicheReportPrompt(String niche,
            List<HashtagTrend> trends, List<CompetitorProfile> competitors) {

        StringBuilder sb = new StringBuilder();
        sb.append("You are a TikTok strategist. Create a complete growth strategy report for: ").append(niche).append("\n\n");

        sb.append("HASHTAG DATA:\n");
        trends.stream().limit(15).forEach(t ->
                sb.append(t.getHashtag()).append(" (").append(t.getAvgViews()).append(" avg views)\n"));

        sb.append("\nCOMPETITOR DATA:\n");
        competitors.stream().limit(8).forEach(c ->
                sb.append("@").append(c.getTiktokHandle())
                  .append(" ").append(c.getFollowerCount()).append(" followers\n"));

        sb.append("\nWrite a complete strategy report with these sections:\n");
        sb.append("1. Market Overview\n");
        sb.append("2. Best Hashtags to Use\n");
        sb.append("3. Best Posting Times\n");
        sb.append("4. Content Formats That Work\n");
        sb.append("5. Competitor Insights\n");
        sb.append("6. Step-by-Step Growth Plan\n");
        sb.append("Write in a clear, motivating tone suitable for a creator in Cameroon/Africa.");

        return sb.toString();
    }

    // ========================================
    // GET METHODS — for controller
    // ========================================
    public List<ApifyJob> getUserJobs(Long userId) {
        return apifyJobRepository.findByUserIdOrderByRequestedAtDesc(userId);
    }

    public Optional<NicheReport> getReportByJobId(Long jobId) {
        return nicheReportRepository.findByApifyJobId(jobId);
    }

    public List<NicheReport> getUserReports(Long userId) {
        return nicheReportRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }

    public List<AiSuggestion> getUserSuggestions(Long userId) {
        return aiSuggestionRepository.findByUserIdOrderByGeneratedAtDesc(userId);
    }

    public List<HashtagTrend> getJobHashtags(Long jobId) {
        return hashtagTrendRepository.findByApifyJobIdOrderByAvgViewsDesc(jobId);
    }

    public List<CompetitorProfile> getJobCompetitors(Long jobId) {
        return competitorProfileRepository.findByApifyJobIdOrderByFollowerCountDesc(jobId);
    }
}
