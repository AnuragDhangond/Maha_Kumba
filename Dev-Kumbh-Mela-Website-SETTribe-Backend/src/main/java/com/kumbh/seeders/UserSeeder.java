package com.kumbh.seeders;

import com.kumbh.entity.User;
import com.kumbh.repository.UserRepository;
import com.kumbh.repository.RefreshTokenRepository;
import com.kumbh.repository.AccessTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;

@Component
@Order(1)
public class UserSeeder {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private AccessTokenRepository accessTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void seed() {
        if (userRepository.findByEmail("admin@kumbh.com").isEmpty()) {
            User admin = new User(null, "Super Admin", "admin@kumbh.com", passwordEncoder.encode("Admin@123"), "Trimbakeshwar, Nashik", true);
            admin.setRole("admin");
            userRepository.save(admin);
        }

        if (userRepository.findByEmail("operator1@kumbh.com").isEmpty()) {
            User operator1 = new User(null, "Operator One", "operator1@kumbh.com", passwordEncoder.encode("Operator@123"), "Panchavati, Nashik", true);
            operator1.setRole("operator");
            userRepository.save(operator1);
        }

        if (userRepository.findByEmail("operator2@kumbh.com").isEmpty()) {
            User operator2 = new User(null, "Operator Two", "operator2@kumbh.com", passwordEncoder.encode("Operator@123"), "Ram Kund, Nashik", true);
            operator2.setRole("operator");
            userRepository.save(operator2);
        }

        if (userRepository.findByEmail("aditya@example.com").isEmpty()) {
            User user1 = new User(null, "Aditya Patil", "aditya@example.com", passwordEncoder.encode("User@1234"), "Mumbai, India", true);
            user1.setRole("user");
            userRepository.save(user1);
        }

        if (userRepository.findByEmail("rajesh@example.com").isEmpty()) {
            User user2 = new User(null, "Rajesh Kumar", "rajesh@example.com", passwordEncoder.encode("User@1234"), "Delhi, India", true);
            user2.setRole("user");
            userRepository.save(user2);
        }
    }
}
