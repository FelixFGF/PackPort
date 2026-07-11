package com.packbridge.config;

import com.packbridge.security.AdminSessionAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AdminSessionAuthFilter adminSessionAuthFilter() {
        return new AdminSessionAuthFilter();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout.disable());

        // Enforce backend auth via AdminSessionAuthFilter (no Spring SecurityContext).
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/health", "/").permitAll()
                .requestMatchers("/api/admin/login", "/api/admin/session").permitAll()
                // everything else is permitted here, but filter will block unauthorized admin access
                .anyRequest().permitAll()
            );

        // Ensure our filter runs early for /api/admin/**
        http.addFilterBefore(adminSessionAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}