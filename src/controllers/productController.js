const productModel = require('../models/ProductModel');
const HttpError = require('../utils/httpError');
const { success } = require('../utils/apiResponse');

function mapProductPayload(body, existingProduct = null) {
  const normalizedActive = body.active === undefined
    ? true
    : body.active === true || body.active === 'true' || body.active === 1 || body.active === '1';

  const category = body.category === 'drink' || body.category === 'bebida' ? 'drink' : 'snack';
  const beverageType = category === 'drink' && body.beverageType === 'bottle' ? 'bottle' : (category === 'drink' ? 'can' : null);
  const defaultImage = category === 'drink'
    ? './img/hot-dog.png'
    : './img/hotdog-tradicional.webp';

  return {
    name: body.name,
    description: body.description,
    price: Number(body.price),
    imageUrl: body.imageUrl || existingProduct?.image_url || defaultImage,
    active: normalizedActive,
    category,
    beverageType,
    supplies: Array.isArray(body.supplies)
      ? body.supplies.map((supply) => ({
        supplyId: Number(supply.supplyId ?? supply.supply_id),
        quantityRequired: Number(supply.quantityRequired ?? supply.quantity_required ?? 0),
        required: supply.required === undefined
          ? true
          : supply.required === true || supply.required === 'true' || supply.required === 1 || supply.required === '1'
      })).filter((supply) => supply.supplyId && !Number.isNaN(supply.quantityRequired))
      : []
  };
}

function validateProductPayload(payload) {
  if (!payload.name || !payload.description || Number.isNaN(payload.price)) {
    throw new HttpError(400, 'Nome, descricao e preco sao obrigatorios.');
  }
}

async function listProducts(req, res) {
  const onlyActive = req.query.active === 'true';
  const data = onlyActive ? await productModel.findActive() : await productModel.findAll('id DESC');
  return success(res, data, 'Produtos carregados com sucesso.');
}

async function getProductById(req, res) {
  const product = await productModel.findById(req.params.id);
  if (!product) {
    throw new HttpError(404, 'Produto nao encontrado.');
  }

  return success(res, product, 'Produto encontrado.');
}

async function createProduct(req, res) {
  const payload = mapProductPayload(req.body);
  validateProductPayload(payload);

  const product = await productModel.create(payload);
  return success(res, product, 'Produto criado com sucesso.', 201);
}

async function updateProduct(req, res) {
  const existingProduct = await productModel.findById(req.params.id);
  if (!existingProduct) {
    throw new HttpError(404, 'Produto nao encontrado.');
  }

  const payload = mapProductPayload(req.body, existingProduct);
  validateProductPayload(payload);

  const product = await productModel.update(req.params.id, payload);
  return success(res, product, 'Produto atualizado com sucesso.');
}

async function deleteProduct(req, res) {
  const deleted = await productModel.deleteById(req.params.id);
  if (!deleted) {
    throw new HttpError(404, 'Produto nao encontrado.');
  }

  return success(res, null, 'Produto removido com sucesso.');
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
