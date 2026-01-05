const cors = require('cors');

module.exports = cors({
  origin: '*', // change to specific domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
