package com.example.piccolos.repository;

import com.example.piccolos.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface StaffOrderRepository extends JpaRepository<Order, Long> {

    @Query("select o from Order o where upper(o.status) in :statuses order by o.createdAt asc, o.id asc")
    List<Order> findActive(@Param("statuses") Collection<String> statuses);
}