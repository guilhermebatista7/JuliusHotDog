const supabase = require('../config/supabase');

function mapOrder(orderBy) {
  const [column = 'id', direction = 'DESC'] = String(orderBy).split(/\s+/);
  return `${column}.${direction.toLowerCase()}`;
}

class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findAll(orderBy = 'id DESC') {
    return supabase.request(this.tableName, {
      query: {
        select: '*',
        order: mapOrder(orderBy)
      }
    });
  }

  async findById(id) {
    const rows = await supabase.request(this.tableName, {
      query: {
        select: '*',
        id: `eq.${id}`,
        limit: 1
      }
    });

    return rows[0] || null;
  }

  async deleteById(id) {
    const rows = await supabase.request(this.tableName, {
      method: 'DELETE',
      query: {
        id: `eq.${id}`
      }
    });

    return rows.length > 0;
  }
}

module.exports = BaseModel;
