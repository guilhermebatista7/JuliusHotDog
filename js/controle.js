let PRODUTOS = [];
let INSUMOS = [];

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function switchTab(evt, tabId) {
  document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((button) => button.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  evt.currentTarget.classList.add('active');
}

function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';

  if (id === 'modalProduto') {
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-prod-title').innerText = 'Produto';
  }
}

function renderProdutos() {
  const container = document.getElementById('render-produtos');
  if (!container) {
    return;
  }

  container.innerHTML = PRODUTOS.map((produto) => `
    <div class="product-card-adm">
      <div>
        <h4>${produto.name}</h4>
        <p>${produto.description}</p>
        <span class="price">${formatCurrency(produto.price)}</span>
        <p>Estoque: ${produto.stock_quantity ?? 0}</p>
      </div>
      <div class="card-actions">
        <button onclick="editarProduto(${produto.id})" style="background:none; border:none; color:#3498db; cursor:pointer;"><i class="fas fa-edit"></i></button>
        <button onclick="excluirProduto(${produto.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function renderInsumos() {
  const container = document.getElementById('render-insumos');
  if (!container) {
    return;
  }

  container.innerHTML = INSUMOS.map((insumo) => `
    <div class="insumo-card-adm">
      <div>
        <h4>${insumo.name}</h4>
        <p>Quantidade em estoque disponivel para uso.</p>
        <span class="stock-badge">${insumo.quantity} ${insumo.unit}</span>
      </div>
      <div class="card-actions">
        <button onclick="excluirInsumo(${insumo.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

async function carregarProdutos() {
  const response = await apiRequest('/products');
  PRODUTOS = response.data || [];
  renderProdutos();
}

async function carregarInsumos() {
  const response = await apiRequest('/supplies');
  INSUMOS = response.data || [];
  renderInsumos();
}

async function carregarRelatorios() {
  const response = await apiRequest('/reports/dashboard');
  const report = response.data;
  document.getElementById('fat-hoje').innerText = formatCurrency(report.revenue);
  document.getElementById('total-pedidos').innerText = report.totalOrders;
}

async function salvarProduto(event) {
  event.preventDefault();

  const id = document.getElementById('prod-id').value;
  const payload = {
    name: document.getElementById('prod-nome').value,
    description: document.getElementById('prod-desc').value,
    price: Number(document.getElementById('prod-preco').value),
    stockQuantity: Number(document.getElementById('prod-estoque').value),
    imageUrl: './img/cachorroQuenteTrad.png',
    active: true
  };

  try {
    if (id) {
      await apiRequest(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    } else {
      await apiRequest('/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }

    await carregarProdutos();
    await carregarRelatorios();
    closeModal('modalProduto');
  } catch (error) {
    alert(error.message);
  }
}

function editarProduto(id) {
  const produto = PRODUTOS.find((item) => item.id === id);
  if (!produto) {
    return;
  }

  document.getElementById('prod-id').value = produto.id;
  document.getElementById('prod-nome').value = produto.name;
  document.getElementById('prod-desc').value = produto.description;
  document.getElementById('prod-preco').value = produto.price;
  document.getElementById('prod-estoque').value = produto.stock_quantity ?? 0;
  document.getElementById('modal-prod-title').innerText = 'Editar Produto';
  openModal('modalProduto');
}

async function excluirProduto(id) {
  if (!confirm('Remover do cardapio?')) {
    return;
  }

  try {
    await apiRequest(`/products/${id}`, { method: 'DELETE' });
    await carregarProdutos();
    await carregarRelatorios();
  } catch (error) {
    alert(error.message);
  }
}

async function adicionarInsumo(event) {
  event.preventDefault();

  const payload = {
    name: document.getElementById('ins-nome').value,
    quantity: Number(document.getElementById('ins-qtd').value),
    unit: document.getElementById('ins-unid').value
  };

  try {
    await apiRequest('/supplies', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    await carregarInsumos();
    document.querySelector('#modalInsumo form').reset();
    closeModal('modalInsumo');
  } catch (error) {
    alert(error.message);
  }
}

async function excluirInsumo(id) {
  if (!confirm('Excluir este insumo?')) {
    return;
  }

  try {
    await apiRequest(`/supplies/${id}`, { method: 'DELETE' });
    await carregarInsumos();
  } catch (error) {
    alert(error.message);
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

  try {
    const session = await apiRequest('/auth/me');
    if (!session || session.data.role !== 'admin') {
      alert('Acesso permitido apenas para administrador.');
      window.location.href = '../index.html';
      return;
    }

    await Promise.all([
      carregarProdutos(),
      carregarInsumos(),
      carregarRelatorios()
    ]);
  } catch (error) {
    alert(error.message);
  }
}

window.onload = init;
