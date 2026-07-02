-- ============================================================
-- Mahakumbh Marketplace: Shop Ecosystem Schema Migration
-- Run AFTER existing schema.sql
-- Safe: all CREATE TABLE uses IF NOT EXISTS
-- ============================================================

-- 1. SHOPS (root marketplace entity)
CREATE TABLE IF NOT EXISTS `shops` (
    `id`                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    `shop_name`            VARCHAR(150) NOT NULL,
    `shop_slug`            VARCHAR(150) NOT NULL UNIQUE,
    `owner_name`           VARCHAR(150) NOT NULL,
    `owner_user_id`        INT NOT NULL,
    `email`                VARCHAR(100) NOT NULL,
    `phone`                VARCHAR(20) NOT NULL,
    `whatsapp_number`      VARCHAR(20),
    `description`          TEXT,
    `category`             VARCHAR(50) NOT NULL,
    `sub_category`         VARCHAR(50),
    `logo_image`           VARCHAR(255),
    `banner_image`         VARCHAR(255),
    `address`              VARCHAR(255) NOT NULL,
    `city`                 VARCHAR(100) NOT NULL DEFAULT 'Nashik',
    `state`                VARCHAR(100) NOT NULL DEFAULT 'Maharashtra',
    `pincode`              VARCHAR(10) NOT NULL,
    `latitude`             DECIMAL(10,8) NOT NULL,
    `longitude`            DECIMAL(11,8) NOT NULL,
    `google_map_link`      VARCHAR(255),
    `landmark`             VARCHAR(150),
    `opening_time`         TIME NOT NULL,
    `closing_time`         TIME NOT NULL,
    `is_verified`          BOOLEAN NOT NULL DEFAULT FALSE,
    `verification_status`  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `verification_remarks` TEXT,
    `status`               VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    `rating`               DECIMAL(3,2) DEFAULT 0.00,
    `total_orders`         INT DEFAULT 0,
    `total_products`       INT DEFAULT 0,
    `total_revenue`        DECIMAL(12,2) DEFAULT 0.00,
    -- BaseEntity audit fields
    `created_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by`           VARCHAR(150),
    `last_modified_by`     VARCHAR(150),
    `is_deleted`           BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_shop_owner FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`),
    INDEX idx_shop_geo    (`latitude`, `longitude`),
    INDEX idx_shop_status (`status`, `is_deleted`, `is_verified`)
);

-- 2. PRODUCTS — refactored to be shop-scoped
-- Add missing columns to existing `products` table (safe ALTER IF NOT EXISTS pattern)
ALTER TABLE `products`
    ADD COLUMN IF NOT EXISTS `shop_id`            BIGINT,
    ADD COLUMN IF NOT EXISTS `discounted_price`    DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS `images`              TEXT,
    ADD COLUMN IF NOT EXISTS `thumbnail`           VARCHAR(255),
    ADD COLUMN IF NOT EXISTS `tags`                VARCHAR(255),
    ADD COLUMN IF NOT EXISTS `rating`              DECIMAL(3,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS `status`              VARCHAR(20) DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS `is_featured`         BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS `weight`              DECIMAL(10,2),
    ADD COLUMN IF NOT EXISTS `dimensions`          VARCHAR(50),
    ADD COLUMN IF NOT EXISTS `delivery_available`  BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS `created_by`          VARCHAR(150),
    ADD COLUMN IF NOT EXISTS `last_modified_by`    VARCHAR(150);

-- 3. SHOP ORDERS — refactored to link User→Shop→Vendor
ALTER TABLE `shop_orders`
    ADD COLUMN IF NOT EXISTS `shop_id`              BIGINT,
    ADD COLUMN IF NOT EXISTS `vendor_id`            INT,
    ADD COLUMN IF NOT EXISTS `tax_amount`           DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS `delivery_charge`      DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS `discount_amount`      DECIMAL(10,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS `grand_total`          DECIMAL(12,2),
    ADD COLUMN IF NOT EXISTS `payment_status`       VARCHAR(20) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS `phone`                VARCHAR(20),
    ADD COLUMN IF NOT EXISTS `vendor_payout_status` VARCHAR(20) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS `vendor_payout_amount` DECIMAL(12,2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS `refund_remarks`       TEXT,
    ADD COLUMN IF NOT EXISTS `created_by`           VARCHAR(150),
    ADD COLUMN IF NOT EXISTS `last_modified_by`     VARCHAR(150),
    ADD COLUMN IF NOT EXISTS `is_deleted`           BOOLEAN DEFAULT FALSE;

-- Backfill grand_total where null (equals totalAmount for legacy rows)
UPDATE `shop_orders` SET `grand_total` = `total_amount` WHERE `grand_total` IS NULL;

-- 3b. DELIVERY TRACKING DETAILS — used by My Orders active/past cards
ALTER TABLE `delivery_tracking`
    ADD COLUMN IF NOT EXISTS `courier_partner` VARCHAR(150),
    ADD COLUMN IF NOT EXISTS `tracking_number` VARCHAR(80),
    ADD COLUMN IF NOT EXISTS `latest_update` TEXT;

-- 4. PAYMENT TRANSACTIONS (new)
CREATE TABLE IF NOT EXISTS `payment_transactions` (
    `id`                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    `order_id`                BIGINT NOT NULL,
    `transaction_reference`   VARCHAR(255) NOT NULL UNIQUE,
    `gateway_name`            VARCHAR(100) NOT NULL,
    `amount`                  DECIMAL(12,2) NOT NULL,
    `currency`                VARCHAR(10) DEFAULT 'INR',
    `payment_status`          VARCHAR(50) NOT NULL,
    `gateway_response`        TEXT,
    `created_at`              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order FOREIGN KEY (`order_id`) REFERENCES `shop_orders`(`id`)
);
