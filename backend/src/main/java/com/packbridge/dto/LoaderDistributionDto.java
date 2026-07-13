package com.packbridge.dto;

public class LoaderDistributionDto {
    private long fabric;
    private long forge;
    private long neoforge;
    private long quilt;
    private long unknown;

    public LoaderDistributionDto() {
    }

    public long getFabric() {
        return fabric;
    }

    public void setFabric(long fabric) {
        this.fabric = fabric;
    }

    public long getForge() {
        return forge;
    }

    public void setForge(long forge) {
        this.forge = forge;
    }

    public long getNeoforge() {
        return neoforge;
    }

    public void setNeoforge(long neoforge) {
        this.neoforge = neoforge;
    }

    public long getQuilt() {
        return quilt;
    }

    public void setQuilt(long quilt) {
        this.quilt = quilt;
    }

    public long getUnknown() {
        return unknown;
    }

    public void setUnknown(long unknown) {
        this.unknown = unknown;
    }
}