import { db } from "./index";
import { sql } from "drizzle-orm";

export async function ensureSchema(): Promise<void> {
  const queries = [
    `CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255) NOT NULL,
      category VARCHAR(255) NOT NULL,
      product_type VARCHAR(50) NOT NULL DEFAULT 'footwear',
      colorway VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      image TEXT NOT NULL,
      accent VARCHAR(50) NOT NULL,
      price_cents INT NOT NULL,
      compare_at_cents INT,
      rating DOUBLE NOT NULL DEFAULT 4.5,
      rating_count INT NOT NULL DEFAULT 0,
      is_new BOOLEAN NOT NULL DEFAULT FALSE,
      is_featured BOOLEAN NOT NULL DEFAULT FALSE,
      release_year INT NOT NULL DEFAULT 2026,
      weight_grams INT NOT NULL DEFAULT 280,
      terrain VARCHAR(255) NOT NULL DEFAULT 'Street'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS product_sizes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      eu INT NOT NULL,
      size_label VARCHAR(20) NOT NULL DEFAULT '',
      stock INT NOT NULL DEFAULT 0,
      UNIQUE KEY uq_product_size (product_id, eu),
      CONSTRAINT fk_product_sizes_product_id FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS cart_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      eu INT NOT NULL,
      qty INT NOT NULL DEFAULT 1,
      added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_cart_product_size (product_id, eu),
      CONSTRAINT fk_cart_items_product_id FOREIGN KEY (product_id)
        REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_no VARCHAR(255) NOT NULL UNIQUE,
      customer_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      zip VARCHAR(50) NOT NULL,
      subtotal_cents INT NOT NULL,
      shipping_cents INT NOT NULL,
      total_cents INT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      brand VARCHAR(255) NOT NULL,
      colorway VARCHAR(255) NOT NULL,
      image TEXT NOT NULL,
      eu INT NOT NULL,
      size_label VARCHAR(20) NOT NULL DEFAULT '',
      qty INT NOT NULL,
      unit_price_cents INT NOT NULL,
      CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id)
        REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  for (const query of queries) {
    await db.execute(sql.raw(query));
  }
}
