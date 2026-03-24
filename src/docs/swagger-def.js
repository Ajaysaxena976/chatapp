const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Dating App API Documentation',
    version,
    license: {
      name: 'Speqto Technologies Pvt Ltd',
      url: '',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1/user-server/`,
    },
    {
      url: `https://dev-spontime-api.x.masbit.eu/v1/user-server/`,
    },
  ],
};

module.exports = swaggerDef;
