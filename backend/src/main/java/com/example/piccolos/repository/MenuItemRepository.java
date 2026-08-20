package com.example.piccolos.repository;

import com.example.piccolos.entity.Category;
import com.example.piccolos.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {

    List<MenuItem> findByCategory(Category category);
}
