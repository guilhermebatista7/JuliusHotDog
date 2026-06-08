const supabase = require('../config/supabase');
const BaseModel = require('./BaseModel');

class OrderModel extends BaseModel {
  constructor() {
    super('orders');
  }

  async create(payload) {
    const {
      customerId,
      customerName,
      customerEmail,
      notes,
      subtotal,
      deliveryFee,
      total,
      status,
      items
    } = payload;

    const orders = await supabase.request(this.tableName, {
      method: 'POST',
      body: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        notes,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        status
      }
    });

    const order = orders[0];

    try {
      await supabase.request('order_items', {
        method: 'POST',
        body: items.map((item) => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.productName,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          line_total: item.lineTotal
        }))
      });
    } catch (error) {
      await this.deleteById(order.id);
      throw error;
    }

    return this.findDetailedById(order.id);
  }

  async updateStatus(id, status) {
    await supabase.request(this.tableName, {
      method: 'PATCH',
      query: {
        id: `eq.${id}`
      },
      body: {
        status
      }
    });

    return this.findDetailedById(id);
  }

  async findDetailedById(id) {
    const order = await this.findById(id);
    if (!order) {
      return null;
    }

    const items = await supabase.request('order_items', {
      query: {
        select: '*',
        order_id: `eq.${id}`,
        order: 'id.asc'
      }
    });

    return {
      ...order,
      items
    };
  }

  async findAllDetailed() {
    const orders = await this.findAll('id DESC');
    const results = [];

    for (const order of orders) {
      const items = await supabase.request('order_items', {
        query: {
          select: '*',
          order_id: `eq.${order.id}`,
          order: 'id.asc'
        }
      });
      results.push({ ...order, items });
    }

    return results;
  }

  async deleteOrder(id) {
    return this.deleteById(id);
  }

  async getSummary(filters = {}) {
    const orders = (await this.findAll('id DESC')).filter((order) => {
      const createdAt = new Date(order.created_at).getTime();
      const startsAt = filters.startDate ? new Date(filters.startDate).getTime() : null;
      const endsAt = filters.endDate ? new Date(filters.endDate).getTime() : null;

      return (!startsAt || createdAt >= startsAt) && (!endsAt || createdAt < endsAt);
    });

    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((total, order) => total + Number(order.total || 0), 0)
    };
  }
}

module.exports = new OrderModel();
