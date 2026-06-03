const supabase = require('../config/supabase');
const BaseModel = require('./BaseModel');

class ProductModel extends BaseModel {
  constructor() {
    super('products');
  }

  async create(payload) {
    const { name, description, price, imageUrl, active, stockQuantity } = payload;
    const rows = await supabase.request(this.tableName, {
      method: 'POST',
      body: {
        name,
        description,
        price,
        image_url: imageUrl,
        active,
        stock_quantity: stockQuantity
      }
    });

    return rows[0] || null;
  }

  async update(id, payload) {
    const { name, description, price, imageUrl, active, stockQuantity } = payload;
    const rows = await supabase.request(this.tableName, {
      method: 'PATCH',
      query: {
        id: `eq.${id}`
      },
      body: {
        name,
        description,
        price,
        image_url: imageUrl,
        active,
        stock_quantity: stockQuantity
      }
    });

    return rows[0] || null;
  }

  async findActive() {
    return supabase.request(this.tableName, {
      query: {
        select: '*',
        active: 'eq.true',
        order: 'id.asc'
      }
    });
  }

  async updateStock(id, stockQuantity) {
    const rows = await supabase.request(this.tableName, {
      method: 'PATCH',
      query: {
        id: `eq.${id}`
      },
      body: {
        stock_quantity: stockQuantity
      }
    });

    return rows[0] || null;
  }
}

module.exports = new ProductModel();
