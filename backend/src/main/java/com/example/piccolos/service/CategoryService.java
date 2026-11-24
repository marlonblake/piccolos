package com.example.piccolos.service;

import com.example.piccolos.entity.Category;
import com.example.piccolos.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    public Category updateCategory(Integer id, Category updated) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        existing.setName(updated.getName().trim());

        return categoryRepository.save(existing);
    }

    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Category not found");
        }

        categoryRepository.deleteById(id);
    }

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
