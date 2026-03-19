// package com.example.security.config;

// import com.fasterxml.jackson.annotation.JsonTypeInfo;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.fasterxml.jackson.databind.SerializationFeature;
// import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
// import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
// import org.springframework.cache.annotation.EnableCaching;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.data.redis.cache.RedisCacheConfiguration;
// import org.springframework.data.redis.cache.RedisCacheManager;
// import org.springframework.data.redis.connection.RedisConnectionFactory;
// import org.springframework.data.redis.core.RedisTemplate;
// import
// org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
// import org.springframework.data.redis.serializer.RedisSerializationContext;
// import org.springframework.data.redis.serializer.StringRedisSerializer;

// import java.time.Duration;

// @Configuration
// @EnableCaching
// public class RedisConfig {

// @Bean
// public ObjectMapper redisObjectMapper() {
// ObjectMapper mapper = new ObjectMapper();

// // ✅ CRITICAL: Register JavaTimeModule for LocalDateTime
// mapper.registerModule(new JavaTimeModule());
// mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

// // ✅ CRITICAL: Enable type handling for enums and collections
// mapper.activateDefaultTyping(
// BasicPolymorphicTypeValidator.builder()
// .allowIfBaseType(Object.class)
// .allowIfBaseType(Enum.class) // ✅ This is KEY for your enums!
// .build(),
// ObjectMapper.DefaultTyping.NON_FINAL,
// JsonTypeInfo.As.PROPERTY);

// return mapper;
// }

// @Bean
// public RedisTemplate<String, Object> redisTemplate(
// RedisConnectionFactory connectionFactory,
// ObjectMapper redisObjectMapper) {

// RedisTemplate<String, Object> template = new RedisTemplate<>();
// template.setConnectionFactory(connectionFactory);

// // ✅ Use GenericJackson2JsonRedisSerializer with custom ObjectMapper
// GenericJackson2JsonRedisSerializer serializer = new
// GenericJackson2JsonRedisSerializer(redisObjectMapper);

// template.setKeySerializer(new StringRedisSerializer());
// template.setHashKeySerializer(new StringRedisSerializer());
// template.setValueSerializer(serializer);
// template.setHashValueSerializer(serializer);

// template.afterPropertiesSet();
// return template;
// }

// @Bean
// public RedisCacheManager cacheManager(
// RedisConnectionFactory connectionFactory,
// ObjectMapper redisObjectMapper) {

// // ✅ Use GenericJackson2JsonRedisSerializer (NOT
// Jackson2JsonRedisSerializer!)
// GenericJackson2JsonRedisSerializer serializer = new
// GenericJackson2JsonRedisSerializer(redisObjectMapper);

// RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
// .entryTtl(Duration.ofHours(1))
// .serializeKeysWith(
// RedisSerializationContext.SerializationPair
// .fromSerializer(new StringRedisSerializer()))
// .serializeValuesWith(
// RedisSerializationContext.SerializationPair
// .fromSerializer(serializer) // ✅ This handles everything!
// )
// .disableCachingNullValues();

// return RedisCacheManager.builder(connectionFactory)
// .cacheDefaults(config)
// .build();
// }
// }