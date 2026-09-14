package com.restaurant.service.impl;

import com.restaurant.dto.request.ProductRequest;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.dto.response.ProductResponse;
import com.restaurant.entity.Category;
import com.restaurant.entity.Product;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.CategoryRepository;
import com.restaurant.repository.ProductRepository;
import com.restaurant.service.ProductService;
import com.restaurant.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAllProducts(String keyword, Long categoryId,
                                                       Product.Status status, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String kw = StringUtils.hasText(keyword) ? keyword : null;

        Page<Product> productPage = productRepository.searchProducts(kw, categoryId, status, pageable);
        return PageResponse.of(productPage.map(ProductResponse::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return ProductResponse.fromEntity(findById(id));
    }

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Category category = findCategoryById(request.getCategoryId());

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .category(category)
                .status(parseStatus(request.getStatus(), Product.Status.AVAILABLE))
                .build();

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = findById(id);
        Category category = findCategoryById(request.getCategoryId());

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setCategory(category);
        product.setStatus(parseStatus(request.getStatus(), product.getStatus()));

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Override
    public void deleteProduct(Long id) {
        findById(id);
        productRepository.deleteById(id);
    }

    // ── Helpers ──────────────────────────────────────────

    private Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.PRODUCT_NOT_FOUND));
    }

    private Category findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.CATEGORY_NOT_FOUND));
    }

    private Product.Status parseStatus(String statusStr, Product.Status defaultValue) {
        if (!StringUtils.hasText(statusStr)) return defaultValue;
        try {
            return Product.Status.valueOf(statusStr);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái không hợp lệ: " + statusStr);
        }
    }
}
