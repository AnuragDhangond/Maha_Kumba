package com.kumbh.service;

import com.kumbh.dto.UserDto;
import com.kumbh.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface UserService {

    User saveUser(User user);

    Page<User> getAllUsers(Pageable pageable);

    User updateUser(int id,User user);

    void deleteUser(int id);

	User loginUser(String email, String password);
	User resetPassword(String email, String newPassword);
	boolean existsByEmail(String email);
	Page<User> searchUsers(String query, Pageable pageable);

    Page<UserDto> getPaginatedUsers(String search, Integer page, Integer size, String sortBy, String direction);

    // Add this for internal lookups where List is still needed
    List<User> getAllUsersList();

    User getUserById(int id);

}