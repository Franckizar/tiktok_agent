package com.example.security.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@ConditionalOnClass(name = "org.springframework.data.redis.connection.RedisConnectionFactory")
@ConditionalOnBean(RedisConnectionFactory.class)
public class RedisConfig {

        private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class);

        @Value("${spring.data.redis.host:localhost}")
        private String redisHost;

        @Value("${spring.data.redis.port:6379}")
        private int redisPort;

        @Value("${spring.data.redis.password:}")
        private String redisPassword;

        @Bean
        public ObjectMapper redisObjectMapper() {
                ObjectMapper mapper = new ObjectMapper();
                mapper.registerModule(new JavaTimeModule());
                mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

                mapper.activateDefaultTyping(
                                BasicPolymorphicTypeValidator.builder()
                                                .allowIfBaseType(Object.class)
                                                .allowIfBaseType(Enum.class)
                                                .build(),
                                ObjectMapper.DefaultTyping.NON_FINAL,
                                JsonTypeInfo.As.PROPERTY);

                return mapper;
        }

        @Bean
        public RedisConnectionFactory redisConnectionFactory() {
                try {
                        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
                        config.setHostName(redisHost);
                        config.setPort(redisPort);

                        if (redisPassword != null && !redisPassword.isEmpty()) {
                                config.setPassword(redisPassword);
                        }

                        SocketOptions socketOptions = SocketOptions.builder()
                                        .connectTimeout(Duration.ofSeconds(2))
                                        .keepAlive(true)
                                        .build();

                        ClientOptions clientOptions = ClientOptions.builder()
                                        .socketOptions(socketOptions)
                                        .autoReconnect(true)
                                        .build();

                        LettuceClientConfiguration clientConfig = LettuceClientConfiguration.builder()
                                        .clientOptions(clientOptions)
                                        .commandTimeout(Duration.ofSeconds(2))
                                        .build();

                        LettuceConnectionFactory factory = new LettuceConnectionFactory(config, clientConfig);
                        factory.setShareNativeConnection(false);
                        factory.setValidateConnection(false);
                        factory.afterPropertiesSet();

                        logger.info("🔌 Redis connection factory created for {}:{}", redisHost, redisPort);
                        return factory;

                } catch (Exception e) {
                        logger.warn("❌ Failed to create Redis connection: {}", e.getMessage());
                        return null;
                }
        }

        @Bean
        public RedisTemplate<String, Object> redisTemplate(
                        RedisConnectionFactory connectionFactory,
                        ObjectMapper redisObjectMapper) {

                RedisTemplate<String, Object> template = new RedisTemplate<>();
                template.setConnectionFactory(connectionFactory);

                GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(
                                redisObjectMapper);

                template.setKeySerializer(new StringRedisSerializer());
                template.setHashKeySerializer(new StringRedisSerializer());
                template.setValueSerializer(serializer);
                template.setHashValueSerializer(serializer);

                template.afterPropertiesSet();

                logger.info("🔧 RedisTemplate configured");
                return template;
        }

        public RedisCacheManager redisCacheManager(
                        RedisConnectionFactory connectionFactory,
                        ObjectMapper redisObjectMapper) {

                GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(
                                redisObjectMapper);

                RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                                .entryTtl(Duration.ofHours(1))
                                .serializeKeysWith(
                                                RedisSerializationContext.SerializationPair
                                                                .fromSerializer(new StringRedisSerializer()))
                                .serializeValuesWith(
                                                RedisSerializationContext.SerializationPair
                                                                .fromSerializer(serializer))
                                .disableCachingNullValues();

                return RedisCacheManager.builder(connectionFactory)
                                .cacheDefaults(config)
                                .build();
        }
}
// ```

// ## Expected Results

// ### With Redis Running:
// ```
// 2026-01-16 11:30:45 INFO [main] c.e.s.config.RedisConfig - 🔌 Redis
// connection factory created for localhost:6379
// 2026-01-16 11:30:45 INFO [main] c.e.s.config.RedisConfig - 🔧 RedisTemplate
// configured
// 2026-01-16 11:30:45 INFO [main] c.e.s.config.CacheConfig - ✅ Redis is
// AVAILABLE - Using Redis Cache
// ```

// ### With Redis Stopped:
// ```
// 2026-01-16 11:30:45 WARN [main] c.e.s.config.RedisConfig - ❌ Failed to create
// Redis connection: Unable to connect to localhost:6379
// 2026-01-16 11:30:45 WARN [main] c.e.s.config.CacheConfig - ⚠️ Redis is
// UNAVAILABLE - Using Caffeine (in-memory) cache
// 2026-01-16 11:30:45 INFO [main] c.e.s.config.CacheConfig - 📦 Caffeine cache
// initialized with 1-hour TTL