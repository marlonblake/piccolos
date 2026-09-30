package com.example.piccolos;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {"com.example.piccolos", "com.piccolos.backend"})
@EntityScan(basePackages = {"com.example.piccolos", "com.piccolos.backend"})
@EnableJpaRepositories(basePackages = {"com.example.piccolos", "com.piccolos.backend"})
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
