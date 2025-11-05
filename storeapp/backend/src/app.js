// /backend/src/app.js

const express = require('express');
const cors = require('cors');
const corsOptions = require('./middlewares/cors');
const apiRoutes = require('./api/routes'); // Ini adalah /api/routes/index.js
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// === Middleware ===
// 1. CORS (Sangat penting untuk React)
app.use(cors(corsOptions));

// 2. Body Parser (Untuk membaca req.body JSON)
app.use(express.json());

// === Rute ===
// Rute "health check" sederhana
app.get('/api', (req, res) => {
  res.json({ message: 'Selamat datang di API Toko Sederhana!' });
});

// 3. Rute Utama API
// Semua rute di /api akan ditangani oleh apiRoutes
app.use('/api', apiRoutes);

// === Error Handlers ===
// 4. Handle 404 (Not Found) - Ini harus setelah rute
app.use(notFound);

// 5. Handle Error Lainnya (Error Terpusat)
app.use(errorHandler);

module.exports = app;