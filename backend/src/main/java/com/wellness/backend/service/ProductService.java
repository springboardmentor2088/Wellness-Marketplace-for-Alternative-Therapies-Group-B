package com.wellness.backend.service;

import com.wellness.backend.dto.ProductRequestDTO;
import com.wellness.backend.dto.ProductResponseDTO;
import com.wellness.backend.exception.ForbiddenActionException;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.ProductEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.ProductRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    private final String UPLOAD_DIR = "uploads/products";

    public ProductResponseDTO createProduct(ProductRequestDTO request) throws IOException {
        if (request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than zero");
        }

        UserEntity provider = userRepository.findById(request.getProviderId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Provider not found with ID: " + request.getProviderId()));

        ProductEntity product = new ProductEntity();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setProvider(provider);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            product.setImageUrl(saveImage(request.getImage()));
        }

        ProductEntity saved = productRepository.save(product);
        return mapToResponseDTO(saved);
    }

    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO request) throws IOException {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        if (!product.getProvider().getId().equals(request.getProviderId())) {
            throw new ForbiddenActionException("Forbidden: You do not own this product");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            product.setImageUrl(saveImage(request.getImage()));
        }

        ProductEntity updated = productRepository.save(product);
        return mapToResponseDTO(updated);
    }

    public List<ProductResponseDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ProductResponseDTO> getProviderProducts(Long providerId) {
        return productRepository.findByProvider_Id(providerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public void deleteProduct(Long id, Long providerId) {
        ProductEntity product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        if (!product.getProvider().getId().equals(providerId)) {
            throw new ForbiddenActionException("Forbidden: You do not own this product");
        }

        productRepository.delete(product);
    }

    private String saveImage(MultipartFile file) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return "uploads/products/" + fileName;
    }

    private ProductResponseDTO mapToResponseDTO(ProductEntity entity) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setProductId(entity.getProductId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setProviderId(entity.getProvider().getId());

        String imgUrl = entity.getImageUrl();
        if (imgUrl != null && !imgUrl.startsWith("http")) {
            imgUrl = "http://localhost:8080/" + imgUrl;
        }
        dto.setImageUrl(imgUrl);

        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
