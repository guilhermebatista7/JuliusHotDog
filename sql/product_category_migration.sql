ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'snack';
ALTER TABLE products ADD COLUMN IF NOT EXISTS beverage_type VARCHAR(20) NULL;

UPDATE products
SET category = 'snack',
    beverage_type = NULL,
    image_url = CASE
      WHEN LOWER(name) LIKE '%frango%' THEN './img/hotdog-frango.png'
      WHEN LOWER(name) LIKE '%bacon%' THEN './img/hotdog-bacon.png'
      WHEN LOWER(name) LIKE '%pizza%' THEN './img/hotdog-pizza.png'
      WHEN LOWER(name) LIKE '%chefe%' THEN './img/hotdog-chefe.png'
      ELSE './img/hotdog-tradicional.png'
    END
WHERE LOWER(name) IN ('tradicional', 'frango', 'pizza', 'chefe', 'bacon')
   OR LOWER(description) LIKE '%salsicha%';

UPDATE products
SET category = 'drink',
    beverage_type = 'can',
    image_url = './img/bebida-copo.svg'
WHERE LOWER(name) LIKE '%350ml%'
   OR LOWER(description) LIKE '%lata%';

UPDATE products
SET category = 'drink',
    beverage_type = 'bottle',
    image_url = './img/bebida-garrafa.svg'
WHERE LOWER(description) LIKE '%garrafa%'
   OR LOWER(name) LIKE '%agua%'
   OR LOWER(name) LIKE '%água%';

NOTIFY pgrst, 'reload schema';
