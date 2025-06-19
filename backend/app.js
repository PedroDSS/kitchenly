const express = require('express');
const AppError = require('./utils/appError');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const { xss } = require('express-xss-sanitizer');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const globalErrorHandler = require('./controllers/errorController');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const logger = require('./utils/logger');
const initDeliveryCronJob = require("./cron/delivery");
const webhookStripeHandler = require("./webhook/stripe");
const bodyParser = require('body-parser');

require("./models/mongo/db");

// Start express app
const app = express();

// Webhook for Stripe
app.post(
  "/webhook/stripe",
  bodyParser.raw({ type: "application/json" }),
  webhookStripeHandler
);

//Set env variable globally
dotenv.config({ path: './config.env' });

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Parses URL-encoded request bodies,
app.use(express.urlencoded({ extended: true, limit:'1kb'}));

// Parses cookies attached to incoming requests. Required for CSRF protection it allows the CSRF token to be stored and accessed in cookies.
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:8080'
}
// Enable CORS for all routes in developpment
if (process.env.NODE_ENV === 'development') {
  app.use(cors(corsOptions));
}

// Protects against HTTP Parameter Pollution (HPP) attacks by removing duplicate query parameters
app.use(hpp());

// Set security HTTP headers
app.use(helmet());

//Data sanictization against xss
app.use(xss());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// ROUTE TEST
app.use('/helloworld', async (req, res, next) => {
  logger.info('Hello world');
});

// API Routes
app.use('/api', okRouter);
app.use('/api/auth', authRouter);

// Private
app.use('/api/users', userRouter);

// Handle requests for routes that are not defined in the application.
app.all('*', (req, res, next) => {
  next(new AppError(404));
});

app.use(globalErrorHandler);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return ip;
  },
});

app.use(limiter);

// Init the cron job for delivery
initDeliveryCronJob();

module.exports = app;