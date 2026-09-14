package com.restaurant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point của ứng dụng Restaurant Management System.
 *
 * @SpringBootApplication bao gồm:
 *   - @Configuration: đây là class cấu hình Spring
 *   - @EnableAutoConfiguration: tự động cấu hình theo dependencies
 *   - @ComponentScan: quét toàn bộ package com.restaurant
 */
@SpringBootApplication
public class RestaurantApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantApplication.class, args);
        System.out.println("==============================================");
        System.out.println("  Restaurant Management System đã khởi động!");
        System.out.println("  API: http://localhost:8080/api");
        System.out.println("==============================================");
    }
}
