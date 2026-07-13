package com.packbridge.service;

import com.packbridge.dto.ErrorReportCreateRequest;
import com.packbridge.dto.ErrorReportDto;
import com.packbridge.entity.ErrorReportEntity;
import com.packbridge.repository.ErrorReportRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ErrorReportService {

    private final ErrorReportRepository errorReportRepository;
    private final RequestCorrelation requestCorrelation;
    private final AdminActivityAutoRecorder adminActivityAutoRecorder;

    public ErrorReportService(
            ErrorReportRepository errorReportRepository,
            RequestCorrelation requestCorrelation,
            AdminActivityAutoRecorder adminActivityAutoRecorder
    ) {
        this.errorReportRepository = errorReportRepository;
        this.requestCorrelation = requestCorrelation;
        this.adminActivityAutoRecorder = adminActivityAutoRecorder;
    }

    @Transactional
    public ErrorReportDto createPublicReport(ErrorReportCreateRequest req) {
        ErrorReportEntity e = new ErrorReportEntity();
        e.setCorrelationId(requestCorrelation.getCorrelationId());

        e.setSeverity(req.severity);
        e.setErrorMessage(req.errorMessage);
        e.setStacktrace(req.stacktrace);

        e.setJobId(req.jobId);
        e.setBrowser(req.browser);
        e.setOperatingSystem(req.operatingSystem);

        e.setMinecraftVersion(req.minecraftVersion);
        e.setLoader(req.loader);
        e.setModpackName(req.modpackName);
        e.setInstalledMods(req.installedMods);

        e.setApplicationVersion(req.applicationVersion);
        e.setLogs(req.logs);

        e.setUserNotes(req.userNotes);
        e.setResolved(false);

        if (req.conversionStep != null && !req.conversionStep.isBlank()) {
            String note = (req.userNotes == null ? "" : req.userNotes);
            e.setUserNotes(note + (note.isBlank() ? "" : "\n") + "Conversion step: " + req.conversionStep);
        }

        ErrorReportEntity saved = errorReportRepository.save(e);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<ErrorReportDto> listAdminReports(Integer limit) {
        int l = (limit == null || limit <= 0) ? 200 : Math.min(limit, 500);
        return errorReportRepository.findAll().stream()
                .sorted(Comparator.comparing(ErrorReportEntity::getTimestampUtc).reversed())
                .limit(l)
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<ErrorReportDto> getById(UUID id) {
        return errorReportRepository.findById(id).map(this::toDto);
    }

    @Transactional
    public void deleteById(UUID id, HttpServletRequest request) {
        // Best-effort username extraction (do not change auth/session)
        String username = extractUsernameBestEffort(request);

        // Grab correlation id before delete (still request-scoped)
        String correlationId = requestCorrelation.getCorrelationId();

        // Record activity BEFORE delete to ensure we capture the request context
        // Action strings are intentionally explicit and stable.
        adminActivityAutoRecorder.recordAction(
                username,
                "DELETE_ERROR",
                "Deleted error report: " + id,
                request,
                correlationId
        );

        errorReportRepository.deleteById(id);
    }

    @Transactional
    public Optional<ErrorReportDto> markResolved(UUID id, String resolvedBy, HttpServletRequest request) {
        Optional<ErrorReportEntity> opt = errorReportRepository.findById(id);
        if (opt.isEmpty()) return Optional.empty();

        ErrorReportEntity e = opt.get();
        e.setResolved(true);
        e.setResolvedBy(resolvedBy);
        e.setResolvedAt(java.time.Instant.now());

        ErrorReportEntity saved = errorReportRepository.save(e);

        // Best-effort username extraction (do not change auth/session)
        String username = extractUsernameBestEffort(request);
        String correlationId = requestCorrelation.getCorrelationId();

        adminActivityAutoRecorder.recordAction(
                username,
                "RESOLVE_ERROR",
                "Resolved error report: " + id,
                request,
                correlationId
        );

        return Optional.of(toDto(saved));
    }

    private String extractUsernameBestEffort(HttpServletRequest request) {
        try {
            Object principal = request.getUserPrincipal() != null ? request.getUserPrincipal() : null;
            return principal != null ? principal.toString() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    private ErrorReportDto toDto(ErrorReportEntity e) {
        ErrorReportDto d = new ErrorReportDto();
        d.id = e.getId();
        d.timestampUtc = e.getTimestampUtc();

        d.severity = e.getSeverity();
        d.errorMessage = e.getErrorMessage();
        d.stacktrace = e.getStacktrace();

        d.jobId = e.getJobId();
        d.browser = e.getBrowser();
        d.operatingSystem = e.getOperatingSystem();

        d.minecraftVersion = e.getMinecraftVersion();
        d.loader = e.getLoader();
        d.modpackName = e.getModpackName();
        d.installedMods = e.getInstalledMods();

        d.applicationVersion = e.getApplicationVersion();
        d.logs = e.getLogs();
        d.userNotes = e.getUserNotes();

        d.resolved = e.isResolved();
        d.resolvedBy = e.getResolvedBy();
        d.resolvedAt = e.getResolvedAt();

        // Expose correlationId if DTO supports it; compile will validate field existence.
        try {
            var f = ErrorReportDto.class.getDeclaredField("correlationId");
            f.setAccessible(true);
            f.set(d, e.getCorrelationId());
        } catch (Exception ignored) {
            // DTO might not have correlationId yet; keep API stable.
        }

        return d;
    }
}