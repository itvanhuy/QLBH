package com.restaurant.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Cấu hình JPA.
 *
 * @EnableJpaAuditing: bật tính năng tự động set createdAt/updatedAt
 * thông qua @CreatedDate và @LastModifiedDate trong các Entity.
 *
 * Yêu cầu: Entity phải có @EntityListeners(AuditingEntityListener.class)
 */
@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.restaurant.repository")
public class JpaConfig {
    // Không cần thêm gì - annotation đã làm tất cả
}
