package com.kumbh.service;

import com.kumbh.dto.UserDto;
import com.kumbh.entity.User;
import com.kumbh.pagination.UserPagination;
import com.kumbh.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserPagination userPagination;

    @Override
    public User saveUser(User user) {

        // Duplicate email check
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        user.setActive(true);

        // Encode password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return userRepository.save(user);
    }

    @Override
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public Page<UserDto> getPaginatedUsers(String search, Integer page, Integer size, String sortBy, String direction) {
        return userPagination.getPaginatedUsers(search, page, size, sortBy, direction);
    }

    @Override
    public List<User> getAllUsersList() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(int id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User updateUser(int id, User user) {

        User existing = userRepository.findById(id).orElse(null);

        if (existing != null) {

            existing.setName(user.getName());
            existing.setEmail(user.getEmail());
            // Only update password if it's provided and not empty
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existing.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            existing.setAddress(user.getAddress());
            existing.setRole(user.getRole());
            if (user.getIsActive() != null) {
                existing.setActive(user.getIsActive());
            }

            return userRepository.save(existing);
        }

        return null;
    }

    @Override
    public User loginUser(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Username is wrong"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Password is wrong");
        }

        return user;
    }

    @Override
    public User resetPassword(String email, String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Username is wrong"));

        user.setPassword(passwordEncoder.encode(newPassword));

        return userRepository.save(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    public Page<User> searchUsers(String query, Pageable pageable) {
        return userRepository.searchUsers(query, pageable);
    }

    @Override
    public void deleteUser(int id) {

        User user = userRepository.findById(id).orElse(null);

        if (user != null) {

            user.setActive(false);

            userRepository.save(user);
        }
    }
}
