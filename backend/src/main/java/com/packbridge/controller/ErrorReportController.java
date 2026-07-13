package com.packbridge.controller;

import com.packbridge.dto.ErrorReportCreateRequest;
import com.packbridge.dto.ErrorReportDto;
import com.packbridge.service.ErrorReportService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ErrorReportController {

    private final ErrorReportService errorReportService;

    public ErrorReportController(ErrorReportService errorReportService) {
        this.errorReportService = errorReportService;
    }

    // Public endpoint: called by frontend crash reporter
    @PostMapping("/errors/report")
    @ResponseStatus(HttpStatus.CREATED)
    public ErrorReportDto reportError(@RequestBody ErrorReportCreateRequest request) {
        return errorReportService.createPublicReport(request);
    }

    // Admin: list reports (sorted by newest)
    @GetMapping("/admin/errors")
    public List<ErrorReportDto> listAdminErrors(@RequestParam(name = "limit", required = false) Integer limit) {
        return errorReportService.listAdminReports(limit);
    }

    // Admin: single report
    @GetMapping("/admin/errors/{id}")
    public ErrorReportDto getAdminError(@PathVariable("id") UUID id) {
        Optional<ErrorReportDto> opt = errorReportService.getById(id);
        return opt.orElseThrow(() -> new ResourceNotFoundException("Error report not found"));
    }

    // Admin: resolve
    @PatchMapping("/admin/errors/{id}/resolve")
    public ErrorReportDto resolveAdminError(
            @PathVariable("id") UUID id,
            @RequestBody AdminResolveRequest req,
            HttpServletRequest request
    ) {
        return errorReportService.markResolved(id, req.resolvedBy, request)
                .orElseThrow(() -> new ResourceNotFoundException("Error report not found"));
    }

    // Admin: delete
    @DeleteMapping("/admin/errors/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAdminError(@PathVariable("id") UUID id, HttpServletRequest request) {
        errorReportService.deleteById(id, request);
    }

    static class AdminResolveRequest {
        public String resolvedBy;
    }

    @ResponseStatus(HttpStatus.NOT_FOUND)
    static class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }
}