const supabase = require('../config/supabase');
const BaseModel = require('./BaseModel');

class ProductSupplyModel extends BaseModel {
  constructor() {
    super('product_supplies');
  }

  async findByProductId(productId) {
    return supabase.request(this.tableName, {
      query: {
        select: '*',
        product_id: `eq.${productId}`,
        order: 'id.asc'
      }
    });
  }

  async findByProductIds(productIds) {
    if (!productIds.length) {
      return [];
    }

    return supabase.request(this.tableName, {
      query: {
        select: '*',
        product_id: `in.(${productIds.join(',')})`,
        order: 'id.asc'
      }
    });
  }

  async replaceProductSupplies(productId, supplies) {
    await supabase.request(this.tableName, {
      method: 'DELETE',
      query: {
        product_id: `eq.${productId}`
      },
      prefer: 'return=minimal'
    });

    if (!supplies.length) {
      return [];
    }

    return supabase.request(this.tableName, {
      method: 'POST',
      body: supplies.map((supply) => ({
        product_id: productId,
        supply_id: supply.supplyId,
        quantity_required: supply.quantityRequired,
        required: supply.required
      }))
    });
  }
}

module.exports = new ProductSupplyModel();
