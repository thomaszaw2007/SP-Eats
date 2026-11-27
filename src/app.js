const express = require('express');
const createError = require('http-errors');
const path = require('path');
const pool = require('./models/db');
const requireAdmin = require('./middleware/adminAccess');

// Import route handlers
const somethingRouter = require('./routers/Something.router');
const personRouter = require('./routers/Person.router');
const foodStallRouter = require('./routers/FoodStall_router');
const menuItemRouter = require('./routers/MenuItem_router');
const foodMapRouter = require('./routers/FoodMap_router');
const reviewRouter = require('./routers/Review_router');
const quizRouter = require('./routers/Quiz_router');
const reviewAdminRouter = require('./routers/ReviewAdmin_router');

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy':
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
  next();
});
app.use(express.json({ limit: '16kb' }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/favicon.ico', (req, res) => res.status(204).end());

if (process.env.NODE_ENV !== 'production') {
  app.use('/somethings', somethingRouter);
  app.use('/persons', personRouter);
}

app.get('/healthz', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try {
    const { rows } = await pool.query(`SELECT to_regclass('public."Menu"') IS NOT NULL AS ready`);
    if (rows[0].ready) return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Database health check failed:', error.code || error.name);
  }
  res.status(503).json({ status: 'unavailable' });
});

app.use('/api/stalls', foodStallRouter);
app.use('/api/menu-items', menuItemRouter);
app.use('/api/food-map', foodMapRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/quiz', quizRouter);

app.use('/api/admin/reviews', requireAdmin, reviewAdminRouter);

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

app.use((req, res, next) => {
  next(createError(404, `Unknown resource ${req.method} ${req.originalUrl}`));
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  const status = error.status || 500;
  if (status >= 500) console.error('Request failed:', error.code || error.name);
  res.status(status).json({ error: status >= 500 ? 'Something went wrong.' : error.message });
});

module.exports = app;
