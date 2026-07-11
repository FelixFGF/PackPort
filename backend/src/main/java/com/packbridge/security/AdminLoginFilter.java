package com.packbridge.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

import java.io.IOException;
import java.util.Map;

public class AdminLoginFilter extends AbstractAuthenticationProcessingFilter {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AdminLoginFilter(String filterProcessesUrl) {
        super(new AntPathRequestMatcher(filterProcessesUrl, "POST"));
        setAuthenticationManager(authenticationManager -> {
            // handled by parent via setAuthenticationManager during config
            throw new AuthenticationServiceException("AuthenticationManager not set");
        });
        // Note: authenticationManager is injected via Spring Security config, so this constructor
        // only sets the request matcher.
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException, ServletException {

        String contentType = request.getContentType();
        if (contentType == null || !contentType.toLowerCase().contains(MediaType.APPLICATION_JSON_VALUE)) {
            // Still try to parse as JSON; many clients omit Content-Type.
        }

        Map<String, Object> body = objectMapper.readValue(request.getInputStream(), Map.class);

        String username = body.get("username") != null ? body.get("username").toString() : null;
        String password = body.get("password") != null ? body.get("password").toString() : null;

        return this.getAuthenticationManager().authenticate(
                new AdminAuthenticationToken(username) {
                    @Override
                    public Object getCredentials() {
                        return password;
                    }
                }
        );
    }

    @Override
    protected void successfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain,
            Authentication authResult
    ) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"success\":true}");
    }

    @Override
    protected void unsuccessfulAuthentication(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException failed
    ) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"success\":false,\"message\":\"Invalid username or password.\"}");
    }
}