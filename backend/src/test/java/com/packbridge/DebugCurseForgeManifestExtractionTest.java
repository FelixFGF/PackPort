package com.packbridge;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.packbridge.dto.curseforge.CurseForgeManifestDto;
import com.packbridge.dto.curseforge.FileEntry;
import com.packbridge.dto.curseforge.ModLoader;
import com.packbridge.dto.curseforge.MinecraftInfo;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

public class DebugCurseForgeManifestExtractionTest {

  @Test
  void debugExtractManifestFromUploadZip() throws Exception {
    UUID uploadId = UUID.fromString("40bf6f58-a1fd-4751-8772-124100d739de");

    // Tests run with backend as working dir.
    Path zipPath = Paths.get("temp_uploads", uploadId.toString() + ".zip")
        .toAbsolutePath()
        .normalize();

    // Fallback: relative to repo root
    if (!Files.exists(zipPath)) {
      zipPath = Paths.get("backend", "temp_uploads", uploadId.toString() + ".zip")
          .toAbsolutePath()
          .normalize();
    }

    // Skip if no local test data exists
    Assumptions.assumeTrue(Files.exists(zipPath), "ZIP not present locally, skipping debug test: " + zipPath);

    try (ZipFile zipFile = new ZipFile(zipPath.toFile())) {
      List<? extends ZipEntry> manifestEntries = zipFile.stream()
          .filter(e -> !e.isDirectory() && e.getName() != null && e.getName().endsWith("manifest.json"))
          .sorted(Comparator
              .comparingInt((ZipEntry e) -> e.getName().contains("/") ? 1 : 0)
              .thenComparing(ZipEntry::getName))
          .toList();

      System.out.println("ZIP=" + zipPath);
      System.out.println("manifest.json entries=" + manifestEntries.size());

      Assumptions.assumeTrue(!manifestEntries.isEmpty(), "manifest.json not found inside zip: " + zipPath);

      ZipEntry manifestEntry = manifestEntries.get(0);
      System.out.println("using manifest entry=" + manifestEntry.getName());

      try (InputStream is = zipFile.getInputStream(manifestEntry)) {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        CurseForgeManifestDto dto = mapper.readValue(is, CurseForgeManifestDto.class);

        System.out.println("=== DESERIALIZED CurseForgeManifestDto ===");
        System.out.println("name=" + dto.getName());
        System.out.println("version=" + dto.getVersion());
        System.out.println("author=" + dto.getAuthor());

        MinecraftInfo mc = dto.getMinecraft();
        System.out.println("minecraft.version=" + (mc == null ? null : mc.getVersion()));

        List<ModLoader> modLoaders = (mc == null ? null : mc.getModLoaders());
        System.out.println("minecraft.modLoaders count=" + (modLoaders == null ? null : modLoaders.size()));

        if (modLoaders != null) {
          for (int i = 0; i < modLoaders.size(); i++) {
            ModLoader ml = modLoaders.get(i);
            System.out.println("minecraft.modLoaders[" + i + "].id=" + ml.getId());
            System.out.println("minecraft.modLoaders[" + i + "].primary=" + ml.isPrimary());
          }
        }

        List<FileEntry> files = dto.getFiles();
        System.out.println("files count=" + (files == null ? null : files.size()));

        if (files != null) {
          for (int i = 0; i < files.size(); i++) {
            FileEntry f = files.get(i);
            System.out.println(
                "files[" + i + "]: projectID=" + f.getProjectID()
                    + ", fileID=" + f.getFileID()
                    + ", required=" + f.isRequired()
                    + ", isLocked=" + f.isLocked()
            );
            if (i >= 5) {
              System.out.println("(printing truncated after first 6 entries)");
              break;
            }
          }
        }
      }
    }
  }
}