let PRODUTOS = [];
let INSUMOS = [];
let REPORT_PERIOD = 'day';

function formatCurrency(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatDateTime(value) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

function switchTab(evt, tabId) {
  document.querySelectorAll('.tab-content').forEach((content) => content.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((button) => button.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  evt.currentTarget.classList.add('active');
}

function openModal(id) {
  if (id === 'modalProduto') {
    const isEditing = Boolean(document.getElementById('prod-id').value);
    if (!isEditing) {
      renderProductSupplyFields();
    }
    toggleProductCategory();
  }

  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';

  if (id === 'modalProduto') {
    document.getElementById('form-produto').reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-prod-title').innerText = 'Produto';
    renderProductSupplyFields();
  }

  if (id === 'modalInsumo') {
    document.querySelector('#modalInsumo form').reset();
    document.getElementById('ins-available').checked = true;
    toggleInsumoTipo();
  }
}

function getSupplyName(id) {
  return INSUMOS.find((insumo) => Number(insumo.id) === Number(id))?.name || 'Insumo';
}

function getProductCategory(product) {
  return product.category || (String(product.name || '').toLowerCase().includes('350ml') || String(product.description || '').toLowerCase().includes('refrigerante') || String(product.description || '').toLowerCase().includes('agua') ? 'drink' : 'snack');
}

function getProductImage(product) {
  const name = String(product.name || '').toLowerCase();
  const existingImage = product.image_url || '';

  if (existingImage && !existingImage.includes('cachorroQuenteTrad.png')) {
    return existingImage;
  }

  if (getProductCategory(product) === 'drink') {
    return './img/hot-dog.png';
  }

  if (name.includes('frango')) return './img/hotdog-frango.webp';
  if (name.includes('bacon')) return './img/hotdog-bacon.webp';
  if (name.includes('pizza')) return './img/hotdog-pizza.webp';
  if (name.includes('chefe')) return './img/hotdog-chefe.webp';
  return './img/hotdog-tradicional.webp';
}

function renderProductList(containerId, products) {
  const container = document.getElementById(containerId);
  if (!container) {
    return;
  }

  if (products.length === 0) {
    container.innerHTML = '<p class="empty-admin-msg">Nenhum item cadastrado nesta secao.</p>';
    return;
  }

  container.innerHTML = products.map((produto) => {
    const supplyNames = (produto.supplies || [])
      .filter((supply) => supply.required)
      .map((supply) => getSupplyName(supply.supply_id))
      .join(', ');
    const isDrink = getProductCategory(produto) === 'drink';

    return `
      <div class="product-card-adm">
        <div>
          <h4>${produto.name}</h4>
          <p>${produto.description}</p>
          <span class="price">${formatCurrency(produto.price)}</span>
          <p>${isDrink
            ? `Tipo: ${getBeverageType(produto) === 'bottle' ? 'Garrafa' : 'Lata'} | Estoque: ${Number(produto.stock_quantity || 0)} un.`
            : `Insumos: ${supplyNames || 'Nenhum insumo vinculado'}`}</p>
        </div>
        <div class="card-actions">
          <button onclick="editarProduto(${produto.id})" style="background:none; border:none; color:#3498db; cursor:pointer;"><i class="fas fa-edit"></i></button>
          <button onclick="excluirProduto(${produto.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

function renderProdutos() {
  renderProductList('render-lanches', PRODUTOS.filter((produto) => getProductCategory(produto) !== 'drink'));
  renderProductList('render-bebidas', PRODUTOS.filter((produto) => getProductCategory(produto) === 'drink'));
}

function renderInsumos() {
  const container = document.getElementById('render-insumos');
  if (!container) {
    return;
  }

  container.innerHTML = INSUMOS.map((insumo) => {
    const isBoolean = Boolean(insumo.is_boolean);
    const status = isBoolean
      ? (insumo.available ? 'Disponivel' : 'Indisponivel')
      : `${Number(insumo.quantity)} ${insumo.unit}`;

    return `
      <div class="insumo-card-adm">
        <div>
          <h4>${insumo.name}</h4>
          <p>${isBoolean ? 'Controle por disponibilidade.' : 'Quantidade em estoque disponivel para uso.'}</p>
          <span class="stock-badge">${status}</span>
          ${isBoolean ? `
            <label class="checkbox-row compact">
              <input type="checkbox" ${insumo.available ? 'checked' : ''} onchange="salvarInsumo(${insumo.id}, { available: this.checked })">
              Disponivel
            </label>
          ` : `
            <div class="inline-stock-edit">
              <input type="number" id="ins-qtd-${insumo.id}" value="${Number(insumo.quantity)}" step="0.1" min="0">
              <button onclick="salvarInsumo(${insumo.id}, { quantity: Number(document.getElementById('ins-qtd-${insumo.id}').value) })">Salvar</button>
            </div>
          `}
        </div>
        <div class="card-actions">
          <button onclick="excluirInsumo(${insumo.id})" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

function renderProductSupplyFields(selectedSupplies = []) {
  const container = document.getElementById('prod-insumos');
  if (!container) {
    return;
  }

  const selectedBySupplyId = selectedSupplies.reduce((acc, supply) => {
    const supplyId = Number(
      supply.supply_id ??
      supply.supplyId ??
      supply.supply?.id
    );

    if (Number.isFinite(supplyId)) {
      acc[supplyId] = supply;
    }

    return acc;
  }, {});

  container.innerHTML = INSUMOS.map((insumo) => {
    const selected = selectedBySupplyId[Number(insumo.id)];
    const isRequired = selected && selected.required !== false && selected.required !== 'false';
    const checked = isRequired ? 'checked' : '';
    const quantity = selected?.quantity_required ??
      selected?.quantityRequired ??
      (insumo.is_boolean ? 0 : 1);
    const stateText = isRequired ? 'Vinculado' : 'Nao vinculado';

    return `
      <div class="ingredient-row">
        <label>
          <input
            type="checkbox"
            class="prod-supply-check"
            data-supply-id="${insumo.id}"
            onchange="atualizarEstadoInsumo(${insumo.id}, this.checked)"
            ${checked}
          >
          ${insumo.name}
        </label>
        <div class="ingredient-controls">
          ${insumo.is_boolean ? '<span class="ingredient-state">checkbox</span>' : `
            <input type="number" class="prod-supply-qty" data-supply-id="${insumo.id}" value="${quantity}" min="0" step="0.1">
          `}
          <span class="ingredient-state" data-supply-state="${insumo.id}">${stateText}</span>
        </div>
      </div>
    `;
  }).join('');
}

function atualizarEstadoInsumo(supplyId, isLinked) {
  const state = document.querySelector(`[data-supply-state="${supplyId}"]`);
  if (state) {
    state.textContent = isLinked ? 'Vinculado' : 'Nao vinculado';
  }
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
  renderProductSupplyFields();
}

async function carregarRelatorios() {
  const params = new URLSearchParams();
  params.set('period', REPORT_PERIOD);

  if (REPORT_PERIOD === 'day') {
    params.set('date', document.getElementById('report-date').value);
  } else if (REPORT_PERIOD === 'month') {
    params.set('month', document.getElementById('report-month').value);
    params.set('year', document.getElementById('report-month-year').value);
  } else {
    params.set('year', document.getElementById('report-year').value);
  }

  const response = await apiRequest(`/reports/dashboard?${params.toString()}`);
  const report = response.data;
  document.getElementById('fat-hoje').innerText = formatCurrency(report.revenue);
  document.getElementById('total-pedidos').innerText = report.totalOrders;
  document.getElementById('ticket-medio').innerText = formatCurrency(report.averageTicket);
  document.getElementById('report-period-label').innerText = getReportPeriodLabel(report);
  renderReportOrders(report.orders || []);
}

function getReportPeriodLabel(report) {
  if (report.period === 'day') {
    const [year, month, day] = report.date.split('-');
    return `${day}/${month}/${year}`;
  }

  if (report.period === 'year') {
    return `Ano de ${report.year}`;
  }

  const monthName = document.querySelector(`#report-month option[value="${report.month}"]`)?.textContent;
  return `${monthName || 'Mês'} de ${report.year}`;
}

function setReportPeriod(period) {
  REPORT_PERIOD = period;

  document.querySelectorAll('[data-report-period]').forEach((button) => {
    button.classList.toggle('active', button.dataset.reportPeriod === period);
  });

  document.querySelectorAll('[data-period-field]').forEach((field) => {
    field.hidden = field.dataset.periodField !== period;
  });
}

function formatOrderItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return 'Itens nao informados.';
  }

  return items.map((item) => {
    const quantity = item.quantity || item.quantidade || 1;
    const name = item.productName || item.product_name || item.name || item.nome || 'Produto';
    return `${quantity}x ${name}`;
  }).join(', ');
}

function renderReportOrders(orders) {
  const container = document.getElementById('report-orders-list');
  if (!container) {
    return;
  }

  if (!orders.length) {
    container.innerHTML = '<p class="empty-admin-msg">Nenhum pedido aceito encontrado para este filtro.</p>';
    return;
  }

  container.innerHTML = orders.map((order) => `
    <article class="report-order-card">
      <label class="report-order-check">
        <input type="checkbox">
        Feito
      </label>
      <div class="report-order-main">
        <div class="report-order-header">
          <h4>Pedido #${order.id}</h4>
          <strong>${formatCurrency(order.total)}</strong>
        </div>
        <p><strong>Cliente:</strong> ${order.customerName || 'Nao informado'}</p>
        <p><strong>Contato:</strong> ${order.customerPhone || order.customerEmail || 'Nao informado'}</p>
        <p><strong>Data:</strong> ${formatDateTime(order.createdAt)}</p>
        <p><strong>Itens:</strong> ${formatOrderItems(order.items)}</p>
        <p><strong>Observacoes:</strong> ${order.notes || 'Nenhuma'}</p>
      </div>
    </article>
  `).join('');
}

function getSelectedProductSupplies() {
  if (document.getElementById('prod-category').value === 'drink') {
    return [];
  }

  return [...document.querySelectorAll('.prod-supply-check')]
    .filter((input) => input.checked)
    .map((input) => {
      const supplyId = Number(input.dataset.supplyId);
      const supply = INSUMOS.find((item) => Number(item.id) === supplyId);
      const quantityInput = document.querySelector(`.prod-supply-qty[data-supply-id="${supplyId}"]`);

      return {
        supplyId,
        quantityRequired: supply?.is_boolean ? 0 : Number(quantityInput?.value || 0),
        required: true
      };
    });
}

async function salvarProduto(event) {
  event.preventDefault();

  const id = document.getElementById('prod-id').value;
  const existingProduct = id
    ? PRODUTOS.find((product) => Number(product.id) === Number(id))
    : null;
  const category = document.getElementById('prod-category').value;
  const beverageType = document.getElementById('prod-beverage-type').value;
  const rawDescription = document.getElementById('prod-desc').value;
  const price = Number(document.getElementById('prod-preco').value);
  const stockQuantity = Number(document.getElementById('prod-stock-quantity').value);

  if (!Number.isFinite(price) || price <= 0) {
    alert('O preco do produto deve ser maior que zero.');
    return;
  }

  if (category === 'drink' && (!Number.isInteger(stockQuantity) || stockQuantity < 0)) {
    alert('Informe as unidades da bebida com um numero inteiro maior ou igual a zero.');
    return;
  }

  const drinkSuffix = beverageType === 'bottle' ? 'Garrafa.' : 'Lata.';
  const payload = {
    name: document.getElementById('prod-nome').value,
    description: category === 'drink' && !rawDescription.toLowerCase().includes(drinkSuffix.toLowerCase())
      ? `${rawDescription} ${drinkSuffix}`
      : rawDescription,
    price,
    imageUrl: existingProduct?.image_url,
    category,
    beverageType,
    stockQuantity: category === 'drink' ? stockQuantity : undefined,
    active: true,
    supplies: getSelectedProductSupplies()
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
  document.getElementById('prod-category').value = getProductCategory(produto);
  document.getElementById('prod-beverage-type').value = getBeverageType(produto);
  document.getElementById('prod-stock-quantity').value = Number(produto.stock_quantity || 0);
  document.getElementById('modal-prod-title').innerText = 'Editar Produto';
  renderProductSupplyFields(produto.supplies || []);
  toggleProductCategory();
  openModal('modalProduto');
}

function getBeverageType(product) {
  const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  return text.includes('garrafa') || text.includes('agua') || text.includes('água') ? 'bottle' : 'can';
}

function toggleProductCategory() {
  const category = document.getElementById('prod-category')?.value || 'snack';
  const drinkTypeGroup = document.getElementById('drink-type-group');
  const drinkStockGroup = document.getElementById('drink-stock-group');
  const stockInput = document.getElementById('prod-stock-quantity');
  const ingredientsGroup = document.getElementById('prod-insumos')?.closest('.input-group-admin');

  if (drinkTypeGroup) {
    drinkTypeGroup.style.display = category === 'drink' ? 'flex' : 'none';
  }

  if (drinkStockGroup) {
    drinkStockGroup.style.display = category === 'drink' ? 'flex' : 'none';
  }

  if (stockInput) {
    stockInput.required = category === 'drink';
    if (category !== 'drink') {
      stockInput.value = '';
    }
  }

  if (ingredientsGroup) {
    ingredientsGroup.style.display = category === 'drink' ? 'none' : 'flex';
  }
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

function toggleInsumoTipo() {
  const isBoolean = document.getElementById('ins-boolean').checked;
  document.getElementById('ins-qtd').disabled = isBoolean;
  document.getElementById('ins-unid').disabled = isBoolean;
  document.getElementById('ins-qtd').required = !isBoolean;
}

async function adicionarInsumo(event) {
  event.preventDefault();

  const isBoolean = document.getElementById('ins-boolean').checked;
  const payload = {
    name: document.getElementById('ins-nome').value,
    quantity: isBoolean ? 0 : Number(document.getElementById('ins-qtd').value),
    unit: document.getElementById('ins-unid').value,
    isBoolean,
    available: document.getElementById('ins-available').checked
  };

  try {
    await apiRequest('/supplies', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    await carregarInsumos();
    closeModal('modalInsumo');
  } catch (error) {
    alert(error.message);
  }
}

async function salvarInsumo(id, changes) {
  const insumo = INSUMOS.find((item) => item.id === id);
  if (!insumo) {
    return;
  }

  const payload = {
    name: insumo.name,
    quantity: changes.quantity ?? insumo.quantity,
    unit: insumo.unit,
    isBoolean: insumo.is_boolean,
    available: changes.available ?? insumo.available
  };

  try {
    await apiRequest(`/supplies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    await carregarInsumos();
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
    await carregarProdutos();
  } catch (error) {
    alert(error.message);
  }
}

function setupReportFilters() {
  const monthSelect = document.getElementById('report-month');
  const dateInput = document.getElementById('report-date');
  const monthYearInput = document.getElementById('report-month-year');
  const yearInput = document.getElementById('report-year');
  if (!monthSelect || !dateInput || !monthYearInput || !yearInput) {
    return;
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const now = new Date();
  monthSelect.innerHTML = monthNames.map((name, index) => `
    <option value="${index + 1}" ${index === now.getMonth() ? 'selected' : ''}>${name}</option>
  `).join('');
  const localToday = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');
  dateInput.value = localToday;
  monthYearInput.value = now.getFullYear();
  yearInput.value = now.getFullYear();
  setReportPeriod('day');
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
  setupReportFilters();
  toggleInsumoTipo();

  try {
    const session = await apiRequest('/auth/me');
    if (!session || session.data.role !== 'admin') {
      alert('Acesso permitido apenas para administrador.');
      window.location.href = '../index.html';
      return;
    }

    await carregarInsumos();
    await Promise.all([
      carregarProdutos(),
      carregarRelatorios()
    ]);
  } catch (error) {
    alert(error.message);
  }
}

window.onload = init;
