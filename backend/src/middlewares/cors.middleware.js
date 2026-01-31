const cors = require('cors')

module.exports = cors({
  origin: ['http://localhost:8888'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
})
