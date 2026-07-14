package com.packbridge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PackPortApplication {

    public static void main(String[] args) {
        SpringApplication.run(PackPortApplication.class, args);
    }

}
