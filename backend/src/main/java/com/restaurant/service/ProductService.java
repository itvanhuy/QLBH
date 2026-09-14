package com.restaurant.service;

import com.restaurant.dto.request.ProductRequest;
import com.restaurant.dto.response.PageResponse;
import com.restaurant.dto.response.ProductResponse;
import com.restaurant.entity.Product;

public interface ProductService {
    PageResponse<ProductResponse> getAllProducts(String keyword, Long categoryId, Product.Status status, int page, int size);
    ProductResponse getProductById(Long id);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
}
