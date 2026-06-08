ALTER TABLE supplies ADD COLUMN IF NOT EXISTS is_boolean BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE supplies ADD COLUMN IF NOT EXISTS available BOOLEAN NOT NULL DEFAULT TRUE;

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

ALTER TABLE product_supplies DISABLE ROW LEVEL SECURITY;

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

NOTIFY pgrst, 'reload schema';
