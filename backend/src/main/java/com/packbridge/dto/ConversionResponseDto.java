package com.packbridge.dto;

public class ConversionResponseDto {

    private ConversionReportDto report;

    public ConversionResponseDto() {
    }

    public ConversionResponseDto(ConversionReportDto report) {
        this.report = report;
    }

    public ConversionReportDto getReport() {
        return report;
    }

    public void setReport(ConversionReportDto report) {
        this.report = report;
    }
}