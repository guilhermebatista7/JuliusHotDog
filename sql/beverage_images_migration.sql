UPDATE products
SET image_url = CASE id
  WHEN 1 THEN './img/hotdog-tradicional.webp'
  WHEN 2 THEN './img/hotdog-frango.webp'
  WHEN 3 THEN './img/hotdog-pizza.webp'
  WHEN 4 THEN './img/hotdog-chefe.webp'
  WHEN 5 THEN './img/hotdog-bacon.webp'
  WHEN 6 THEN './img/coca-cola-350ml.webp'
  WHEN 7 THEN './img/guarana-350ml.webp'
  WHEN 8 THEN './img/fanta-350ml.webp'
  WHEN 9 THEN './img/agua-sem-gas.webp'
  WHEN 10 THEN './img/agua-com-gas.webp'
END,
updated_at = CURRENT_TIMESTAMP
WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

NOTIFY pgrst, 'reload schema';
