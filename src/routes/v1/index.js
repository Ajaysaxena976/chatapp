const express = require('express');
const authRoute = require('./auth.route');
const getStartedRoute = require('./get-started.route');
const suggestionRoute = require('./suggestions.route');
const interactionRoute = require('./interactions.route');
const preferenceRoute = require('./preference.route.js');
const matchRoute = require('./match.route.js');

const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const config = require('../../config/config');


const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/get-started',
    route: getStartedRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/suggestion',
    route: suggestionRoute,
  },
  {
    path: '/interaction',
    route: interactionRoute,
  },
  {
    path: '/preference',
    route: preferenceRoute,
  },
  {
    path: '/match',
    route: matchRoute,
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];


defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
