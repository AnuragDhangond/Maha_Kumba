-- REDESIGN SHOP MARKETPLACE WORKFLOW MIGRATION
-- Add moderation fields to products table

ALTER TABLE `products`
    ADD COLUMN IF NOT EXISTS `submitted_by_user_id` INT,
    ADD COLUMN IF NOT EXISTS `moderation_status`    VARCHAR(20) DEFAULT 'APPROVED', -- Default to APPROVED for existing products
    ADD COLUMN IF NOT EXISTS `moderation_remarks`   TEXT,
    ADD COLUMN IF NOT EXISTS `approved_by`          INT,
    ADD COLUMN IF NOT EXISTS `approved_at`          TIMESTAMP NULL,
    ADD COLUMN IF NOT EXISTS `rejection_reason`     TEXT,
    ADD COLUMN IF NOT EXISTS `whatsapp_number`      VARCHAR(20),
    ADD COLUMN IF NOT EXISTS `pickup_location`      VARCHAR(255),
    ADD COLUMN IF NOT EXISTS `seller_city`          VARCHAR(100),
    ADD COLUMN IF NOT EXISTS `seller_address`       TEXT,
    ADD COLUMN IF NOT EXISTS `seller_name`          VARCHAR(150),
    ADD COLUMN IF NOT EXISTS `seller_email`         VARCHAR(100),
    ADD COLUMN IF NOT EXISTS `seller_phone`         VARCHAR(20);

-- Update existing products to have APPROVED status
UPDATE `products` SET `moderation_status` = 'APPROVED' WHERE `moderation_status` IS NULL;

-- Add foreign key for submitted_by_user_id
ALTER TABLE `products`
    ADD CONSTRAINT fk_product_submitted_by FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`);
