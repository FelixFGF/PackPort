package com.packbridge.repository;

import com.packbridge.security.entity.ActiveAdminSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActiveAdminSessionRepository extends JpaRepository<ActiveAdminSessionEntity, String> {
}