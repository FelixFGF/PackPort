package com.packbridge.repository;

import com.packbridge.entity.ApplicationLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ApplicationLogRepository extends JpaRepository<ApplicationLogEntity, UUID> {

    @Query("""
           select l from ApplicationLogEntity l
           where (:level is null or l.level = :level)
             and (:logger is null or lower(l.logger) like lower(concat('%', :logger, '%')))
             and (:message is null or lower(l.message) like lower(concat('%', :message, '%')))
             and (:jobId is null or lower(l.jobId) like lower(concat('%', :jobId, '%')))
             and (:requestPath is null or lower(l.requestPath) like lower(concat('%', :requestPath, '%')))
             and (:fromTs is null or l.timestampUtc >= :fromTs)
             and (:toTs is null or l.timestampUtc <= :toTs)
           order by l.timestampUtc desc
           """)
    Page<ApplicationLogEntity> search(
            String level,
            String logger,
            String message,
            String jobId,
            String requestPath,
            java.time.OffsetDateTime fromTs,
            java.time.OffsetDateTime toTs,
            Pageable pageable
    );
}