var express = require('express');
var router = express.Router();

/* GET users page. */
router.get('/', function(req, res, next) {
  // Ya, kamu bisa mengirimkan string yang berisi HTML dan JavaScript sekaligus.
  // Di sini kita menggunakan backtick (`) untuk membuat string multi-baris agar lebih mudah dibaca.
  res.send(`
    <html>
      <head>
        <title>Halaman User</title>
      </head>
      <body>
        <h1>Ini adalah halaman user dengan JavaScript</h1>
        <p>Klik tombol di bawah ini.</p>
        <button id="myButton">Klik Aku!</button>

        <!-- Menyisipkan JavaScript langsung di dalam HTML -->
        <script>
          // Menambahkan event listener ke tombol
          document.getElementById('myButton').addEventListener('click', function() {
            alert('Tombol berhasil diklik! JavaScript ini dijalankan di browser klien.');
          });
        </script>
      </body>
    </html>
  `);
});

module.exports = router;
