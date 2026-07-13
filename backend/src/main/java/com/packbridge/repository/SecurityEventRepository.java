package com.packbridge.repository;

import com.packbridge.security.entity.SecurityEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SecurityEventRepository extends JpaRepository<SecurityEventEntity, Long> {
}