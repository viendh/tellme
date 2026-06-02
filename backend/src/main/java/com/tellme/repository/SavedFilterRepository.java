package com.tellme.repository;

import com.tellme.entity.SavedFilter;
import com.tellme.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedFilterRepository extends JpaRepository<SavedFilter, Long> {

    List<SavedFilter> findByCreatorOrderByCreatedAtDesc(User creator);

    @Query("SELECT f FROM SavedFilter f WHERE f.creator = :user OR f.isShared = true ORDER BY f.createdAt DESC")
    List<SavedFilter> findAccessibleFilters(@Param("user") User user);
}
