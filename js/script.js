const fallbackProducts = [
  {
    id: 1,
    name: 'Tradicional',
    description: 'Duas salsichas, batata palha, milho, maionese, ketchup e mostarda.',
    price: 14.00,
    image_url: './img/hotdog-tradicional.png'
  },
  {
    id: 2,
    name: 'Frango',
    description: 'Duas salsichas, frango desfiado, batata palha, milho, maionese, ketchup e mostarda.',
    price: 18.00,
    image_url: './img/hotdog-frango.png'
  },
  {
    id: 3,
    name: 'Pizza',
    description: 'Duas salsichas, presunto, mucarela, tomate, oregano, batata palha, milho, maionese, ketchup e mostarda.',
    price: 18.00,
    image_url: './img/hotdog-pizza.png'
  },
  {
    id: 4,
    name: 'Chefe',
    description: 'Duas salsichas, rucula, requeijao cremoso, alho frito, batata palha, milho, maionese, ketchup e mostarda.',
    price: 18.00,
    image_url: './img/hotdog-chefe.png'
  },
  {
    id: 5,
    name: 'Bacon',
    description: 'Duas salsichas, bacon, batata palha, milho, maionese, ketchup e mostarda.',
    price: 20.00,
    image_url: './img/hotdog-bacon.png'
  }
];

let products = fallbackProducts;
let cart = normalizeCart(
  JSON.parse(localStorage.getItem('julios_cart')) ||
  JSON.parse(localStorage.getItem('carrinhoJulius')) ||
  []
);

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

async function loadProducts() {
  const response = await apiRequest('/products?active=true');
  products = response.data || [];
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if (!grid) {
    return;
  }

  const homeProducts = products.filter((product) =>
    ['tradicional', 'frango', 'bacon'].includes(product.name.toLowerCase())
  );

  grid.innerHTML = homeProducts.map((product) => `
    <div class="card">
      <img src="${getProductImage(product)}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p style="font-size: 0.85rem; color: #888; margin: 10px 0;">${product.description}</p>
      <div style="color: #fff; font-weight: bold; font-size: 1.4rem; margin-bottom: 15px;">${formatCurrency(product.price)}</div>
      <a class="btn-primary" href="pages/cardapio.html">VER CARDAPIO COMPLETO</a>
    </div>
  `).join('');
}

function getProductImage(product) {
  const image = product.image_url || '';
  const name = String(product.name || '').toLowerCase();

  if (image && !image.includes('cachorroQuenteTrad.png')) {
    return image;
  }

  if (name.includes('frango')) return './img/hotdog-frango.png';
  if (name.includes('bacon')) return './img/hotdog-bacon.png';
  return './img/hotdog-tradicional.png';
}

function addToCart(id, event) {
  const product = products.find((item) => item.id === id);
  if (!product) {
    alert('Produto nao encontrado.');
    return;
  }

  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl: getProductImage(product),
      quantity: 1
    });
  }

  saveAndRefresh();

  const button = event?.target;
  if (button) {
    const originalLabel = button.innerText;
    button.innerText = 'ADICIONADO!';
    setTimeout(() => {
      button.innerText = originalLabel;
    }, 1000);
  }
}

function saveAndRefresh() {
  localStorage.setItem('julios_cart', JSON.stringify(cart));
  localStorage.removeItem('carrinhoJulius');
  updateUI();
}

function updateUI() {
  const count = document.getElementById('cart-count');
  const count2 = document.getElementById('cart-count2');
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (count) {
    count.innerText = totalItems;
    count.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  if (count2) {
    count2.innerText = totalItems;
    count2.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

function setupMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.onclick = () => {
      navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
    };
  }
}

async function init() {
  setupMenu();
  updateUI();

  try {
    await loadProducts();
    renderProducts();
  } catch (error) {
    products = fallbackProducts;
    renderProducts();
  }
}

init();
