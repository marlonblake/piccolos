package com.example.piccolos.service;

import com.example.piccolos.entity.Category;
import com.example.piccolos.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    // Get all categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Add a new category
    public Category addCategory(Category category) {
        return categoryRepository.save(category);
    }
}
