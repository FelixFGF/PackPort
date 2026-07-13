package com.packbridge.dto;

import java.time.LocalDate;

public class AnalyticsHistoryDto {

    public static class Daily {
        private LocalDate date;
        private Long visitors;
        private Long uploads;
        private Long downloads;
        private Long conversions;
        private Long conversionsSuccessful;
        private Long conversionsFailed;

        public Daily() {
        }

        public Daily(LocalDate date, Long visitors, Long uploads, Long downloads, Long conversions,
                     Long conversionsSuccessful, Long conversionsFailed) {
            this.date = date;
            this.visitors = visitors;
            this.uploads = uploads;
            this.downloads = downloads;
            this.conversions = conversions;
            this.conversionsSuccessful = conversionsSuccessful;
            this.conversionsFailed = conversionsFailed;
        }

        public LocalDate getDate() {
            return date;
        }

        public void setDate(LocalDate date) {
            this.date = date;
        }

        public Long getVisitors() {
            return visitors;
        }

        public void setVisitors(Long visitors) {
            this.visitors = visitors;
        }

        public Long getUploads() {
            return uploads;
        }

        public void setUploads(Long uploads) {
            this.uploads = uploads;
        }

        public Long getDownloads() {
            return downloads;
        }

        public void setDownloads(Long downloads) {
            this.downloads = downloads;
        }

        public Long getConversions() {
            return conversions;
        }

        public void setConversions(Long conversions) {
            this.conversions = conversions;
        }

        public Long getConversionsSuccessful() {
            return conversionsSuccessful;
        }

        public void setConversionsSuccessful(Long conversionsSuccessful) {
            this.conversionsSuccessful = conversionsSuccessful;
        }

        public Long getConversionsFailed() {
            return conversionsFailed;
        }

        public void setConversionsFailed(Long conversionsFailed) {
            this.conversionsFailed = conversionsFailed;
        }
    }
}