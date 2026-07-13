package com.packbridge.repository;

import com.packbridge.entity.ErrorReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ErrorReportRepository extends JpaRepository<ErrorReportEntity, UUID> {
}