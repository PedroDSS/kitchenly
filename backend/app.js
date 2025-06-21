const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const AppError = require('./utils/appError');
const path = require('path');
const helmet = require('helmet');
const hpp = require('hpp');
const { xss } = require('express-xss-sanitizer');
const cookieParser = require('cookie-parser');
// const mongoSanitize = require('express-mongo-sanitize');
const globalErrorHandler = require('./controllers/errorController');
const morgan = require('morgan');
const cors = require('cors');
// const logger = require('./utils/logger');
const initDeliveryCronJob = require("./cron/delivery");
const initCartCleanupCronJob = require("./cron/cartCleanup");
const { initEmailAlertsCronJob } = require("./cron/emailAlerts");
const { generalLimiter } = require('./middleware/rateLimiter');
// const webhookStripeHandler = require("./webhook/stripe");
// const bodyParser = require('body-parser');

// Route imports
const okRouter = require('./routes/okRouter');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
const productRouter = require('./routes/productRouter');
const cartRouter = require('./routes/cartRouter');
const orderRouter = require('./routes/orderRouter');
const paymentRoutes = require('./routes/paymentRoutes');
const alertRoutes = require('./routes/alertRoutes');
const adminRouter = require('./routes/adminRouter');
const deliveryRouter = require('./routes/deliveryRouter');

// Initialize MongoDB connection after dotenv
require("./models/db");

// Start express app
const app = express();

// Webhook for Stripe - must be before body parsing middleware
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

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

// Data sanitization against NoSQL query injection (disabled for Express 5 compatibility)
// app.use(mongoSanitize());

// Apply general rate limiting to all routes
app.use('/api/', generalLimiter);

// API Routes
app.use('/api', okRouter);
app.use('/api/auth', authRouter);
app.use('/api', productRouter);

// Private
app.use('/api/users', userRouter);
app.use('/api/cart', cartRouter);
app.use('/api', orderRouter);
app.use('/api/payment', paymentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRouter);
app.use('/api', deliveryRouter);

// Handle requests for routes that are not defined in the application.
app.all('/{*any}', (req, res, next) => {
  next(new AppError(404));
});

app.use(globalErrorHandler);

// Init the cron jobs
initDeliveryCronJob();
initCartCleanupCronJob();
initEmailAlertsCronJob();

module.exports = app;