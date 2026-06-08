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

  async getAcceptedSummary(filters = {}) {
    const requests = (await this.findAll('id DESC')).filter((request) => {
      if (request.status !== 'accepted') {
        return false;
      }

      const createdAt = new Date(request.created_at).getTime();
      const startsAt = filters.startDate ? new Date(filters.startDate).getTime() : null;
      const endsAt = filters.endDate ? new Date(filters.endDate).getTime() : null;

      return (!startsAt || createdAt >= startsAt) && (!endsAt || createdAt < endsAt);
    });

    return {
      totalOrders: requests.length,
      totalRevenue: requests.reduce((total, request) => total + Number(request.total || 0), 0)
    };
  }
}

module.exports = new OrderRequestModel();
