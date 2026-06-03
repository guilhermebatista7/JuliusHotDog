const supabase = require('../config/supabase');
const BaseModel = require('./BaseModel');

class SupplyModel extends BaseModel {
  constructor() {
    super('supplies');
  }

  async create(payload) {
    const rows = await supabase.request(this.tableName, {
      method: 'POST',
      body: payload
    });

    return rows[0] || null;
  }

  async update(id, payload) {
    const rows = await supabase.request(this.tableName, {
      method: 'PATCH',
      query: {
        id: `eq.${id}`
      },
      body: payload
    });

    return rows[0] || null;
  }
}

module.exports = new SupplyModel();
