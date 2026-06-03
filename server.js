require('dotenv').config();

const app = require('./src/app');
const { env } = require('./src/config/env');

app.listen(env.port, () => {
  console.log(`Servidor iniciado em http://localhost:${env.port}`);
});
