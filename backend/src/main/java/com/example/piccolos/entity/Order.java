package com.example.piccolos.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guest_name", length = 100)
    private String guestName;

    @Column(name = "guest_phone", length = 20)
    private String guestPhone;

    @Column(name = "pickup_date")
    private LocalDate pickupDate;

    @Column(name = "pickup_time")
    private LocalTime pickupTime;

    @Column(name = "order_type")
    private String orderType = "PICKUP";

    private String status = "PENDING";

    @Column(name = "table_id")
    private Long tableId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    private Double subtotal;

    @Column(name = "tax_and_fees")
    private Double taxAndFees;

    @Column(name = "total_amount")
    private Double totalAmount;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public LocalTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalTime pickupTime) { this.pickupTime = pickupTime; }

    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getTableId() { return tableId; }
    public void setTableId(Long tableId) { this.tableId = tableId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getTaxAndFees() { return taxAndFees; }
    public void setTaxAndFees(Double taxAndFees) { this.taxAndFees = taxAndFees; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
}