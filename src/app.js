const express = require('express');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { securityHeaders, apiLimiter } = require('./middlewares/security');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/api-error');
const { initializeModel } = require('./services/dating-engine.service')
const client = require('prom-client');
initializeModel(); // initialize the ML model

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set enhanced security HTTP headers
app.use(securityHeaders);

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors with secure configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Apply rate limiting to all routes
app.use(apiLimiter);

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// Static files for testing
app.use(express.static('public'));



// Health check endpoint
app.get('/health', require('./middlewares/health-check'));

// Request logging
if (config.env !== 'test') {
  app.use(require('./middlewares/request-logger'));
}
const register = new client.Registry();
register.setDefaultLabels({
  app: 'afterhour-app'
});
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});
register.registerMetric(httpRequestCounter);

const metricsMiddleware = (req, res, next) => {
  res.on('finish', () => {
    const route = req.route ? req.route.path : 'unknown_route';
    httpRequestCounter.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
  });
  next();
};
app.use('/v1/user-server/', metricsMiddleware);
// v1 api routes
app.use(' ', routes);
// 💡 This is our new middleware function
app.get('/v1/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
