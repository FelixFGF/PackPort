package com.packbridge.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class StatusController {

    @GetMapping("/status")
    public Map<String, String> getStatus() { // Forcing recompile
        Map<String, String> status = new HashMap<>();
        status.put("status", "online");
        status.put("name", "PackPort");
        status.put("version", "1.0.0");
        return status;
    }

    @GetMapping("/version")
    public Map<String, String> getVersion() {
        Map<String, String> versionMap = new HashMap<>();
        versionMap.put("version", "1.0.0");
        return versionMap;
    }

}