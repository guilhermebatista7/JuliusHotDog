ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'snack';

UPDATE products
SET category = 'snack',
    image_url = CASE
      WHEN LOWER(name) LIKE '%frango%' THEN './img/hotdog-frango.webp'
      WHEN LOWER(name) LIKE '%bacon%' THEN './img/hotdog-bacon.webp'
      WHEN LOWER(name) LIKE '%pizza%' THEN './img/hotdog-pizza.webp'
      WHEN LOWER(name) LIKE '%chefe%' THEN './img/hotdog-chefe.webp'
      ELSE './img/hotdog-tradicional.webp'
    END
WHERE LOWER(name) IN ('tradicional', 'frango', 'pizza', 'chefe', 'bacon')
   OR LOWER(description) LIKE '%salsicha%';

UPDATE products
SET category = 'drink',
    image_url = CASE
      WHEN id = 7 THEN './img/guarana-350ml.webp'
      WHEN id = 8 THEN './img/fanta-350ml.webp'
      WHEN id = 9 THEN './img/agua-sem-gas.webp'
      WHEN id = 10 THEN './img/agua-com-gas.webp'
      ELSE image_url
    END
WHERE LOWER(name) LIKE '%350ml%'
   OR LOWER(description) LIKE '%lata%'
   OR LOWER(description) LIKE '%garrafa%'
   OR LOWER(name) LIKE '%agua%'
   OR LOWER(name) LIKE '%água%';

NOTIFY pgrst, 'reload schema';
