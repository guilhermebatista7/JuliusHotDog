const produtosCardapio = [
    {
        id: 1,
        nome: "Tradicional",
        categoria: "hotdog",
        categoriaTexto: "Hot Dog",
        descricao: "Duas salsichas, batata palha, milho, maionese, ketchup e mostarda.",
        preco: 14.00,
        imagem: "../img/hotdog-tradicional.png"
    },

    {
        id: 2,
        nome: "Frango",
        categoria: "hotdog",
        categoriaTexto: "Hot Dog",
        descricao: "Duas salsichas, frango desfiado, batata palha, milho, maionese, ketchup e mostarda.",
        preco: 18.00,
        imagem: "../img/hotdog-frango.png"
    },

    {
        id: 3,
        nome: "Pizza",
        categoria: "hotdog",
        categoriaTexto: "Hot Dog",
        descricao: "Duas salsichas, presunto, muçarela, tomate, orégano, batata palha, milho, maionese, ketchup e mostarda.",
        preco: 18.00,
        imagem: "../img/hotdog-pizza.png"
    },

    {
        id: 4,
        nome: "Chefe",
        categoria: "hotdog",
        categoriaTexto: "Hot Dog",
        descricao: "Duas salsichas, rúcula, requeijão cremoso, alho frito, batata palha, milho, maionese, ketchup e mostarda",
        preco: 18.00,
        imagem: "../img/hotdog-chefe.png"
    },

    {
        id: 5,
        nome: "Bacon",
        categoria: "hotdog",
        categoriaTexto: "Hot Dog",
        descricao: "Duas salsichas, bacon, batata palha, milho, maionese, ketchup e mostarda",
        preco: 20.00,
        imagem: "../img/hotdog-bacon.png"
    },

    {
        id: 6,
        nome: "Coca-Cola 350ml",
        categoria: "bebidas",
        categoriaTexto: "Bebida",
        descricao: "Refrigerante Coca-Cola lata 350ml.",
        preco: 6.00,
        icone: "fa-glass-water"
    },

    {
        id: 7,
        nome: "Guaraná 350ml",
        categoria: "bebidas",
        categoriaTexto: "Bebida",
        descricao: "Refrigerante Guaraná lata 350ml.",
        preco: 5.00,
        icone: "fa-glass-water"
    },

    {
        id: 8,
        nome: "Fanta 350ml",
        categoria: "bebidas",
        categoriaTexto: "Bebida",
        descricao: "Refrigerante Fanta lata 350ml.",
        preco: 5.00,
        icone: "fa-glass-water"
    },

    {
        id: 9,
        nome: "Água sem gás",
        categoria: "bebidas",
        categoriaTexto: "Bebida",
        descricao: "Garrafa de água mineral sem gás.",
        preco: 3.00,
        icone: "fa-bottle-water"
    },

    {
        id: 10,
        nome: "Água com gás",
        categoria: "bebidas",
        categoriaTexto: "Bebida",
        descricao: "Garrafa de água mineral com gás.",
        preco: 3.00,
        icone: "fa-bottle-water"
    }
];

let carrinho = normalizarCarrinho(
    JSON.parse(localStorage.getItem("julios_cart")) ||
    JSON.parse(localStorage.getItem("carrinhoJulius")) ||
    []
);
const menuGrid = document.getElementById("menuGrid");
const cartModal = document.getElementById("cartModal");
const cartItemsList = document.getElementById("cart-items-list");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const cartCount2 = document.getElementById("cart-count2");

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizarCarrinho(itens) {
    return itens.map(item => ({
        id: item.id,
        name: item.name || item.nome,
        price: Number(item.price || item.preco),
        imageUrl: item.imageUrl || item.imagem,
        quantity: item.quantity || item.quantidade || 1
    }));
}

function renderizarCardapio(categoria = "todos") {
    const produtosFiltrados = categoria === "todos"
        ? produtosCardapio
        : produtosCardapio.filter(produto => produto.categoria === categoria);

    menuGrid.innerHTML = produtosFiltrados.map(produto => `
        <article class="menu-card">
            <div class="menu-card-image">
                ${produto.imagem
                    ? `<img src="${produto.imagem}" alt="${produto.nome}">`
                    : `<i class="fas ${produto.icone}"></i>`
                }
            </div>
            <div class="menu-card-body">
                <span class="menu-card-category">${produto.categoriaTexto}</span>
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="menu-card-footer">
                    <strong class="menu-price">${formatarMoeda(produto.preco)}</strong>
                    <button class="add-cart-btn" onclick="adicionarAoCarrinho(${produto.id})">
                        Adicionar
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

function adicionarAoCarrinho(id) {
    const produto = produtosCardapio.find(item => item.id === id);
    const itemExistente = carrinho.find(item => item.id === id);

    if (itemExistente) {
        itemExistente.quantity += 1;
    } else {
        carrinho.push({
            id: produto.id,
            name: produto.nome,
            price: produto.preco,
            imageUrl: produto.imagem,
            quantity: 1
        });
    }

    salvarCarrinho();
    atualizarCarrinho();
}

function removerDoCarrinho(id) {
    carrinho = carrinho.filter(item => item.id !== id);
    salvarCarrinho();
    atualizarCarrinho();
}

function alterarQuantidade(id, acao) {
    const item = carrinho.find(produto => produto.id === id);
    if (!item) return;

    if (acao === "mais") {
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
    localStorage.setItem("julios_cart", JSON.stringify(carrinho));
    localStorage.removeItem("carrinhoJulius");
}

function atualizarContadorCarrinho(totalItens) {
    [cartCount, cartCount2].forEach(contador => {
        if (!contador) return;

        contador.textContent = totalItens;
        contador.style.display = totalItens > 0 ? "flex" : "none";
    });
}

function atualizarCarrinho() {
    const totalItens = carrinho.reduce((total, item) => total + item.quantity, 0);
    const totalValor = carrinho.reduce((total, item) => total + item.price * item.quantity, 0);

    atualizarContadorCarrinho(totalItens);
    cartTotal.textContent = formatarMoeda(totalValor);

    if (carrinho.length === 0) {
        cartItemsList.innerHTML = "<p>Seu carrinho está vazio.</p>";
        return;
    }

    cartItemsList.innerHTML = carrinho.map(item => `
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
    `).join("");
}

function toggleCart() {
    cartModal.classList.toggle("active");
}

document.querySelectorAll(".category-btn").forEach(botao => {
    botao.addEventListener("click", () => {
        document.querySelectorAll(".category-btn").forEach(item => item.classList.remove("active"));
        botao.classList.add("active");
        renderizarCardapio(botao.dataset.category);
    });
});

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });
}

renderizarCardapio();
atualizarCarrinho();
