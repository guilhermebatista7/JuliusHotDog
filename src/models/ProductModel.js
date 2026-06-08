const supabase = require('../config/supabase');
const BaseModel = require('./BaseModel');
const productSupplyModel = require('./ProductSupplyModel');

class ProductModel extends BaseModel {
  constructor() {
    super('products');
  }

  async create(payload) {
    const { name, description, price, imageUrl, active, supplies = [] } = payload;
    const rows = await supabase.request(this.tableName, {
      method: 'POST',
      body: {
        name,
        description,
        price,
        image_url: imageUrl,
        active
      }
    });

    const product = rows[0] || null;
    if (product) {
      await productSupplyModel.replaceProductSupplies(product.id, supplies);
      return this.findDetailedById(product.id);
    }

    return null;
  }

  async update(id, payload) {
    const { name, description, price, imageUrl, active, supplies = [] } = payload;
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
        active
      }
    });

    const product = rows[0] || null;
    if (product) {
      await productSupplyModel.replaceProductSupplies(product.id, supplies);
    }

    return this.findDetailedById(id);
  }

  async findActive() {
    const products = await supabase.request(this.tableName, {
      query: {
        select: '*',
        active: 'eq.true',
        order: 'id.asc'
      }
    });

    return this.attachSupplies(products);
  }

  async findAll(orderBy = 'id DESC') {
    const products = await super.findAll(orderBy);
    return this.attachSupplies(products);
  }

  async findDetailedById(id) {
    const product = await super.findById(id);
    if (!product) {
      return null;
    }

    const supplies = await productSupplyModel.findByProductId(id);
    return {
      ...product,
      supplies
    };
  }

  async findById(id) {
    return this.findDetailedById(id);
  }

  async attachSupplies(products) {
    const productIds = products.map((product) => product.id);
    const supplies = await productSupplyModel.findByProductIds(productIds);
    const suppliesByProduct = supplies.reduce((acc, supply) => {
      acc[supply.product_id] = acc[supply.product_id] || [];
      acc[supply.product_id].push(supply);
      return acc;
    }, {});

    return products.map((product) => ({
      ...product,
      supplies: suppliesByProduct[product.id] || []
    }));
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
