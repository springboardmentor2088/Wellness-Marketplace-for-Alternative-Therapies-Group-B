package com.wellness.backend.controller;

import com.wellness.backend.dto.ProductRequestDTO;
import com.wellness.backend.dto.ProductResponseDTO;
import com.wellness.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<ProductResponseDTO> createProduct(@ModelAttribute ProductRequestDTO request)
            throws IOException {
        ProductResponseDTO response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long id,
            @ModelAttribute ProductRequestDTO request) throws IOException {
        ProductResponseDTO response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/provider/{id}")
    public ResponseEntity<List<ProductResponseDTO>> getProviderProducts(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProviderProducts(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, @RequestParam Long providerId) {
        productService.deleteProduct(id, providerId);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }
}
