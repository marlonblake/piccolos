package com.example.piccolos.controller;

import com.example.piccolos.entity.MenuItem;
import com.example.piccolos.service.MenuItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    // CUSTOMER MENU

    // Get all menu items
    @GetMapping("/menu")
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        return ResponseEntity.ok(menuItemService.getAllMenuItems());
    }



    // ADMIN MENU MANAGEMENT

    // Add a new menu item
    @PostMapping("/admin/menu")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> addMenuItem(
            @RequestBody MenuItem menuItem) {

        return ResponseEntity.ok(menuItemService.addMenuItem(menuItem));
    }


    // Update a menu item
    @PutMapping("/admin/menu/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable Integer id,
            @RequestBody MenuItem menuItem) {

        return ResponseEntity.ok(
                menuItemService.updateMenuItem(id, menuItem)
        );
    }


    // Delete a menu item
    @DeleteMapping("/admin/menu/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteMenuItem(
            @PathVariable Integer id) {

        menuItemService.deleteMenuItem(id);

        return ResponseEntity.ok("Menu item deleted successfully");
    }
}