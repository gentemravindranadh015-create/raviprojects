CREATE DATABASE IF NOT EXISTS ravi_product_db;
USE ravi_product_db;

CREATE TABLE IF NOT EXISTS products (
  product_id INT PRIMARY KEY,
  product_name VARCHAR(120) NOT NULL,
  category VARCHAR(80) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO products
(product_id, product_name, category, price, quantity, reorder_level)
VALUES
(101, 'Wireless Headphones', 'Electronics', 1499.00, 24, 5),
(102, 'Desk Organizer', 'Office', 349.00, 12, 4),
(103, 'Travel Backpack', 'Accessories', 899.00, 7, 3),
(104, 'Smart LED Lamp', 'Home', 699.00, 3, 5);
