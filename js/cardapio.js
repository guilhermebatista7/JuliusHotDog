const produtosFallback = [
  {
    id: 1,
    name: 'Tradicional',
    category: 'snack',
    description: 'Duas salsichas, batata palha, milho, maionese, ketchup e mostarda.',
    price: 14.00,
    image_url: '../img/hotdog-tradicional.webp'
  },
  {
    id: 2,
    name: 'Frango',
    category: 'snack',
    description: 'Duas salsichas, frango desfiado, batata palha, milho, maionese, ketchup e mostarda.',
    price: 18.00,
    image_url: '../img/hotdog-frango.webp'
  },
  {
    id: 5,
    name: 'Bacon',
    category: 'snack',
    description: 'Duas salsichas, bacon, batata palha, milho, maionese, ketchup e mostarda.',
    price: 20.00,
    image_url: '../img/hotdog-bacon.webp'
  }
];

let produtosCardapio = produtosFallback;
let carrinho = normalizarCarrinho(
  JSON.parse(localStorage.getItem('julios_cart')) ||
  JSON.parse(localStorage.getItem('carrinhoJulius')) ||
  []
);

const menuGrid = document.getElementById('menuGrid');
const cartModal = document.getElementById('cartModal');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const cartCount2 = document.getElementById('cart-count2');

function formatarMoeda(valor) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function normalizarCarrinho(itens) {
  return itens.map((item) => ({
    id: item.id,
    name: item.name || item.nome,
    price: Number(item.price || item.preco),
    imageUrl: item.imageUrl || item.imagem,
    quantity: item.quantity || item.quantidade || 1
  }));
}

function normalizarImagem(produto) {
  const rawImage = produto.image_url || produto.imagem || '';
  const name = String(produto.name || produto.nome || '').toLowerCase();
  const category = obterCategoria(produto);

  if (rawImage && !rawImage.includes('cachorroQuenteTrad.png')) {
    return rawImage.replace('./img/', '../img/');
  }

  if (category === 'drink') {
    return '../img/hot-dog.png';
  }

  if (name.includes('frango')) return '../img/hotdog-frango.webp';
  if (name.includes('bacon')) return '../img/hotdog-bacon.webp';
  if (name.includes('pizza')) return '../img/hotdog-pizza.webp';
  if (name.includes('chefe')) return '../img/hotdog-chefe.webp';
  return '../img/hotdog-tradicional.webp';
}

function obterCategoria(produto) {
  const text = `${produto.name || produto.nome || ''} ${produto.description || produto.descricao || ''}`.toLowerCase();
  return produto.category || produto.categoria || (text.includes('refrigerante') || text.includes('agua') || text.includes('água') || text.includes('garrafa') || text.includes('lata') ? 'drink' : 'snack');
}

function categoriaTexto(produto) {
  return obterCategoria(produto) === 'drink' ? 'Bebida' : 'Hot Dog';
}

function hasCustomProductImage(produto) {
  const image = String(produto.image_url || produto.imagem || '');
  return image && !image.endsWith('/hot-dog.png') && !image.endsWith('hot-dog.png');
}

async function carregarProdutos() {
  try {
    const response = await apiRequest('/products?active=true');
    produtosCardapio = response.data || produtosFallback;
  } catch (error) {
    produtosCardapio = produtosFallback;
  }
}

function renderizarCardapio(categoria = 'todos') {
  const produtosFiltrados = categoria === 'todos'
    ? [...produtosCardapio].sort((a, b) => {
      const categoryOrder = { snack: 0, drink: 1 };
      return categoryOrder[obterCategoria(a)] - categoryOrder[obterCategoria(b)];
    })
    : produtosCardapio.filter((produto) => obterCategoria(produto) === categoria);

  menuGrid.innerHTML = produtosFiltrados.map((produto) => `
    <article class="menu-card">
      <div class="menu-card-image">
        ${!hasCustomProductImage(produto)
          ? `<i class="fas ${getProductIcon(produto)}" aria-label="${produto.name}"></i>`
          : `<img
              src="${normalizarImagem(produto)}"
              alt="${produto.name}"
              loading="lazy"
              decoding="async"
              onerror="this.src='../img/hot-dog.png'"
            >`
        }
      </div>
      <div class="menu-card-body">
        <span class="menu-card-category">${categoriaTexto(produto)}</span>
        <h3>${produto.name}</h3>
        <p>${produto.description}</p>
        <div class="menu-card-footer">
          <strong class="menu-price">${formatarMoeda(produto.price)}</strong>
          <button class="add-cart-btn" onclick="adicionarAoCarrinho(${produto.id})">
            Adicionar
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

function getProductIcon(produto) {
  if (obterCategoria(produto) !== 'drink') {
    return 'fa-hotdog';
  }

  const text = `${produto.name || ''} ${produto.description || ''}`.toLowerCase();
  return text.includes('garrafa') || text.includes('agua') || text.includes('água') ? 'fa-bottle-water' : 'fa-glass-water';
}

function adicionarAoCarrinho(id) {
  const produto = produtosCardapio.find((item) => item.id === id);
  const itemExistente = carrinho.find((item) => item.id === id);

  if (itemExistente) {
    itemExistente.quantity += 1;
  } else {
    carrinho.push({
      id: produto.id,
      name: produto.name,
      price: Number(produto.price),
      imageUrl: normalizarImagem(produto),
      quantity: 1
    });
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter((item) => item.id !== id);
  salvarCarrinho();
  atualizarCarrinho();
}

function alterarQuantidade(id, acao) {
  const item = carrinho.find((produto) => produto.id === id);
  if (!item) return;

  if (acao === 'mais') {
    item.quantity += 1;
  } else {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      removerDoCarrinho(id);
      return;
    }
  }

  salvarCarrinho();
  atualizarCarrinho();
}

function salvarCarrinho() {
  localStorage.setItem('julios_cart', JSON.stringify(carrinho));
  localStorage.removeItem('carrinhoJulius');
}

function atualizarContadorCarrinho(totalItens) {
  [cartCount, cartCount2].forEach((contador) => {
    if (!contador) return;

    contador.textContent = totalItens;
    contador.style.display = totalItens > 0 ? 'flex' : 'none';
  });
}

function atualizarCarrinho() {
  const totalItens = carrinho.reduce((total, item) => total + item.quantity, 0);
  const totalValor = carrinho.reduce((total, item) => total + item.price * item.quantity, 0);

  atualizarContadorCarrinho(totalItens);
  cartTotal.textContent = formatarMoeda(totalValor);

  if (carrinho.length === 0) {
    cartItemsList.innerHTML = '<p>Seu carrinho esta vazio.</p>';
    return;
  }

  cartItemsList.innerHTML = carrinho.map((item) => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <small>${formatarMoeda(item.price)} cada</small>
      </div>
      <div class="cart-item-actions">
        <button onclick="alterarQuantidade(${item.id}, 'menos')">-</button>
        <span>${item.quantity}</span>
        <button onclick="alterarQuantidade(${item.id}, 'mais')">+</button>
        <button onclick="removerDoCarrinho(${item.id})">remover</button>
      </div>
    </div>
  `).join('');
}

function toggleCart() {
  cartModal.classList.toggle('active');
}

document.querySelectorAll('.category-btn').forEach((botao) => {
  botao.addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach((item) => item.classList.remove('active'));
    botao.classList.add('active');
    renderizarCardapio(botao.dataset.category);
  });
});

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

async function init() {
  await carregarProdutos();
  renderizarCardapio();
  atualizarCarrinho();
}

init();
