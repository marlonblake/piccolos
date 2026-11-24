package com.example.piccolos.service;

import com.example.piccolos.dto.RestaurantTableRequest;
import com.example.piccolos.dto.RestaurantTableResponse;
import com.example.piccolos.entity.RestaurantTable;
import com.example.piccolos.repository.ReservationRepository;
import com.example.piccolos.repository.RestaurantTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class RestaurantTableService {

    private final RestaurantTableRepository tableRepository;
    private final ReservationRepository reservationRepository;

    public RestaurantTableService(
            RestaurantTableRepository tableRepository,
            ReservationRepository reservationRepository
    ) {
        this.tableRepository = tableRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<RestaurantTableResponse> getTables() {
        return tableRepository.findAllByOrderByTableNumberAsc().stream()
                .map(RestaurantTableResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public RestaurantTableResponse getTable(Integer id) {
        RestaurantTable table = tableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found."));
        return new RestaurantTableResponse(table);
    }

    @Transactional
    public RestaurantTableResponse createTable(RestaurantTableRequest request) {
        if (tableRepository.existsByTableNumber(request.tableNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Table number is already in use.");
        }

        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(request.tableNumber());
        table.setCapacity(request.capacity());
        return new RestaurantTableResponse(tableRepository.save(table));
    }

    @Transactional
    public RestaurantTableResponse updateTable(Integer id, RestaurantTableRequest request) {
        RestaurantTable table = tableRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found."));

        if (tableRepository.existsByTableNumberAndIdNot(request.tableNumber(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Table number is already in use.");
        }
        if (reservationRepository.existsByRestaurantTableIdAndReservationDateGreaterThanEqualAndPartySizeGreaterThan(
                id, LocalDate.now(), request.capacity())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Capacity cannot be lower than the party size of an upcoming reservation."
            );
        }

        table.setTableNumber(request.tableNumber());
        table.setCapacity(request.capacity());
        return new RestaurantTableResponse(tableRepository.save(table));
    }

    @Transactional
    public void deleteTable(Integer id) {
        RestaurantTable table = tableRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Table not found."));

        if (reservationRepository.existsByRestaurantTableId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Table cannot be deleted while it has reservations."
            );
        }

        tableRepository.delete(table);
    }
}
