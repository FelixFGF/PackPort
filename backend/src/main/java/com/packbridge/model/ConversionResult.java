package com.packbridge.model;

import java.util.List;

public class ConversionResult {
    private List<String> convertedMods;
    private List<String> removedMods;
    private String outputFileName;

    public ConversionResult() {}

    public ConversionResult(List<String> convertedMods, List<String> removedMods, String outputFileName) {
        this.convertedMods = convertedMods;
        this.removedMods = removedMods;
        this.outputFileName = outputFileName;
    }

    public List<String> getConvertedMods() {
        return convertedMods;
    }

    public void setConvertedMods(List<String> convertedMods) {
        this.convertedMods = convertedMods;
    }

    public List<String> getRemovedMods() {
        return removedMods;
    }

    public void setRemovedMods(List<String> removedMods) {
        this.removedMods = removedMods;
    }

    public String getOutputFileName() {
        return outputFileName;
    }

    public void setOutputFileName(String outputFileName) {
        this.outputFileName = outputFileName;
    }
}