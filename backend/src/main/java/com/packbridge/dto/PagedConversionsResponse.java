package com.packbridge.dto;

import java.util.List;

public class PagedConversionsResponse {
    private List<ConversionDto> items;
    private long total;
    private int page;
    private int pageSize;

    public PagedConversionsResponse() {}

    public PagedConversionsResponse(List<ConversionDto> items, long total, int page, int pageSize) {
        this.items = items;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
    }

    public List<ConversionDto> getItems() {
        return items;
    }

    public void setItems(List<ConversionDto> items) {
        this.items = items;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}