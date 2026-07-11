package com.packbridge.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping(value = "/", produces = MediaType.TEXT_PLAIN_VALUE)
    public String root() {
        return "PackPort Backend is running!";
    }

    @GetMapping(value = "/api/health", produces = MediaType.TEXT_PLAIN_VALUE)
    public String health() {
        return "OK";
    }
}