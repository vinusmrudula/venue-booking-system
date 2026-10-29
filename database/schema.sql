-- ============================================================================
-- Venue Booking System - MySQL Relational Database Schema
-- Database Deliverable (Assigned to: Database Lead)
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `venue_booking` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `venue_booking`;

-- ----------------------------------------------------------------------------
-- Table 1: departments
-- Stores all academic complex wings and engineering departments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `code` VARCHAR(20) DEFAULT NULL,
  INDEX `idx_dept_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 2: authorities
-- Stores Head of Department (HOD) and booking approval authority contact details
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `authorities` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `department_id` INT DEFAULT NULL,
  INDEX `idx_auth_email` (`email`),
  CONSTRAINT `fk_authorities_department` 
    FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 3: venues
-- Stores classrooms, seminar halls, auditoriums, and labs.
-- Note: Database stores only benches count. Capacity is derived as total = (2 * benches).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `venues` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Classroom',
  `benches` INT DEFAULT 0,
  `department_id` INT NOT NULL,
  `authority_id` INT DEFAULT NULL,
  INDEX `idx_venue_name` (`name`),
  INDEX `idx_venue_category` (`category`),
  CONSTRAINT `fk_venues_department` 
    FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_venues_authority` 
    FOREIGN KEY (`authority_id`) REFERENCES `authorities` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 4: users
-- Stores user accounts with role-based access (admin, faculty, student)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `department` VARCHAR(120) DEFAULT NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'student',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`),
  INDEX `idx_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table 5: bookings
-- Stores venue booking reservations, schedules, and approval states
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `venue_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `booking_date` VARCHAR(10) NOT NULL,
  `start_time` VARCHAR(5) NOT NULL,
  `end_time` VARCHAR(5) NOT NULL,
  `purpose` TEXT NOT NULL,
  `attendees_count` INT DEFAULT 0,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `rejection_reason` TEXT DEFAULT NULL,
  `authority_email` VARCHAR(120) DEFAULT NULL,
  `email_status` VARCHAR(30) DEFAULT 'pending',
  `mailto_fallback` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_booking_venue_date` (`venue_id`, `booking_date`),
  INDEX `idx_booking_user` (`user_id`),
  INDEX `idx_booking_status` (`status`),
  CONSTRAINT `fk_bookings_venue` 
    FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_user` 
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
