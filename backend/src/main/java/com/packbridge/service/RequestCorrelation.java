package com.packbridge.service;

import com.packbridge.config.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

@Component
@RequestScope
public class RequestCorrelation {

    private final String correlationId;

    public RequestCorrelation(HttpServletRequest request) {
        this.correlationId = CorrelationIdFilter.getCorrelationId(request);
    }

    public String getCorrelationId() {
        return correlationId;
    }
}