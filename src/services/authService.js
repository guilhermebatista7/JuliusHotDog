const HttpError = require('../utils/httpError');
const { hashPassword, comparePassword } = require('../utils/password');
const userModel = require('../models/UserModel');

function normalizeBrazilPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  return digits;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

async function registerUser({ name, email, password, phone }) {
  if (!name || !email || !password || !phone) {
    throw new HttpError(400, 'Nome, e-mail, telefone e senha sao obrigatorios.');
  }

  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    throw new HttpError(409, 'Ja existe um usuario cadastrado com este e-mail.');
  }

  const passwordHash = await hashPassword(password);
  return userModel.create({
    name,
    email,
    phone: normalizeBrazilPhone(phone),
    passwordHash,
    role: 'customer'
  });
}

async function authenticateUser({ email, password }) {
  if (!email || !password) {
    throw new HttpError(400, 'E-mail e senha sao obrigatorios.');
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new HttpError(401, 'Credenciais invalidas.');
  }

  const passwordMatches = await comparePassword(password, user.password_hash);
  if (!passwordMatches) {
    throw new HttpError(401, 'Credenciais invalidas.');
  }

  return sanitizeUser(user);
}

module.exports = { registerUser, authenticateUser };
