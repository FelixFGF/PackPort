package com.packbridge.repository;

import com.packbridge.entity.AdminActivityEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface AdminActivityRepository extends JpaRepository<AdminActivityEntity, UUID> {

    @Query("""
           select a from AdminActivityEntity a
           where (:username is null or lower(a.username) like lower(concat('%', :username, '%')))
             and (:action is null or lower(a.action) = lower(:action))
             and (:description is null or lower(a.description) like lower(concat('%', :description, '%')))
           order by a.timestampUtc desc
           """)
    Page<AdminActivityEntity> search(
            String username,
            String action,
            String description,
            Pageable pageable
    );
}