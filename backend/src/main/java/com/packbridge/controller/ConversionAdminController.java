package com.packbridge.controller;

import com.packbridge.dto.ConversionDto;
import com.packbridge.service.AdminConversionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/admin")
public class ConversionAdminController {

    private final AdminConversionService adminConversionService;

    public ConversionAdminController(AdminConversionService adminConversionService) {
        this.adminConversionService = adminConversionService;
    }

    @GetMapping(value = "/conversions", produces = MediaType.APPLICATION_JSON_VALUE)
    public Page<ConversionDto> listConversions(
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "25") int size,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "modpack", required = false) String modpackName,
            @RequestParam(name = "loader", required = false) String loader,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "from", required = false) Instant from,
            @RequestParam(name = "to", required = false) Instant to
    ) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "timestampUtc"));

        return adminConversionService.findConversions(
                search,
                modpackName,
                loader,
                status,
                from,
                to,
                pageable
        );
    }
}