package com.example.piccolos.entity;

import jakarta.persistence.*;

@Entity
@Table(name="RESTAURANT_TABLES")
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private int tableNumber;
    private int capacity;

    //Getters and setters

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }

    public int getTableNumber() {
        return tableNumber;
    }
    public void setTableNumber(int tableNumber) {
        this.tableNumber = tableNumber;
    }

    public int getCapacity() {
        return capacity;
    }
    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }
}