const express = require('express');
const createError = require('http-errors');
const path = require('path');

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

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.use('/somethings', somethingRouter);
app.use('/persons', personRouter);

app.use('/api/stalls', foodStallRouter);
app.use('/api/menu-items', menuItemRouter);
app.use('/api/food-map', foodMapRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/quiz', quizRouter);

app.use('/api/admin/reviews', reviewAdminRouter);


app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(204).end();
});

app.use((req, res, next) => {
  next(createError(404, `Unknown resource ${req.method} ${req.originalUrl}`));
});

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.status || 500;
  res.status(status).json({ error: error.message });
});

module.exports = app;
