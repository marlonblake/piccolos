package com.example.piccolos.controller;

import com.example.piccolos.entity.Category;
import com.example.piccolos.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Get all categories
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    // Add a new category
    @PostMapping("/admin/categories")
    public ResponseEntity<Category> addCategory(
            @RequestBody Category category) {

        return ResponseEntity.ok(categoryService.addCategory(category));
    }
}