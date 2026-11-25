package com.example.piccolos.repository;

import com.example.piccolos.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Integer> {

    List<RestaurantTable> findByCapacityGreaterThanEqual(int capacity);

    List<RestaurantTable> findAllByOrderByTableNumberAsc();

    boolean existsByTableNumber(int tableNumber);

    boolean existsByTableNumberAndIdNot(int tableNumber, Integer id);

    @Query(value = "SELECT * FROM restaurant_tables WHERE id = :id FOR UPDATE", nativeQuery = true)
    Optional<RestaurantTable> findByIdForUpdate(@Param("id") Integer id);
}