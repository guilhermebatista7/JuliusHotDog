const userModel = require('../models/UserModel');
const HttpError = require('../utils/httpError');
const { success } = require('../utils/apiResponse');
const { authenticateUser, registerUser } = require('../services/authService');
const { hashPassword } = require('../utils/password');
const { clearSessionCookie, setSessionCookie } = require('../utils/session');

async function register(req, res) {
  const user = await registerUser(req.body);
  return success(res, user, 'Usuario cadastrado com sucesso.', 201);
}

async function login(req, res) {
  const user = await authenticateUser(req.body);
  setSessionCookie(res, user);
  return success(res, user, 'Login realizado com sucesso.');
}

async function logout(req, res) {
  clearSessionCookie(res);
  return success(res, null, 'Logout realizado com sucesso.');
}

async function me(req, res) {
  return success(res, req.user, 'Sessao carregada com sucesso.');
}

async function listUsers(req, res) {
  const users = await userModel.findAllSafe();
  return success(res, users, 'Usuarios carregados com sucesso.');
}

async function getUserById(req, res) {
  const user = await userModel.findSafeById(req.params.id);
  if (!user) {
    throw new HttpError(404, 'Usuario nao encontrado.');
  }

  return success(res, user, 'Usuario encontrado.');
}

async function updateUser(req, res) {
  const existingUser = await userModel.findSafeById(req.params.id);
  if (!existingUser) {
    throw new HttpError(404, 'Usuario nao encontrado.');
  }

  const user = await userModel.update(req.params.id, {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role || existingUser.role
  });

  return success(res, user, 'Usuario atualizado com sucesso.');
}

async function updatePassword(req, res) {
  const existingUser = await userModel.findSafeById(req.params.id);
  if (!existingUser) {
    throw new HttpError(404, 'Usuario nao encontrado.');
  }

  if (!req.body.password) {
    throw new HttpError(400, 'A nova senha e obrigatoria.');
  }

  const passwordHash = await hashPassword(req.body.password);
  await userModel.updatePassword(req.params.id, passwordHash);

  return success(res, null, 'Senha atualizada com sucesso.');
}

async function deleteUser(req, res) {
  const deleted = await userModel.deleteById(req.params.id);
  if (!deleted) {
    throw new HttpError(404, 'Usuario nao encontrado.');
  }

  return success(res, null, 'Usuario removido com sucesso.');
}

module.exports = {
  register,
  login,
  logout,
  me,
  listUsers,
  getUserById,
  updateUser,
  updatePassword,
  deleteUser
};
