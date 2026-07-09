package com.packbridge.repository;

import com.packbridge.model.ConversionJob;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobRepository {
    Optional<ConversionJob> findById(UUID id);

    // Needed for verification without requiring the frontend-side jobId.
    Optional<ConversionJob> findByUploadId(UUID uploadId);

    ConversionJob save(ConversionJob job);

    List<ConversionJob> findAll();
}
