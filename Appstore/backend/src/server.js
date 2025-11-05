// Memuat variabel .env di paling atas
require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
});