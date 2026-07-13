package com.packbridge.controller;

import com.packbridge.dto.ApplicationLogDto;
import com.packbridge.service.ApplicationLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class ApplicationLogController {

    private final ApplicationLogService applicationLogService;

    public ApplicationLogController(ApplicationLogService applicationLogService) {
        this.applicationLogService = applicationLogService;
    }

    @GetMapping(value = "/logs", produces = "application/json")
    public Page<ApplicationLogDto> listLogs(
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "25") int size,
            @RequestParam(name = "level", required = false) String level,
            @RequestParam(name = "logger", required = false) String logger,
            @RequestParam(name = "message", required = false) String message,
            @RequestParam(name = "jobId", required = false) String jobId,
            @RequestParam(name = "requestPath", required = false) String requestPath,
            @RequestParam(name = "from", required = false) OffsetDateTime from,
            @RequestParam(name = "to", required = false) OffsetDateTime to
    ) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        PageRequest pageable = PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "timestampUtc"));
        return applicationLogService.search(level, logger, message, jobId, requestPath, from, to, pageable);
    }

    @GetMapping(value = "/logs/{id}", produces = "application/json")
    public ApplicationLogDto getLog(@PathVariable("id") UUID id) {
        return applicationLogService.getById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Log not found"));
    }

    @DeleteMapping(value = "/logs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLog(@PathVariable("id") UUID id) {
        applicationLogService.deleteById(id);
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }
}