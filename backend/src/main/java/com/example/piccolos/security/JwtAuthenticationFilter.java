package com.example.piccolos.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Look for the "Authorization" header in the incoming request
        final String authHeader = request.getHeader("Authorization");

        // 2. If it's missing or doesn't start with "Bearer ", it's not a JWT request. Move on.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extract the token (remove the "Bearer " prefix)
        final String token = authHeader.substring(7);

        // 4. Validate the token
        if (jwtUtil.isTokenValid(token)) {
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);

            // 5. Tell Spring Security: "This person is legitimate!"
            // We append "ROLE_" because Spring Security looks for that exact format by default
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);

            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    email, null, Collections.singletonList(authority));

            // Save the user's details in the Security Context so the rest of the app knows who is logged in
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        // 6. Continue processing the request
        filterChain.doFilter(request, response);
    }
}
