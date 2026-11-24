package com.example.piccolos.service;

import com.example.piccolos.entity.Category;
import com.example.piccolos.entity.MenuItem;
import com.example.piccolos.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public MenuItemService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    // Get all menu items
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    // Get menu items belonging to a specific category
    public List<MenuItem> getMenuItemsByCategory(Category category) {
        return menuItemRepository.findByCategory(category);
    }

    // Get one menu item by ID
    public Optional<MenuItem> getMenuItemById(Integer id) {
        return menuItemRepository.findById(id);
    }

    // Add a new menu item
    public MenuItem addMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    // Update an existing menu item
    public MenuItem updateMenuItem(Integer id, MenuItem updatedItem) {

        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        existingItem.setName(updatedItem.getName());
        existingItem.setDescription(updatedItem.getDescription());
        existingItem.setPrice(updatedItem.getPrice());
        existingItem.setCategory(updatedItem.getCategory());
        existingItem.setImageUrl(updatedItem.getImageUrl());

        return menuItemRepository.save(existingItem);
    }

    // Delete a menu item
    public void deleteMenuItem(Integer id) {

        if (!menuItemRepository.existsById(id)) {
            throw new RuntimeException("Menu item not found");
        }

        menuItemRepository.deleteById(id);
    }
}