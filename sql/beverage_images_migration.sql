UPDATE products
SET image_url = CASE id
  WHEN 7 THEN './img/guarana-350ml.png'
  WHEN 8 THEN './img/fanta-350ml.png'
  WHEN 9 THEN './img/agua-sem-gas.png'
  WHEN 10 THEN './img/agua-com-gas.png'
END,
category = 'drink',
updated_at = CURRENT_TIMESTAMP
WHERE id IN (7, 8, 9, 10);

NOTIFY pgrst, 'reload schema';
