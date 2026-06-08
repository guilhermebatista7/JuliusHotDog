ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(20) NOT NULL DEFAULT 'snack';

UPDATE products
SET category = 'snack',
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
    image_url = './img/hot-dog.png'
WHERE LOWER(name) LIKE '%350ml%'
   OR LOWER(description) LIKE '%lata%'
   OR LOWER(description) LIKE '%garrafa%'
   OR LOWER(name) LIKE '%agua%'
   OR LOWER(name) LIKE '%água%';

NOTIFY pgrst, 'reload schema';
