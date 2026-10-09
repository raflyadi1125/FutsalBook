-- =============================================
-- FutsalBook - Database Schema (MySQL)
-- Jalankan: mysql -u root -p < database/schema.sql
-- =============================================

CREATE DATABASE IF NOT EXISTS futsal_book
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE futsal_book;

-- ---------- Users ----------
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)   NOT NULL,
  email         VARCHAR(150)   NOT NULL UNIQUE,
  phone         VARCHAR(30)    NULL,
  password_hash VARCHAR(255)   NOT NULL,
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Fields (lapangan) ----------
CREATE TABLE IF NOT EXISTS fields (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100)   NOT NULL,
  description TEXT           NULL,
  price       INT UNSIGNED   NOT NULL DEFAULT 0,
  status      ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Bookings (pemesanan) ----------
CREATE TABLE IF NOT EXISTS bookings (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  field_id     INT UNSIGNED NOT NULL,
  booking_date DATE         NOT NULL,
  start_time   TIME         NOT NULL,
  notes        TEXT         NULL,
  status       ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_bookings_user   FOREIGN KEY (user_id)  REFERENCES users (id)  ON DELETE CASCADE,
  CONSTRAINT fk_bookings_field  FOREIGN KEY (field_id) REFERENCES fields (id) ON DELETE CASCADE,
  INDEX idx_booking_slot (field_id, booking_date, start_time)
);

-- ---------- Payments (pembayaran) ----------
CREATE TABLE IF NOT EXISTS payments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id  INT UNSIGNED NOT NULL,
  amount      INT UNSIGNED NOT NULL DEFAULT 0,
  method      VARCHAR(50)  NOT NULL DEFAULT 'cash',
  status      ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  reference   VARCHAR(150) NULL,
  paid_at     DATETIME     NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
);

-- =============================================
-- Seed Data
-- =============================================

-- Admin default: admin@futsalbook.test / admin1234
INSERT INTO users (name, email, phone, password_hash, role) VALUES
  ('Admin FutsalBook', 'admin@futsalbook.test', '0812-0000-0001', '$2b$10$sn21Vacw55wEWiNJgVmQpeiOGNv4JktHmCOZnTdOTS2qe4HIwcmX.', 'admin');

INSERT INTO fields (name, description, price, status) VALUES
  ('Lapangan A (Vinyl)', 'Vinyl indoor bali, cocok untuk liga dan turnamen', 150000, 'active'),
  ('Lapangan B (Sintetis)', 'Rumput sintetis, nyaman dan empuk', 120000, 'active'),
  ('Lapangan C (Parket)', 'Parket kayu premium untuk latihan teknik', 180000, 'active');

-- Catatan: hash admin di atas dibuat dari 'admin1234'. Jika berubah, generate ulang
-- dengan:  node -e "console.log(require('bcryptjs').hashSync('admin1234', 10))"