package com.example.piccolos.dto;

public class DashboardStatsResponse {
    private long activeAdmins;
    private long registeredCustomers;
    private long activeOrders;
    private long activeMenuItems;

    // Getters and Setters
    public long getActiveAdmins() { return activeAdmins; }
    public void setActiveAdmins(long activeAdmins) { this.activeAdmins = activeAdmins; }

    public long getRegisteredCustomers() { return registeredCustomers; }
    public void setRegisteredCustomers(long registeredCustomers) { this.registeredCustomers = registeredCustomers; }

    public long getActiveOrders() { return activeOrders; }
    public void setActiveOrders(long activeOrders) { this.activeOrders = activeOrders; }

    public long getActiveMenuItems() { return activeMenuItems; }
    public void setActiveMenuItems(long activeMenuItems) { this.activeMenuItems = activeMenuItems; }
}