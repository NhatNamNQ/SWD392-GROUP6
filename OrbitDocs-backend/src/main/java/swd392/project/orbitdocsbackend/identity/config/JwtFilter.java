package swd392.project.orbitdocsbackend.identity.config;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.UserRepository;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IJwtService;
import swd392.project.orbitdocsbackend.identity.dto.user.CustomUserDetails;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.identity.services.cache.RedisTokenServiceImpl;

import java.io.IOException;

@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final IJwtService jwtService;
    private final RedisTokenServiceImpl redisTokenService;
    private final UserRepository userRepository;
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ") || request.getServletPath().startsWith("/api/auth/login") || request.getServletPath().startsWith("/api/auth/refresh")) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = header.substring(7);

        String path = request.getServletPath();

        if (path.startsWith("/api/auth/") && !path.equals("/api/auth/force-change-password")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            String jti = jwtService.extractJwtId(token);

            if (redisTokenService.isBlacklisted(jti)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

            String fullName = jwtService.extractUsername(token);
            User user = userRepository.findByFullName(fullName)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDetails userDetails = new CustomUserDetails(user);
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (fullName != null && authentication == null) {
                if (jwtService.isTokenValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                    );
                    usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                }else {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }
}