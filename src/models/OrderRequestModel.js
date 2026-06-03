const supabase = require('../config/supabase');
const BaseModel = require('./BaseModel');

class OrderRequestModel extends BaseModel {
  constructor() {
    super('order_requests');
  }

  async create(payload) {
    const rows = await supabase.request(this.tableName, {
      method: 'POST',
      body: {
        customer_id: payload.customerId,
        customer_name: payload.customerName,
        customer_email: payload.customerEmail,
        customer_phone: payload.customerPhone,
        notes: payload.notes,
        subtotal: payload.subtotal,
        delivery_fee: payload.deliveryFee,
        total: payload.total,
        status: 'pending',
        items: payload.items
      }
    });

    return rows[0] || null;
  }

  async updateStatus(id, status, orderId = null) {
    const rows = await supabase.request(this.tableName, {
      method: 'PATCH',
      query: {
        id: `eq.${id}`
      },
      body: {
        status,
        order_id: orderId
      }
    });

    return rows[0] || null;
  }
}

module.exports = new OrderRequestModel();
