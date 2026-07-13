package com.packbridge.controller;

import com.packbridge.dto.AnalyticsActivityDto;
import com.packbridge.dto.AnalyticsHistoryDto;
import com.packbridge.dto.AnalyticsOverviewDto;
import com.packbridge.dto.AnalyticsSystemDto;
import com.packbridge.dto.LoaderDistributionDto;
import com.packbridge.service.AdminAnalyticsAdvancedService;
import com.packbridge.service.AnalyticsService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/api/admin/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final AdminAnalyticsAdvancedService adminAnalyticsAdvancedService;

    public AnalyticsController(AnalyticsService analyticsService, AdminAnalyticsAdvancedService adminAnalyticsAdvancedService) {
        this.analyticsService = analyticsService;
        this.adminAnalyticsAdvancedService = adminAnalyticsAdvancedService;
    }

    @GetMapping(value = "/overview", produces = MediaType.APPLICATION_JSON_VALUE)
    public AnalyticsOverviewDto overview() {
        return analyticsService.getOverview();
    }

    @GetMapping(value = "/history", produces = MediaType.APPLICATION_JSON_VALUE)
    public AnalyticsHistoryDto history(@RequestParam(name = "days", required = false, defaultValue = "7") int days) {
        int safeDays = Math.max(days, 1);
        return adminAnalyticsAdvancedService.history(safeDays);
    }

    @GetMapping(value = "/loaders", produces = MediaType.APPLICATION_JSON_VALUE)
    public LoaderDistributionDto loaders() {
        return adminAnalyticsAdvancedService.loaders();
    }

    @GetMapping(value = "/system", produces = MediaType.APPLICATION_JSON_VALUE)
    public AnalyticsSystemDto system() {
        return adminAnalyticsAdvancedService.system();
    }

    @GetMapping(value = "/activity", produces = MediaType.APPLICATION_JSON_VALUE)
    public AnalyticsActivityDto activity() {
        return adminAnalyticsAdvancedService.activity();
    }
}