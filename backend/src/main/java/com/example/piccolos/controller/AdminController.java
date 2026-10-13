package com.example.piccolos.controller;

import com.example.piccolos.repository.AdminRepository;
import com.example.piccolos.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173") // or 5173 depending on your Vite config
public class AdminController {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;

    // Inject JdbcTemplate alongside your repositories
    public AdminController(AdminRepository adminRepository, UserRepository userRepository, JdbcTemplate jdbcTemplate) {
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/full-stats")
    public ResponseEntity<Map<String, Object>> getFullDashboardStats() {
        Map<String, Object> response = new HashMap<>();

        // 1. Top Level Counts (Using Repositories & Native SQL)
        Map<String, Long> topStats = new HashMap<>();
        topStats.put("activeAdmins", adminRepository.count());
        topStats.put("registeredCustomers", userRepository.count());
        topStats.put("activeOrders", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM orders", Long.class));
        topStats.put("activeMenuItems", jdbcTemplate.queryForObject("SELECT COUNT(*) FROM menu_items", Long.class));
        response.put("topStats", topStats);

        // 2. Order Types (For Pie Chart: DINE_IN vs PICKUP)
        List<Map<String, Object>> orderTypes = jdbcTemplate.queryForList(
                "SELECT order_type AS name, COUNT(*) AS value FROM orders GROUP BY order_type"
        );
        response.put("orderTypeData", orderTypes);

        // 3. Category Sales (For Bar Chart using Joins)
        List<Map<String, Object>> categorySales = jdbcTemplate.queryForList(
                "SELECT c.name AS name, COALESCE(SUM(oi.quantity), 0) AS sales " +
                        "FROM categories c " +
                        "LEFT JOIN menu_items m ON c.id = m.category_id " +
                        "LEFT JOIN order_items oi ON m.id = oi.menu_item_id " +
                        "GROUP BY c.name HAVING sales > 0 ORDER BY sales DESC LIMIT 5"
        );
        response.put("categoryData", categorySales);

        // 4. Financial Summary (Card vs Cash)
        Double cash = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_method = 'CASH'", Double.class);
        Double card = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_method = 'CARD'", Double.class);

        Map<String, Double> finance = new HashMap<>();
        finance.put("cash", cash);
        finance.put("card", card);
        finance.put("total", cash + card);
        response.put("financialSummary", finance);

        // 5. Weekly Revenue (For Line Chart)
        List<Map<String, Object>> revenue = jdbcTemplate.queryForList(
                "SELECT DATE_FORMAT(payment_date, '%a') AS name, SUM(amount) AS revenue " +
                        "FROM payments GROUP BY DATE_FORMAT(payment_date, '%a') ORDER BY MAX(payment_date) LIMIT 7"
        );
        response.put("revenueData", revenue);

        List<Map<String, Object>> payments = jdbcTemplate.queryForList(
                "SELECT invoice_id as invoiceId, payment_date as date, payment_method as method, amount " +
                        "FROM payments ORDER BY payment_date DESC LIMIT 10"
        );
        response.put("recentPayments", payments);

        return ResponseEntity.ok(response);
    }
}