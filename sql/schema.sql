DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'customer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supply_unit') THEN
    CREATE TYPE supply_unit AS ENUM ('KG', 'UN', 'LT');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'preparing', 'delivered', 'cancelled');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255) DEFAULT './img/hotdog-tradicional.webp',
  category VARCHAR(20) NOT NULL DEFAULT 'snack',
  stock_quantity INT NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit supply_unit NOT NULL DEFAULT 'UN',
  is_boolean BOOLEAN NOT NULL DEFAULT FALSE,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_supplies (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL,
  supply_id INT NOT NULL,
  quantity_required DECIMAL(10, 2) NOT NULL DEFAULT 0,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_supplies_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_supplies_supply FOREIGN KEY (supply_id) REFERENCES supplies(id) ON DELETE CASCADE,
  CONSTRAINT uq_product_supplies UNIQUE (product_id, supply_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(160) NULL,
  notes TEXT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_requests (
  id SERIAL PRIMARY KEY,
  customer_id INT NULL,
  customer_name VARCHAR(120) NOT NULL,
  customer_email VARCHAR(160) NULL,
  customer_phone VARCHAR(30) NULL,
  notes TEXT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  items JSONB NOT NULL,
  order_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_requests_user FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_order_requests_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(120) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_products ON products;
CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_supplies ON supplies;
CREATE TRIGGER set_timestamp_supplies BEFORE UPDATE ON supplies FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_orders ON orders;
CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_order_requests ON order_requests;
CREATE TRIGGER set_timestamp_order_requests BEFORE UPDATE ON order_requests FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INT NOT NULL DEFAULT 100;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'snack';
ALTER TABLE supplies ADD COLUMN IF NOT EXISTS is_boolean BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE supplies ADD COLUMN IF NOT EXISTS available BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplies DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_supplies DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_requests DISABLE ROW LEVEL SECURITY;

INSERT INTO users (name, email, password_hash, role)
VALUES ('Administrador', 'admin@julios.com', '$2a$10$9eRKBSgn79.riiFNo6adhO/Mwof1mKrwYf3FEPgr2ZFTBXxHlhtAa', 'admin')
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = 'admin',
    updated_at = CURRENT_TIMESTAMP;

TRUNCATE TABLE products RESTART IDENTITY CASCADE;

INSERT INTO products (id, name, description, price, image_url, category, stock_quantity, active) VALUES
(1, 'Tradicional', 'Duas salsichas, batata palha, milho, maionese, ketchup e mostarda.', 14.00, './img/hotdog-tradicional.webp', 'snack', 100, TRUE),
(2, 'Frango', 'Duas salsichas, frango desfiado, batata palha, milho, maionese, ketchup e mostarda.', 18.00, './img/hotdog-frango.webp', 'snack', 100, TRUE),
(3, 'Pizza', 'Duas salsichas, presunto, mucarela, tomate, oregano, batata palha, milho, maionese, ketchup e mostarda.', 18.00, './img/hotdog-pizza.webp', 'snack', 100, TRUE),
(4, 'Chefe', 'Duas salsichas, rucula, requeijao cremoso, alho frito, batata palha, milho, maionese, ketchup e mostarda.', 18.00, './img/hotdog-chefe.webp', 'snack', 100, TRUE),
(5, 'Bacon', 'Duas salsichas, bacon, batata palha, milho, maionese, ketchup e mostarda.', 20.00, './img/hotdog-bacon.webp', 'snack', 100, TRUE),
(6, 'Coca-Cola 350ml', 'Refrigerante Coca-Cola lata 350ml.', 6.00, './img/hot-dog.png', 'drink', 100, TRUE),
(7, 'Guarana 350ml', 'Refrigerante Guarana lata 350ml.', 5.00, './img/guarana-350ml.webp', 'drink', 100, TRUE),
(8, 'Fanta 350ml', 'Refrigerante Fanta lata 350ml.', 5.00, './img/fanta-350ml.webp', 'drink', 100, TRUE),
(9, 'Agua sem gas', 'Garrafa de agua mineral sem gas.', 3.00, './img/agua-sem-gas.webp', 'drink', 100, TRUE),
(10, 'Agua com gas', 'Garrafa de agua mineral com gas.', 3.00, './img/agua-com-gas.webp', 'drink', 100, TRUE);

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

INSERT INTO supplies (name, quantity, unit, is_boolean, available)
SELECT 'Pao', 40.0, 'UN'::supply_unit, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM supplies WHERE name = 'Pao');

INSERT INTO supplies (name, quantity, unit, is_boolean, available)
SELECT 'Salsicha', 80.0, 'UN'::supply_unit, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM supplies WHERE name = 'Salsicha');

INSERT INTO supplies (name, quantity, unit, is_boolean, available)
SELECT item.name, 0, 'UN'::supply_unit, TRUE, TRUE
FROM (VALUES
  ('Maionese'),
  ('Batata palha'),
  ('Mostarda'),
  ('Ketchup'),
  ('Milho'),
  ('Bacon'),
  ('Frango'),
  ('Presunto'),
  ('Mucarela'),
  ('Tomate'),
  ('Oregano'),
  ('Rucula'),
  ('Requeijao cremoso'),
  ('Alho frito')
) AS item(name)
WHERE NOT EXISTS (SELECT 1 FROM supplies WHERE supplies.name = item.name);

INSERT INTO product_supplies (product_id, supply_id, quantity_required, required)
SELECT product_id, supply_id, quantity_required, TRUE
FROM (
  SELECT p.id AS product_id, s.id AS supply_id,
    CASE WHEN s.name = 'Pao' THEN 1 WHEN s.name = 'Salsicha' THEN 2 ELSE 0 END AS quantity_required
  FROM products p
  JOIN supplies s ON s.name IN ('Pao', 'Salsicha', 'Maionese', 'Batata palha', 'Mostarda', 'Ketchup', 'Milho')
  WHERE p.name IN ('Tradicional', 'Frango', 'Pizza', 'Chefe', 'Bacon')
  UNION ALL
  SELECT p.id, s.id, 0
  FROM products p
  JOIN supplies s ON
    (p.name = 'Frango' AND s.name = 'Frango') OR
    (p.name = 'Pizza' AND s.name IN ('Presunto', 'Mucarela', 'Tomate', 'Oregano')) OR
    (p.name = 'Chefe' AND s.name IN ('Rucula', 'Requeijao cremoso', 'Alho frito')) OR
    (p.name = 'Bacon' AND s.name = 'Bacon')
) requirements
ON CONFLICT (product_id, supply_id) DO NOTHING;
