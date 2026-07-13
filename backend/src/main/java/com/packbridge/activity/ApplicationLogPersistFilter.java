package com.packbridge.activity;

import com.packbridge.config.CorrelationIdFilter;
import com.packbridge.entity.ApplicationLogEntity;
import com.packbridge.repository.ApplicationLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.OffsetDateTime;
import java.util.UUID;

@Component
public class ApplicationLogPersistFilter extends OncePerRequestFilter {

    private final ApplicationLogRepository applicationLogRepository;

    // Requirements defaults (configurable later)
    private static final long SLOW_REQUEST_THRESHOLD_MS = 1000L;
    private static final boolean PERSIST_WARN_AND_ABOVE = true;

    public ApplicationLogPersistFilter(ApplicationLogRepository applicationLogRepository) {
        this.applicationLogRepository = applicationLogRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI() == null;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        long startNanos = System.nanoTime();
        String correlationId = (String) request.getAttribute(CorrelationIdFilter.CORRELATION_ID_ATTR);

        try {
            filterChain.doFilter(request, response);
        } catch (Throwable t) {
            persistErrorLog(request, response, correlationId, t);
            throw t;
        } finally {
            long durationMs = (System.nanoTime() - startNanos) / 1_000_000;
            persistRequestLogIfNeeded(request, response, correlationId, durationMs);
        }
    }

    private void persistErrorLog(
            HttpServletRequest request,
            HttpServletResponse response,
            String correlationId,
            Throwable t
    ) {
        try {
            ApplicationLogEntity e = baseEntity(request, response, correlationId);
            e.setLevel("ERROR");
            e.setSource("web");
            e.setLogger("packbridge");
            e.setMessage(t.getMessage() != null ? t.getMessage() : "Unhandled exception");
            e.setExceptionText(t.getClass().getName());
            e.setStacktrace(stacktraceToString(t));
            // ensure status indicates failure
            Integer status = response.getStatus();
            e.setResponseStatus(status != null ? status : 500);

            e.setExecutionDurationMs(null); // request duration will be set in normal path
            applicationLogRepository.save(e);
        } catch (Exception ignore) {
            // never break production requests due to log persistence
        }
    }

    private void persistRequestLogIfNeeded(
            HttpServletRequest request,
            HttpServletResponse response,
            String correlationId,
            long durationMs
    ) {
        try {
            String levelToPersist = null;

            int status = response.getStatus();
            String path = request.getRequestURI();

            boolean isAdminApi = path != null && path.startsWith("/api/admin/");
            boolean isUploadApi = path != null && path.startsWith("/api/upload");
            boolean isConversionApi = path != null && path.startsWith("/api/conversion");
            boolean isErrorReportApi = path != null && path.startsWith("/errors/report");

            boolean statusBad = status >= 400;
            boolean slow = durationMs > SLOW_REQUEST_THRESHOLD_MS;

            // Persist rules:
            // - ERROR/WARN always in this filter are derived from conditions (WARN = slow or status 4xx/5xx threshold without ERROR)
            // - Always persist admin/upload/conversion/error-report endpoints
            if (isAdminApi || isUploadApi || isConversionApi || isErrorReportApi) {
                // default severity for these categories
                levelToPersist = (status >= 500 || statusBad) ? "ERROR" : "WARN";
            } else if (status >= 500) {
                levelToPersist = "ERROR";
            } else if (statusBad) {
                levelToPersist = PERSIST_WARN_AND_ABOVE ? "WARN" : null;
            } else if (slow) {
                levelToPersist = PERSIST_WARN_AND_ABOVE ? "WARN" : null;
            }

            if (levelToPersist == null) return;

            ApplicationLogEntity e = baseEntity(request, response, correlationId);
            e.setLevel(levelToPersist);
            e.setSource("web");
            e.setLogger("packbridge");
            e.setMessage(null);
            e.setExceptionText(null);
            e.setStacktrace(null);

            e.setRequestPath(request.getRequestURI());
            e.setHttpMethod(request.getMethod());
            e.setResponseStatus(status);

            e.setExecutionDurationMs(durationMs);

            applicationLogRepository.save(e);

        } catch (Exception ignore) {
            // never break production requests due to log persistence
        }
    }

    private ApplicationLogEntity baseEntity(
            HttpServletRequest request,
            HttpServletResponse response,
            String correlationId
    ) {
        ApplicationLogEntity e = new ApplicationLogEntity();
        e.setId(UUID.randomUUID());
        e.setTimestampUtc(OffsetDateTime.now());

        Integer status = response.getStatus();
        e.setResponseStatus(status);

        e.setCorrelationId(correlationId);
        e.setRequestPath(request.getRequestURI());
        e.setHttpMethod(request.getMethod());

        e.setUserAgent(request.getHeader("User-Agent"));
        e.setBrowser(null);
        e.setOperatingSystem(null);

        // Best-effort thread name and session
        e.setThreadName(Thread.currentThread().getName());

        // Job ID (if frontend/backend sends it)
        String jobId = request.getHeader("X-Job-Id");
        if (jobId == null || jobId.isBlank()) {
            jobId = request.getParameter("jobId");
        }
        e.setJobId(jobId);

        return e;
    }

    private String stacktraceToString(Throwable t) {
        try {
            // Avoid Apache Commons Lang dependency; keep production logging robust.
            StringWriter sw = new StringWriter();
            PrintWriter pw = new PrintWriter(sw);
            t.printStackTrace(pw);
            pw.flush();
            return sw.toString();
        } catch (Throwable ignore) {
            return t.getClass().getName() + ": " + (t.getMessage() != null ? t.getMessage() : "");
        }
    }
}