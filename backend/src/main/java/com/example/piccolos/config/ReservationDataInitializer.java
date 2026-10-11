package com.example.piccolos.config;

import com.example.piccolos.entity.RestaurantTable;
import com.example.piccolos.repository.RestaurantTableRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ReservationDataInitializer {

    @Bean
    CommandLineRunner initializeRestaurantTables(
            RestaurantTableRepository repository
    ) {
        return args -> {

            if (repository.count() == 0) {

                createTable(repository, 1, 2);
                createTable(repository, 2, 4);
                createTable(repository, 3, 6);
                createTable(repository, 4, 4);

                System.out.println(
                        "Piccolos restaurant tables initialized."
                );
            }
        };
    }

    private void createTable(
            RestaurantTableRepository repository,
            int tableNumber,
            int capacity
    ) {
        RestaurantTable table = new RestaurantTable();

        table.setTableNumber(tableNumber);
        table.setCapacity(capacity);

        repository.save(table);
    }
}