package com.restaurant.service.impl;

import com.restaurant.dto.request.CategoryRequest;
import com.restaurant.dto.response.CategoryResponse;
import com.restaurant.entity.Category;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ConflictException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.CategoryRepository;
import com.restaurant.repository.ProductRepository;
import com.restaurant.service.CategoryService;
import com.restaurant.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return CategoryResponse.fromEntity(findById(id));
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ConflictException(AppConstants.CATEGORY_NAME_EXISTS);
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = findById(id);

        // Kiểm tra tên mới có trùng với category khác không
        if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new ConflictException(AppConstants.CATEGORY_NAME_EXISTS);
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) {
        findById(id);

        // Không cho xóa nếu còn product đang dùng category này
        if (productRepository.existsByCategoryId(id)) {
            throw new BadRequestException(AppConstants.CATEGORY_HAS_PRODUCTS);
        }

        categoryRepository.deleteById(id);
    }

    private Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(AppConstants.CATEGORY_NOT_FOUND));
    }
}
