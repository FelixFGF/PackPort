package com.packbridge.repository;

import com.packbridge.model.ConversionJob;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryJobRepository implements JobRepository {

    private final Map<UUID, ConversionJob> jobs = new ConcurrentHashMap<>();

    @Override
    public Optional<ConversionJob> findById(UUID id) {
        return Optional.ofNullable(jobs.get(id));
    }

    @Override
    public Optional<ConversionJob> findByUploadId(UUID uploadId) {
        if (uploadId == null) return Optional.empty();
        return jobs.values().stream()
                .filter(j -> uploadId.equals(j.getUploadId()))
                .findFirst();
    }

    @Override
    public ConversionJob save(ConversionJob job) {
        if (job.getJobId() == null) {
            job.setJobId(UUID.randomUUID());
        }
        jobs.put(job.getJobId(), job);
        return job;
    }

    @Override
    public List<ConversionJob> findAll() {
        return new ArrayList<>(jobs.values());
    }
}
