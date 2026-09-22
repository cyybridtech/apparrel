import dotenv from "dotenv";
import { pool, db } from "./index.js";
import { categories, products, productSizes, inventoryLogs } from "./schema.js";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "./seed.js";

dotenv.config();

async function runSeed() {
  console.log("⚡ Starting database sync to MySQL / TiDB Cloud...");

  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is not set in .env. Using in-memory fallback.");
    process.exit(0);
  }

  try {
    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to TiDB Cloud / MySQL database!");

    // Create Tables if they don't exist
    console.log("📦 Creating / verifying database tables...");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50) NOT NULL DEFAULT 'Sparkles',
        item_count INT NOT NULL DEFAULT 0,
        banner_image TEXT,
        featured BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        sub_category VARCHAR(100) NOT NULL DEFAULT 'General',
        description TEXT NOT NULL,
        features_json TEXT NOT NULL,
        price_cents INT NOT NULL,
        compare_at_cents INT,
        images_json TEXT NOT NULL,
        primary_image TEXT NOT NULL,
        secondary_image TEXT,
        colorway VARCHAR(150) NOT NULL DEFAULT 'Standard',
        rating DOUBLE NOT NULL DEFAULT 4.8,
        rating_count INT NOT NULL DEFAULT 12,
        is_new BOOLEAN NOT NULL DEFAULT false,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        is_trending BOOLEAN NOT NULL DEFAULT false,
        badge VARCHAR(50),
        gender VARCHAR(50) NOT NULL DEFAULT 'Unisex',
        sku VARCHAR(100) NOT NULL,
        total_stock INT NOT NULL DEFAULT 50,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_sizes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        size_label VARCHAR(50) NOT NULL,
        color VARCHAR(100),
        stock INT NOT NULL DEFAULT 10,
        low_stock_threshold INT NOT NULL DEFAULT 3,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_no VARCHAR(100) NOT NULL UNIQUE,
        customer_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL DEFAULT 'Accra',
        postal_code VARCHAR(50),
        subtotal_cents INT NOT NULL,
        shipping_cents INT NOT NULL DEFAULT 0,
        discount_cents INT NOT NULL DEFAULT 0,
        total_cents INT NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
        status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'paid',
        payment_method VARCHAR(50) NOT NULL DEFAULT 'paystack',
        paystack_ref VARCHAR(255),
        tracking_code VARCHAR(100) NOT NULL UNIQUE,
        courier_name VARCHAR(100) NOT NULL DEFAULT 'Kicks Express Fleet',
        courier_phone VARCHAR(50) NOT NULL DEFAULT '+233 24 555 8901',
        courier_lat DOUBLE DEFAULT 5.6037,
        courier_lng DOUBLE DEFAULT -0.1870,
        destination_lat DOUBLE DEFAULT 5.6148,
        destination_lng DOUBLE DEFAULT -0.1731,
        estimated_delivery VARCHAR(100) NOT NULL DEFAULT 'Within 45 - 90 mins',
        delivery_notes TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        brand VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        size_label VARCHAR(50) NOT NULL,
        image TEXT NOT NULL,
        qty INT NOT NULL,
        unit_price_cents INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS inventory_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        size_label VARCHAR(50) NOT NULL,
        change_qty INT NOT NULL,
        previous_stock INT NOT NULL,
        new_stock INT NOT NULL,
        reason VARCHAR(255) NOT NULL DEFAULT 'Admin Restock',
        admin_user VARCHAR(100) NOT NULL DEFAULT 'Master Admin',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("🌱 Populating 5 Department Categories...");
    for (const cat of INITIAL_CATEGORIES) {
      if (cat.slug === "all") continue;
      await connection.query(
        `INSERT INTO categories (slug, name, description, icon, banner_image, featured)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);`,
        [cat.slug, cat.name, cat.description || "", cat.icon || "Sparkles", cat.bannerImage || "", Boolean(cat.featured)]
      );
    }

    console.log("🌱 Populating 22 Luxury Products across Tops, Sneakers, Perfumes, Watches, and Body Sprays...");
    for (const prod of INITIAL_PRODUCTS) {
      const totalStock = prod.sizes.reduce((sum, s) => sum + s.stock, 0);
      const [res]: any = await connection.query(
        `INSERT INTO products (
          slug, name, brand, category, sub_category, description,
          features_json, price_cents, compare_at_cents, images_json, primary_image, secondary_image,
          colorway, rating, rating_count, is_new, is_featured, is_trending, badge, gender, sku, total_stock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          brand = VALUES(brand),
          price_cents = VALUES(price_cents),
          total_stock = VALUES(total_stock);`,
        [
          prod.slug,
          prod.name,
          prod.brand,
          prod.category,
          prod.subCategory || "General",
          prod.description,
          JSON.stringify(prod.features || []),
          prod.priceCents,
          prod.compareAtCents || null,
          JSON.stringify(prod.images || []),
          prod.images[0] || "",
          prod.images[1] || null,
          prod.colorway || "Standard",
          prod.rating || 4.8,
          prod.ratingCount || 12,
          Boolean(prod.isNew),
          Boolean(prod.isFeatured),
          Boolean(prod.isTrending),
          prod.badge || null,
          prod.gender || "Unisex",
          prod.sku,
          totalStock,
        ]
      );

      const productId = res.insertId;
      if (productId) {
        for (const size of prod.sizes) {
          await connection.query(
            `INSERT INTO product_sizes (product_id, size_label, stock, low_stock_threshold)
             VALUES (?, ?, ?, ?)`,
            [productId, size.label, size.stock, 3]
          );
        }
      }
    }

    connection.release();
    console.log("🎉 TiDB Cloud / MySQL database successfully synced and seeded!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Database sync error:", err.message);
    process.exit(1);
  }
}

runSeed();
