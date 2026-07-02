-- ================================================================
-- Mahakumbh Marketplace: Vendor Application System Migration
-- Safe: IF NOT EXISTS patterns — run after schema_shop_migration.sql
-- ================================================================

-- 1. VENDOR APPLICATIONS
CREATE TABLE IF NOT EXISTS `vendor_applications` (
    `id`                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id`              INT NOT NULL UNIQUE,

    -- Applicant details
    `full_name`            VARCHAR(150) NOT NULL,
    `email`                VARCHAR(100) NOT NULL,
    `phone`                VARCHAR(20) NOT NULL,
    `whatsapp_number`      VARCHAR(20),

    -- Shop details
    `shop_name`            VARCHAR(150) NOT NULL,
    `shop_category`        VARCHAR(50) NOT NULL,
    `shop_description`     TEXT,
    `address`              VARCHAR(255) NOT NULL,
    `city`                 VARCHAR(100) DEFAULT 'Nashik',
    `state`                VARCHAR(100) DEFAULT 'Maharashtra',
    `pincode`              VARCHAR(10),
    `landmark`             VARCHAR(150),
    `gst_number`           VARCHAR(20),

    -- Location
    `latitude`             DECIMAL(10,8),
    `longitude`            DECIMAL(11,8),
    `google_map_link`      VARCHAR(255),
    `opening_time`         VARCHAR(10) DEFAULT '09:00',
    `closing_time`         VARCHAR(10) DEFAULT '21:00',

    -- Documents
    `document_url`         VARCHAR(255),
    `shop_license_url`     VARCHAR(255),
    `logo_image`           VARCHAR(255),
    `banner_image`         VARCHAR(255),

    -- Workflow
    `application_status`   VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    `reviewer_notes`       TEXT,
    `reviewed_by`          VARCHAR(150),
    `reviewed_at`          TIMESTAMP NULL,
    `shop_id`              BIGINT,

    -- BaseEntity audit fields
    `created_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by`           VARCHAR(150),
    `last_modified_by`     VARCHAR(150),
    `is_deleted`           BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_va_user  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    CONSTRAINT fk_va_shop  FOREIGN KEY (`shop_id`) REFERENCES `shops`(`id`),
    INDEX idx_va_status    (`application_status`),
    INDEX idx_va_user      (`user_id`)
);

-- 2. Products: add PENDING_APPROVAL moderation status support
--    product status allowed values: DRAFT | PENDING_APPROVAL | APPROVED | REJECTED | BLOCKED
ALTER TABLE `products`
    MODIFY COLUMN IF EXISTS `status` VARCHAR(30) DEFAULT 'PENDING_APPROVAL';

-- Backfill existing ACTIVE products to APPROVED (legacy compat)
UPDATE `products` SET `status` = 'APPROVED' WHERE `status` = 'ACTIVE' OR `status` IS NULL;

-- 3. Users: allow new role values (vendor_pending, vendor)
--    The role column already VARCHAR — just ensuring it's wide enough
ALTER TABLE `users`
    MODIFY COLUMN `role` VARCHAR(30) DEFAULT 'user';

-- 4. Application status index for fast operator queue queries
CREATE INDEX IF NOT EXISTS idx_va_status_created
    ON `vendor_applications` (`application_status`, `created_at`);
