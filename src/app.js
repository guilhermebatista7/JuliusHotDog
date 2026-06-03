const express = require('express');
const path = require('path');

const webRoutes = require('./routes/webRoutes');
const apiRoutes = require('./routes/apiRoutes');
const notFoundHandler = require('./middlewares/notFoundHandler');
const errorHandler = require('./middlewares/errorHandler');
const { attachSession, protectHtmlPages } = require('./middlewares/auth');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(attachSession);
app.use(protectHtmlPages);
app.use(express.static(path.join(__dirname, '..')));

app.use('/', webRoutes);
app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
