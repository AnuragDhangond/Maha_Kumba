CREATE TABLE IF NOT EXISTS `emergency_alerts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `alert_id` VARCHAR(10) NOT NULL UNIQUE,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `emergency_type` VARCHAR(50) NOT NULL,
    `status` ENUM('Pending', 'Accepted', 'Resolved') DEFAULT 'Pending',
    `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    `reported_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `accepted_by` VARCHAR(100) NULL,
    `resolved_time` TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS `live_darshans` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255),
    `viewers` VARCHAR(50),
    `image_path` VARCHAR(255),
    `status` VARCHAR(50),
    `start_time` DATETIME,
    `end_time` DATETIME,
    `time` VARCHAR(50),
    `link` VARCHAR(255),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `pooja_schedules` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `day` VARCHAR(50) NOT NULL,
    `deity` VARCHAR(100) NOT NULL,
    `special_pooja` VARCHAR(255) NOT NULL,
    `icon` VARCHAR(10),
    `time` VARCHAR(100),
    `place` VARCHAR(255),
    `description` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `acharyas` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `specialty` VARCHAR(255) NOT NULL,
    `experience` VARCHAR(100),
    `rating` DECIMAL(3, 2) DEFAULT 0.0,
    `reviews` INT DEFAULT 0,
    `image_path` VARCHAR(255),
    `location` VARCHAR(255) DEFAULT 'Trimbakeshwar',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `acharya_poojas` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `acharya_id` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `duration` VARCHAR(100),
    FOREIGN KEY (`acharya_id`) REFERENCES `acharyas`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `hospitals` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `address` TEXT,
    `latitude` DECIMAL(10, 8) NOT NULL,
    `longitude` DECIMAL(11, 8) NOT NULL,
    `contact` VARCHAR(50),
    `beds` INT DEFAULT 0,
    `status` VARCHAR(50) DEFAULT 'Active',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `health_tips` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `category` VARCHAR(50) NOT NULL,
    `tip_text` TEXT NOT NULL,
    `image_path` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS `weather_data` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `temperature` DECIMAL(5, 2),
    `humidity` INT,
    `wind_speed` DECIMAL(5, 2),
    `weather_condition` VARCHAR(255),
    `icon` VARCHAR(50),
    `rain_status` VARCHAR(50),
    `uv_index` DECIMAL(3, 1),
    `air_quality` VARCHAR(50),
    `sunrise` VARCHAR(20),
    `sunset` VARCHAR(20),
    `recorded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `created_by` VARCHAR(255),
    `last_modified_by` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `weather_alerts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `type` VARCHAR(50),
    `message` TEXT,
    `severity` VARCHAR(20),
    `is_active` BOOLEAN DEFAULT TRUE,
    `alert_threshold` DECIMAL(10, 2),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `created_by` VARCHAR(255),
    `last_modified_by` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `broadcast_notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255),
    `content` TEXT,
    `type` VARCHAR(50),
    `is_scrolling` BOOLEAN DEFAULT FALSE,
    `is_popup` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` BOOLEAN DEFAULT FALSE,
    `created_by` VARCHAR(255),
    `last_modified_by` VARCHAR(255)
);
