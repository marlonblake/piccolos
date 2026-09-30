package com.piccolos.backend.repository;

import com.example.piccolos.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface StaffOrderRepository extends JpaRepository<Order, Long> {

    @Query("select o from com.example.piccolos.entity.Order o " +
            "where upper(o.status) in (:statuses) order by o.id asc")
    List<Order> findActive(@Param("statuses") Collection<String> statuses);

    @Query("select o from com.example.piccolos.entity.Order o " +
            "where upper(o.status) in (:statuses) and upper(o.orderType) = :type order by o.id asc")
    List<Order> findActiveByType(@Param("statuses") Collection<String> statuses,
                                 @Param("type") String type);

    // Dine-in tickets for a table that are not cancelled and not yet invoiced
    @Query("select o from com.example.piccolos.entity.Order o " +
            "where o.tableId = :tableId and upper(o.orderType) = 'DINE_IN' " +
            "and upper(o.status) <> 'CANCELLED' " +
            "and not exists (select i.id from com.example.piccolos.entity.Invoice i where i.order = o) " +
            "order by o.id asc")
    List<Order> findOpenDineIn(@Param("tableId") Long tableId);
}