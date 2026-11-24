package com.example.piccolos.controller;

import com.example.piccolos.entity.Category;
import com.example.piccolos.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;

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

    //update a category
    @PutMapping("/admin/categories/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Integer id,
            @RequestBody Category category) {

        if (category.getName() == null || category.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Category name is required");
        }

        try {
            return ResponseEntity.ok(categoryService.updateCategory(id, category));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A category with that name already exists");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    //delete a category
    @DeleteMapping("/admin/categories/{id}")
    public ResponseEntity<String> deleteCategory(@PathVariable Integer id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok("Category deleted successfully");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("This category still has menu items. Move or delete them first.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}