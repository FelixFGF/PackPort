package com.packbridge.security;

import com.packbridge.config.AdminAuthProperties;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminAuthenticationProvider implements AuthenticationProvider {

    private final AdminAuthProperties adminAuthProperties;
    private final PasswordEncoder passwordEncoder;

    public AdminAuthenticationProvider(
            AdminAuthProperties adminAuthProperties,
            PasswordEncoder passwordEncoder
    ) {
        this.adminAuthProperties = adminAuthProperties;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication instanceof AdminAuthenticationToken token)) {
            return null;
        }

        String username = token.getUsername();
        String expectedUsername = adminAuthProperties.getUsername();

        if (username == null || !username.equals(expectedUsername)) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        // We don’t rely on credentials stored in the token (token.getCredentials() is empty),
        // so we pass the submitted password via credentials string in the token.
        // In our AdminLoginFilter we will store the submitted password into token.credentials.
        String submittedPassword = (String) token.getCredentials();
        if (submittedPassword == null || !passwordEncoder.matches(submittedPassword, adminAuthProperties.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        return new AdminAuthenticationToken(username, authentication.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return AdminAuthenticationToken.class.isAssignableFrom(authentication);
    }
}