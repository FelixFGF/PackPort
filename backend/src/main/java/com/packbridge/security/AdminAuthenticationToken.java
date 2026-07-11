package com.packbridge.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.AuthorityUtils;

import java.util.Collection;

public class AdminAuthenticationToken extends AbstractAuthenticationToken {

    private final String username;

    public AdminAuthenticationToken(String username) {
        super(AuthorityUtils.NO_AUTHORITIES);
        this.username = username;
        setAuthenticated(false);
    }

    public AdminAuthenticationToken(String username, Collection authorities) {
        super(authorities);
        this.username = username;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return "";
    }

    @Override
    public Object getPrincipal() {
        return username;
    }

    public String getUsername() {
        return username;
    }
}