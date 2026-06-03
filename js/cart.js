let cart = normalizeCart(
  JSON.parse(localStorage.getItem('julios_cart')) ||
  JSON.parse(localStorage.getItem('carrinhoJulius')) ||
  []
);
let DELIVERY_FEE = 5;
let WHATSAPP_NUMBER = '5511999999999';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function normalizeCart(items) {
  return items.map((item) => ({
    id: item.id,
    name: item.name || item.nome,
    price: Number(item.price || item.preco),
    imageUrl: item.imageUrl || item.imagem,
    quantity: item.quantity || item.quantidade || 1
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  initCartPage();
});

async function initCartPage() {
  setupMobileMenu();
  updateBadge();

  try {
    const response = await apiRequest('/reports/public-config');
    DELIVERY_FEE = Number(response.data.deliveryFee || 5);
    WHATSAPP_NUMBER = response.data.whatsappNumber || WHATSAPP_NUMBER;
    updateDeliveryFeeLabel();
  } catch (error) {
    console.warn(error.message);
  }

  renderCart();
}

function renderCart() {
  const container = document.getElementById('cart-items');
  if (!container) {
    return;
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <p class="empty-msg" style="font-size: 1.2rem; color: #666;">Seu carrinho esta vazio.</p>
        <a href="/pages/cardapio.html" class="btn-primary" style="display: inline-block; margin-top: 20px; width: auto; padding: 10px 30px;">VER CARDAPIO</a>
      </div>`;
    updatePriceDisplay(0);
    return;
  }

  container.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="item-info">
        <h4>${item.name}</h4>
        <p>${formatCurrency(item.price)}</p>
      </div>
      <div class="item-actions">
        <div class="qty-selector" style="display: flex; align-items: center; background: #000; border-radius: 5px; border: 1px solid #333;">
          <button class="btn-qty" onclick="changeQty(${index}, -1)" style="padding: 5px 12px; border: none; background: none; color: #793011; cursor: pointer; font-weight: bold;">-</button>
          <span style="min-width: 20px; text-align: center;">${item.quantity}</span>
          <button class="btn-qty" onclick="changeQty(${index}, 1)" style="padding: 5px 12px; border: none; background: none; color: #4ec915; cursor: pointer; font-weight: bold;">+</button>
        </div>
        <button class="btn-remove" onclick="removeItem(${index})" style="background: none; border: none; color: #ff4757; cursor: pointer; font-size: 1.1rem; margin-left: 10px;">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  `).join('');

  calculateTotals();
}

function updateDeliveryFeeLabel() {
  const feeLabel = document.getElementById('delivery-fee');
  if (feeLabel) {
    feeLabel.innerText = formatCurrency(DELIVERY_FEE);
  }
}

function changeQty(index, delta) {
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    removeItem(index);
    return;
  }

  saveAndRefresh();
}

function removeItem(index) {
  if (!confirm('Remover este item do pedido?')) {
    return;
  }

  cart.splice(index, 1);
  saveAndRefresh();
}

function saveAndRefresh() {
  localStorage.setItem('julios_cart', JSON.stringify(cart));
  localStorage.removeItem('carrinhoJulius');
  renderCart();
  updateBadge();
}

function calculateTotals() {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  updatePriceDisplay(subtotal, DELIVERY_FEE);
}

function updatePriceDisplay(subtotal, fee = 0) {
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total-geral');

  if (subtotalEl) {
    subtotalEl.innerText = formatCurrency(subtotal);
  }

  if (totalEl) {
    totalEl.innerText = formatCurrency(subtotal + (subtotal > 0 ? fee : 0));
  }
}

function updateBadge() {
  const badge = document.getElementById('cart-count');
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (badge) {
    badge.innerText = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

async function finalizarPedido() {
  if (cart.length === 0) {
    alert('Adicione itens antes de finalizar!');
    return;
  }

  const observation = document.getElementById('cart-obs').value;

  try {
    const response = await apiRequest('/orders/request', {
      method: 'POST',
      body: JSON.stringify({
        notes: observation,
        deliveryFee: DELIVERY_FEE,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        }))
      })
    });

    if (!response) return;

    localStorage.removeItem('julios_cart');
    localStorage.removeItem('carrinhoJulius');
    cart = [];
    renderCart();
    updateBadge();

    alert('Pedido enviado para aprovacao do Julius. Voce recebera a resposta por SMS.');
  } catch (error) {
    alert(error.message);
  }
}

function setupMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.onclick = () => {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    };
  }
}
