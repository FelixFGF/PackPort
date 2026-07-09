package com.packbridge.util;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;

@Component
public class FileCleanupService {

    private static final Logger logger = LoggerFactory.getLogger(FileCleanupService.class);

    @Value("${file.upload.tempDir}")
    private String tempDir;

    @Value("${file.upload.tempExpirationMinutes:30}")
    private long expirationMinutes;

    @PostConstruct
    public void init() {
        try {
            Path path = Paths.get(tempDir);

            if (!Files.exists(path)) {
                Files.createDirectories(path);
                logger.info("Created temporary directory: {}", tempDir);
            }

        } catch (IOException e) {
            logger.error("Could not create temporary directory: {}", tempDir, e);
        }
    }

    /**
     * Runs every 10 minutes.
     * Deletes uploaded archives and extracted folders older than the configured expiration time.
     */
    @Scheduled(fixedRate = 600000)
    public void cleanupOldFiles() {

        logger.info("Starting cleanup of old temporary files in: {}", tempDir);

        Path directory = Paths.get(tempDir);

        if (!Files.exists(directory)) {
            logger.warn("Temporary directory does not exist: {}", tempDir);
            return;
        }

        Instant expirationTime =
                Instant.now().minus(expirationMinutes, ChronoUnit.MINUTES);

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory)) {

            for (Path path : stream) {

                try {

                    Instant lastModified =
                            Files.getLastModifiedTime(path).toInstant();

                    if (lastModified.isAfter(expirationTime)) {
                        continue;
                    }

                    if (Files.isDirectory(path)) {

                        Files.walk(path)
                                .sorted(Comparator.reverseOrder())
                                .forEach(p -> {
                                    try {
                                        Files.deleteIfExists(p);
                                        logger.info("Deleted {}", p);
                                    } catch (IOException e) {
                                        logger.warn("Could not delete {}", p, e);
                                    }
                                });

                    } else {

                        String name = path.getFileName().toString().toLowerCase();

                        if (name.endsWith(".zip")
                                || name.endsWith(".mrpack")) {

                            Files.deleteIfExists(path);
                            logger.info("Deleted archive {}", path);
                        }
                    }

                } catch (IOException e) {
                    logger.warn("Cleanup failed for {}", path, e);
                }
            }

        } catch (IOException e) {
            logger.error("Error listing files in temporary directory {}", tempDir, e);
        }

        logger.info("Finished cleanup of old temporary files.");
    }

    /**
     * Deletes the complete temporary directory recursively.
     * Can be used on application shutdown if needed.
     */
    public void deleteTemporaryDirectory() {

        Path directory = Paths.get(tempDir);

        if (!Files.exists(directory)) {
            return;
        }

        try {

            Files.walk(directory)
                    .sorted(Comparator.reverseOrder())
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                            logger.debug("Deleted {}", path);
                        } catch (IOException e) {
                            logger.warn("Could not delete {}", path, e);
                        }
                    });

            logger.info("Deleted temporary directory: {}", tempDir);

        } catch (IOException e) {
            logger.error("Error deleting temporary directory {}", tempDir, e);
        }
    }
}