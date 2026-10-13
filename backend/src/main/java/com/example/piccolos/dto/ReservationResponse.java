package com.example.piccolos.dto;

import com.example.piccolos.entity.Reservation;

public class ReservationResponse {

    private Integer reservationId;
    private String guestName;
    private String guestPhone;
    private Integer partySize;
    private Integer tableId;
    private Integer tableNumber;
    private Integer tableCapacity;
    private Integer userId;
    private String reservationDate;
    private String reservationTime;

    public ReservationResponse(Reservation reservation) {
        this.reservationId = reservation.getId();
        this.guestName = reservation.getGuestName();
        this.guestPhone = reservation.getGuestPhone();
        this.partySize = reservation.getPartySize();

        if (reservation.getRestaurantTable() != null) {
            this.tableId = reservation.getRestaurantTable().getId();
            this.tableNumber = reservation.getRestaurantTable().getTableNumber();
            this.tableCapacity = reservation.getRestaurantTable().getCapacity();
        }

        if (reservation.getUser() != null) {
            this.userId = reservation.getUser().getId();
        }

        if (reservation.getReservationDate() != null) {
            this.reservationDate = reservation.getReservationDate().toString();
        }

        if (reservation.getReservationTime() != null) {
            this.reservationTime = reservation.getReservationTime().toString();
        }
    }

    public Integer getReservationId() {
        return reservationId;
    }

    public String getGuestName() {
        return guestName;
    }

    public String getGuestPhone() {
        return guestPhone;
    }

    public Integer getPartySize() {
        return partySize;
    }

    public Integer getTableId() {
        return tableId;
    }

    public Integer getTableNumber() {
        return tableNumber;
    }

    public Integer getTableCapacity() {
        return tableCapacity;
    }

    public Integer getUserId() {
        return userId;
    }

    public String getReservationDate() {
        return reservationDate;
    }

    public String getReservationTime() {
        return reservationTime;
    }
}