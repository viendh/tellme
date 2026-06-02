package com.tellme.repository;

import com.tellme.entity.EmailLog;
import com.tellme.enums.EmailStatus;
import com.tellme.enums.EmailType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmailLogRepository extends JpaRepository<EmailLog, Long> {

    @Query("SELECT e FROM EmailLog e WHERE " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:emailType IS NULL OR e.emailType = :emailType) AND " +
           "(:search IS NULL OR LOWER(e.recipient) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(e.subject) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "  OR LOWER(e.issueTitle) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.sentAt DESC")
    List<EmailLog> findWithFilters(@Param("status") EmailStatus status,
                                   @Param("emailType") EmailType emailType,
                                   @Param("search") String search);
}
