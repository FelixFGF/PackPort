package com.packbridge.service;

import com.packbridge.model.ConversionJob;
import com.packbridge.repository.JobRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class JobService {

    private final JobRepository jobRepository;

    public JobService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public Optional<ConversionJob> getJob(UUID jobId) {
        return jobRepository.findById(jobId);
    }

    public Optional<ConversionJob> getJobByUploadId(UUID uploadId) {
        return jobRepository.findByUploadId(uploadId);
    }

    public ConversionJob createJob(UUID uploadId) {
        ConversionJob job = new ConversionJob();
        job.setUploadId(uploadId);
        job.setProgress(0);
        job.setCreatedAt(Instant.now());

        jobRepository.save(job);

        return job;
    }

    public ConversionJob saveJob(ConversionJob job) {
        if (job == null) return null;
        return jobRepository.save(job);
    }
}