package com.packbridge.controller;

import com.packbridge.dto.AdminActivityDto;
import com.packbridge.service.AdminActivityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminActivityController {

    private final AdminActivityService adminActivityService;

    public AdminActivityController(AdminActivityService adminActivityService) {
        this.adminActivityService = adminActivityService;
    }

    @GetMapping(value = "/activity", produces = "application/json")
    public Page<AdminActivityDto> listActivity(
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "25") int size,
            @RequestParam(name = "username", required = false) String username,
            @RequestParam(name = "action", required = false) String action,
            @RequestParam(name = "description", required = false) String description
    ) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        PageRequest pageable = PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "timestampUtc"));
        return adminActivityService.search(username, action, description, pageable);
    }

    @GetMapping(value = "/activity/{id}", produces = "application/json")
    public AdminActivityDto getActivity(@PathVariable("id") UUID id) {
        return adminActivityService.getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found"));
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }
}