package com.packbridge.service;

import com.packbridge.config.FileStorageProperties;
import com.packbridge.dto.UploadResponse;
import com.packbridge.exception.FileTypeValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    private static final String ZIP_EXTENSION = ".zip";
    private static final String MRPACK_EXTENSION = ".mrpack";

    private final Path fileStorageLocation;

    public FileUploadService(FileStorageProperties fileStorageProperties) {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getTempDir())
                .toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException(
                    "Could not create the directory where the uploaded files will be stored.",
                    ex
            );
        }
    }

    public UploadResponse uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileTypeValidationException("Uploaded file is empty.");
        }

        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String lowerName = originalFileName.toLowerCase();

        String allowedExtension = resolveAllowedExtension(lowerName);

        UUID uploadId = UUID.randomUUID();
        String storedFileName = uploadId + allowedExtension;

        Path targetFile = fileStorageLocation.resolve(storedFileName);
        Path metadataFile = fileStorageLocation.resolve(uploadId + ".meta");

        // Never overwrite existing files
        if (Files.exists(targetFile)) {
            throw new RuntimeException("Upload file already exists for generated uploadId. Please retry.");
        }

        try {
            // Cross-platform safe save: no COPY_ATTRIBUTES usage.
            // MultipartFile transferTo works on Windows/Linux.
            file.transferTo(targetFile.toFile());

            // Minimal metadata for deterministic cleanup
            String meta = ""
                    + "uploadId=" + uploadId + "\n"
                    + "originalFileName=" + originalFileName + "\n"
                    + "fileSize=" + file.getSize() + "\n"
                    + "uploadTimestamp=" + Instant.now() + "\n";
            Files.writeString(metadataFile, meta, StandardCharsets.UTF_8);

            logger.info(
                    "File uploaded successfully. uploadId={}, fileName={}, extension={}",
                    uploadId, originalFileName, allowedExtension
            );

            return new UploadResponse(uploadId, originalFileName, file.getSize(), "Success");
        } catch (IOException ex) {
            logger.error("Could not store file {} (uploadId {}). Please try again!", originalFileName, uploadId, ex);

            try {
                Files.deleteIfExists(targetFile);
            } catch (Exception ignored) {
            }
            try {
                Files.deleteIfExists(metadataFile);
            } catch (Exception ignored) {
            }

            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        } catch (Exception ex) {
            // MultipartFile#transferTo can throw other runtime exceptions depending on implementation.
            logger.error("Could not store file {} (uploadId {}). Please try again!", originalFileName, uploadId, ex);

            try {
                Files.deleteIfExists(targetFile);
            } catch (Exception ignored) {
            }
            try {
                Files.deleteIfExists(metadataFile);
            } catch (Exception ignored) {
            }

            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }

    /**
     * Deletes the uploaded file and its temporary metadata.
     * Must be idempotent: return success even if the file was already deleted.
     */
    public boolean deleteUpload(UUID uploadId) {
        if (uploadId == null) {
            return false;
        }

        boolean deletedAny = false;

        Path zipFile = fileStorageLocation.resolve(uploadId + ZIP_EXTENSION);
        Path mrpackFile = fileStorageLocation.resolve(uploadId + MRPACK_EXTENSION);
        Path metadataFile = fileStorageLocation.resolve(uploadId + ".meta");

        try {
            deletedAny |= Files.deleteIfExists(zipFile);
        } catch (IOException e) {
            logger.warn("Failed to delete zip upload file {}: {}", zipFile, e.getMessage());
        }

        try {
            deletedAny |= Files.deleteIfExists(mrpackFile);
        } catch (IOException e) {
            logger.warn("Failed to delete mrpack upload file {}: {}", mrpackFile, e.getMessage());
        }

        try {
            deletedAny |= Files.deleteIfExists(metadataFile);
        } catch (IOException e) {
            logger.warn("Failed to delete upload metadata file {}: {}", metadataFile, e.getMessage());
        }

        // Requirement: return success even if already deleted
        return true;
    }

    private String resolveAllowedExtension(String lowerFileName) {
        if (lowerFileName.endsWith(ZIP_EXTENSION)) {
            return ZIP_EXTENSION;
        }
        if (lowerFileName.endsWith(MRPACK_EXTENSION)) {
            return MRPACK_EXTENSION;
        }
        throw new FileTypeValidationException("Only .zip and .mrpack files are allowed.");
    }
}
