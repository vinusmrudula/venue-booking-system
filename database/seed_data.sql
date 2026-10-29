-- ============================================================================
-- Venue Booking System - MySQL Initial Reference Seed Data
-- ============================================================================

USE `venue_booking`;

-- 1. Default Users (Pass: Admin@123, Faculty@123, Student@123, password123)
INSERT INTO `users` (`name`, `email`, `password_hash`, `department`, `role`, `created_at`) VALUES
('College Administrator', 'admin@coeptech.ac.in', 'scrypt:32768:8:1$7Ufq3y2...$adminhash', 'Central Administration', 'admin', NOW()),
('Dr. Sharma (Faculty)', 'faculty.cs@coeptech.ac.in', 'scrypt:32768:8:1$8Vgr4z3...$facultyhash', 'Computer New Building', 'faculty', NOW()),
('Aarav Patil (Student)', 'student.coep@coeptech.ac.in', 'scrypt:32768:8:1$9Whs5a4...$studenthash', 'Mechanical Engineering', 'student', NOW()),
('Aman Sharma', 'aman.student@college.ac.in', 'scrypt:32768:8:1$1Amn6b5...$amanhash', 'Department of Computer Science and Engineering (new)', 'student', NOW());

-- 2. Core Campus Departments
INSERT INTO `departments` (`name`, `code`) VALUES
('Academic Complex', 'AC'),
('Civil Engineering', 'CE'),
('Computer New Building', 'CNB'),
('Electrical Engineering', 'EE'),
('Electronics & Telecommunication', 'ENTC'),
('Mechanical Engineering', 'ME'),
('Manufacturing Engineering', 'MFE'),
('Metallurgy and Materials', 'META'),
('Planning', 'PLAN');

-- 3. Core Approval Authorities (HODs)
INSERT INTO `authorities` (`name`, `email`, `department_id`) VALUES
('HOD Academic Complex', 'venues.admin@coeptech.ac.in', 1),
('HOD Civil Engineering', 'hod.civil@coeptech.ac.in', 2),
('HOD Computer Science', 'hod.cs@coeptech.ac.in', 3),
('HOD Electrical Engineering', 'hod.electrical@coeptech.ac.in', 4),
('HOD Mechanical Engineering', 'hod.mechanical@coeptech.ac.in', 6);

-- 4. Sample College Venues (Database stores only benches; Capacity is total = 2 * benches)
INSERT INTO `venues` (`name`, `category`, `benches`, `department_id`, `authority_id`) VALUES
('AC 101', 'Classroom', 40, 1, 1),
('AC 202', 'Classroom', 45, 1, 1),
('NC 27', 'Classroom', 35, 3, 3),
('NC 28', 'Classroom', 35, 3, 3),
('New CSE Seminar Hall', 'Seminar Hall', 60, 3, 3),
('Main Auditorium', 'Auditorium', 450, 1, 1),
('Mini Auditorium', 'Auditorium', 125, 1, 1),
('Civil CAD Lab', 'Lab / Facility', 30, 2, 2);
