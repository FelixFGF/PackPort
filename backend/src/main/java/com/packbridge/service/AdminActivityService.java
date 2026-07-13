package com.packbridge.service;

import com.packbridge.dto.AdminActivityDto;
import com.packbridge.entity.AdminActivityEntity;
import com.packbridge.repository.AdminActivityRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AdminActivityService {

    private final AdminActivityRepository adminActivityRepository;

    public AdminActivityService(AdminActivityRepository adminActivityRepository) {
        this.adminActivityRepository = adminActivityRepository;
    }

    public Page<AdminActivityDto> search(String username, String action, String description, Pageable pageable) {
        Page<AdminActivityEntity> page = adminActivityRepository.search(username, action, description, pageable);
        return page.map(this::toDto);
    }

    public Optional<AdminActivityDto> getById(UUID id) {
        return adminActivityRepository.findById(id).map(this::toDto);
    }

    private AdminActivityDto toDto(AdminActivityEntity a) {
        AdminActivityDto dto = new AdminActivityDto();
        dto.setId(a.getId());
        dto.setTimestampUtc(a.getTimestampUtc());
        dto.setUsername(a.getUsername());
        dto.setAction(a.getAction());
        dto.setDescription(a.getDescription());
        dto.setIpAddress(a.getIpAddress());
        dto.setBrowser(a.getBrowser());
        dto.setOperatingSystem(a.getOperatingSystem());
        dto.setSessionId(a.getSessionId());
        return dto;
    }
}