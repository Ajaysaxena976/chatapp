// require('dotenv').config();
// const { Client } = require('@elastic/elasticsearch');

// const protocol = process.env.ES_SSL === 'true' ? 'https' : 'http';
// console.log(`Elasticsearch Protocol: ${protocol}`);
// console.log(`Elasticsearch Node URL: ${protocol}://${process.env.ES_HOST}:${process.env.ES_PORT}`);

// const esClient = new Client({
//   node: `${protocol}://${process.env.ES_HOST}:${process.env.ES_PORT}`,
//   auth: {
//     username: 'spontime_dev',
//     password: 'eJUrlNTCeRG_txECTUgnvjOr',
//   },
//   tls: {
//     rejectUnauthorized: false, // ignore self-signed for local testing
//   },
// });

// module.exports = esClient;

const { Client } = require('@elastic/elasticsearch');
const fs = require('fs');

const client = new Client({
  node: "https://tst-ka-ara-mon-ela-1.maslocal.net:9200",
  auth: {
    username: "spontime_dev",
    password: "eJUrlNTCeRG_txECTUgnvjOr"
  },
  tls: {
    rejectUnauthorized: false   // because ES uses self-signed certificate
  }
});

module.exports = client;

