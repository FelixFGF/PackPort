package com.packbridge.repository;

import com.packbridge.entity.AnalyticsEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface AnalyticsEventRepository extends JpaRepository<AnalyticsEventEntity, Long> {

    List<AnalyticsEventEntity> findTop500ByTimestampUtcBetweenOrderByTimestampUtcDesc(Instant start, Instant end);

    List<AnalyticsEventEntity> findTop1000ByOrderByTimestampUtcDesc();

}