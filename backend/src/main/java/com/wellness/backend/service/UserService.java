package com.wellness.backend.service;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<UserEntity> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<UserEntity> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserEntity saveUser(UserEntity user) {
        return userRepository.save(user);
    }

    public boolean deleteUser(Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return true;
        }).orElse(false);
    }

    public Optional<UserEntity> updateUser(Long id, UserEntity updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setName(updatedUser.getName()); // Use getName() instead of getFullName()
            user.setEmail(updatedUser.getEmail());
            user.setRole(updatedUser.getRole());
            user.setSpecialization(updatedUser.getSpecialization());
            user.setCity(updatedUser.getCity());
            user.setCountry(updatedUser.getCountry());
            user.setDegreeFile(updatedUser.getDegreeFile());
            user.setVerificationStatus(updatedUser.getVerificationStatus());
            userRepository.save(user);
            return user;
        });
    }
}
