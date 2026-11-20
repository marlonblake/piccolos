package com.example.piccolos.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "RESERVATIONS")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "guest_name")
    private String guestName;

    @Column(name = "guest_phone")
    private String guestPhone;

    @Column(name = "reservation_date")
    private LocalDate reservationDate;

    @Column(name = "reservation_time")
    private LocalTime reservationTime;

    @Column(name = "party_size")
    private Integer partySize;

    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne
    @JoinColumn(name = "table_id")
    private RestaurantTable restaurantTable;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getGuestName() { return guestName; }
    public void setGuestName(String guestName) { this.guestName = guestName; }

    public String getGuestPhone() { return guestPhone; }
    public void setGuestPhone(String guestPhone) { this.guestPhone = guestPhone; }

    public LocalDate getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDate reservationDate) { this.reservationDate = reservationDate; }

    public LocalTime getReservationTime() { return reservationTime; }
    public void setReservationTime(LocalTime reservationTime) { this.reservationTime = reservationTime; }

    public Integer getPartySize() { return partySize; }
    public void setPartySize(Integer partySize) { this.partySize = partySize; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public RestaurantTable getRestaurantTable() { return restaurantTable; }
    public void setRestaurantTable(RestaurantTable restaurantTable) { this.restaurantTable = restaurantTable; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}