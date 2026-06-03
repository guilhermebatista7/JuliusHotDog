const supabase = require('../config/supabase');
const BaseModel = require('./BaseModel');

class UserModel extends BaseModel {
  constructor() {
    super('users');
  }

  async create(payload) {
    const { name, email, phone, passwordHash, role } = payload;
    const rows = await supabase.request(this.tableName, {
      method: 'POST',
      body: {
        name,
        email,
        phone,
        password_hash: passwordHash,
        role
      }
    });

    return this.sanitize(rows[0]);
  }

  async update(id, payload) {
    const rows = await supabase.request(this.tableName, {
      method: 'PATCH',
      query: {
        id: `eq.${id}`
      },
      body: payload
    });

    return this.sanitize(rows[0]);
  }

  async updatePassword(id, passwordHash) {
    await supabase.request(this.tableName, {
      method: 'PATCH',
      query: {
        id: `eq.${id}`
      },
      body: {
        password_hash: passwordHash
      }
    });
  }

  async findByEmail(email) {
    const rows = await supabase.request(this.tableName, {
      query: {
        select: '*',
        email: `eq.${email}`,
        limit: 1
      }
    });

    return rows[0] || null;
  }

  async findSafeById(id) {
    const rows = await supabase.request(this.tableName, {
      query: {
        select: 'id,name,email,phone,role,created_at,updated_at',
        id: `eq.${id}`,
        limit: 1
      }
    });

    return rows[0] || null;
  }

  async findAllSafe() {
    return supabase.request(this.tableName, {
      query: {
        select: 'id,name,email,phone,role,created_at,updated_at',
        order: 'id.desc'
      }
    });
  }

  sanitize(user) {
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}

module.exports = new UserModel();
