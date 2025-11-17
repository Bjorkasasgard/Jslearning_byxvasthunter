// const http = require('http');

// const fs = require('fs'); // module untuk akses file
// const path = require('path'); // module untuk menangani path file

// const server = http.createServer((req, res) => {
//   // Membuat path yang robust ke index.html
//   const filePath = path.join(__dirname, 'index.html');

//   fs.readFile(filePath, (err, data) => {
//     if (err) {
//       // Jika error karena file tidak ada, kirim 404
//       if (err.code === 'ENOENT') {
//         res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
//         res.end('Halaman tidak ditemukan');
//       } else {
//         // Untuk error server lainnya, kirim 500
//         console.error(err); // Log error di sisi server
//         res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
//         res.end('Terjadi error di server');
//       }
//     } else {
//       res.writeHead(200, { 'Content-Type': 'text/html' });
//       res.end(data);
//     }
//   });
// });
// server.listen(3000, () => {
//   console.log('Server HTML berjalan di http://localhost:3000');
// });

// BASIC HOT TO MAKE SERVER

// const http = require('http');

// const server = http.createServer((req, res) => {

// // set header
// req.writeHead(200, { 'Content-Type': 'text/plain' });

// // kirim respons ke clinet
// res.end('hellow, this first server node.js ');
// });

// // port server
// const PORT = 3000;

// server.listen(PORT, () =>{
//     console.log(`server berjalan di http://localhost:${PORT}`)
// });


let dataMahasiswa = {
    name: "adam bastian chaniago",
    age: 19,
    alamat: {
        jalan: "jl Muara",
        kota: "Sukabumi"
    }


}

console.log(dataMahasiswa.alamat)