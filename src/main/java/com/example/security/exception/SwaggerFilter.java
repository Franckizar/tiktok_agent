package com.example.security.exception;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class SwaggerFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String uri = httpRequest.getRequestURI();

        // Check if this is a Swagger/OpenAPI request
        boolean isSwaggerRequest = uri.contains("/swagger-ui") ||
                uri.contains("/v3/api-docs") ||
                uri.contains("/api-docs") ||
                uri.contains("/swagger-resources") ||
                uri.contains("/webjars") ||
                uri.contains("/swagger-ui.html") ||
                uri.endsWith("/v3/api-docs.yaml");

        if (isSwaggerRequest) {
            // Set attribute to skip exception handling
            httpRequest.setAttribute("skipExceptionHandling", true);
        }

        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Initialization if needed
    }

    @Override
    public void destroy() {
        // Cleanup if needed
    }
}