ALTER TABLE products
ALTER COLUMN image_url SET DEFAULT './img/hot-dog.png';

NOTIFY pgrst, 'reload schema';
