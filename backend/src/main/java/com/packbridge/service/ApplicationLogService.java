package com.packbridge.service;

import com.packbridge.dto.ApplicationLogDto;
import com.packbridge.entity.ApplicationLogEntity;
import com.packbridge.repository.ApplicationLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class ApplicationLogService {

    private final ApplicationLogRepository applicationLogRepository;

    public ApplicationLogService(ApplicationLogRepository applicationLogRepository) {
        this.applicationLogRepository = applicationLogRepository;
    }

    public Page<ApplicationLogDto> search(
            String level,
            String logger,
            String message,
            String jobId,
            String requestPath,
            OffsetDateTime fromTs,
            OffsetDateTime toTs,
            Pageable pageable
    ) {
        Page<ApplicationLogEntity> page = applicationLogRepository.search(
                level,
                logger,
                message,
                jobId,
                requestPath,
                fromTs,
                toTs,
                pageable
        );

        return page.map(this::toDto);
    }

    public Optional<ApplicationLogDto> getById(UUID id) {
        return applicationLogRepository.findById(id).map(this::toDto);
    }

    public void deleteById(UUID id) {
        applicationLogRepository.deleteById(id);
    }

    private ApplicationLogDto toDto(ApplicationLogEntity e) {
        ApplicationLogDto dto = new ApplicationLogDto();
        dto.setId(e.getId());
        dto.setTimestampUtc(e.getTimestampUtc());
        dto.setLevel(e.getLevel());
        dto.setSource(e.getSource());
        dto.setLogger(e.getLogger());
        dto.setMessage(e.getMessage());
        dto.setExceptionText(e.getExceptionText());
        dto.setStacktrace(e.getStacktrace());
        dto.setJobId(e.getJobId());
        dto.setUserAgent(e.getUserAgent());
        dto.setRequestPath(e.getRequestPath());
        dto.setDurationMs(e.getExecutionDurationMs());
        dto.setThreadName(e.getThreadName());

        dto.setCorrelationId(e.getCorrelationId());

        return dto;
    }
}
