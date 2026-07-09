package com.packbridge.controller;

import com.packbridge.dto.ApiResponse;
import com.packbridge.dto.ConversionRequestDto;
import com.packbridge.dto.ConversionResponseDto;
import com.packbridge.service.ConversionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ConversionController {

    private final ConversionService conversionService;

    public ConversionController(ConversionService conversionService) {
        this.conversionService = conversionService;
    }

    @PostMapping("/convert")
    public ResponseEntity<ApiResponse<ConversionResponseDto>> convert(
            @Valid @RequestBody ConversionRequestDto requestDto
    ) {
        ConversionResponseDto response = conversionService.convert(requestDto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Conversion report ready", response));
    }
}