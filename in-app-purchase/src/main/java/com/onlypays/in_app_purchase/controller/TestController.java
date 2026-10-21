package com.onlypays.in_app_purchase.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Test endpoint to verify environment health and hot reloading in development.
 */
@RestController
@RequestMapping("/api/v1/test")
public class TestController {

    @Value("${spring.application.name:in-app-purchase}")
    private String appName;

    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", appName,
                "message", "In-App Purchase Service is operational with live hot reloading enabled!",
                "timestamp", Instant.now().toString()
        ));
    }
}
