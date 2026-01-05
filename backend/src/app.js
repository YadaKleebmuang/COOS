require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middlewares/cors.middleware');
const loadRoutes = require('./routes/index.route');
const { testConnection } = require('../src/config/db');

const app = express();
app.use(express.json());
// app.use(corsMiddleware);

testConnection();

loadRoutes(app);
module.exports = app;
