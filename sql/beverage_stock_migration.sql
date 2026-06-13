ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_stock_quantity_nonnegative;

ALTER TABLE products
ADD CONSTRAINT products_stock_quantity_nonnegative CHECK (stock_quantity >= 0);

NOTIFY pgrst, 'reload schema';
