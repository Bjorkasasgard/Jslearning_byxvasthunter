// react akses api
// /backend/src/middlewares/cors.js

const whitelist = [process.env.CLIENT_URL, 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Izinkan jika origin ada di whitelist (atau jika origin tidak ada, cth: request dari Postman)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Tidak diizinkan oleh CORS'));
    }
  },
  credentials: true,
};

module.exports = corsOptions;