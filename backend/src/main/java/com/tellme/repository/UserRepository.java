package com.tellme.repository;

import com.tellme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findAllByOrderByCreatedAtDesc();

    List<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email);

    List<User> findByIsApprovedFalseOrderByCreatedAtDesc();

    List<User> findByIsApprovedTrueAndIsActiveTrueOrderByFullNameAsc();
}
