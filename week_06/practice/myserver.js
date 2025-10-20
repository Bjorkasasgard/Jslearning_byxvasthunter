// making web server
const http = require(`http`);
const port = 8000;

// SIMPLE WEB SERVER
// const server = http.createServer((req, res) => {
// res.writeHead(200)
// res.write("Welcome to my server, this my first server");
// res.end();
// })

// ROUTING WEBSERVER
// http.createServer((req, res) => { // routing 
//     res.writeHead(200);
//     if (req.url == '/') {
//         res.write(`<html><body><h1> LU OLANG ADA DI HALAMAN INDEX</h1></body></html>`);
//     } else if (req.url =='/siswa') {
//         res.write(`<html><body><h1> LU OLANG ADA DI HALAMAN SISWA</h1></body></html>`);
//     } else if (req.url =='/dosen') {
//         res.write(`<html><body><h1> LU OLANG ADA DI HALAMAN DOSEN</h1></body></html>`);
//     } else if (req.url =='/admin') {
//         res.write(`<html><body><h1> LU OLANG ADA DI HALAMAN ADMIN</h1></body></html>`);
//     } else {
//         res.write(`<html><body><h1> GA ADA CHAWNIMA</h1></body></html>`);
//     }

// }).listen(port, () => {
//     console.log(`server is listening on port ${port}`)
// })

const student = [
    {
        name: "Adam",
        class: "TI24I"
    },
    {
        name: "Alen",
        class: "TI24T"
    },
    {
        name: "Daus",
        class: "TI24A"
    },
]
const server = http.createServer((req, res) => {
    res.writeHead(200)
    res.write("Welcome to my server, this my first server");
    res.end();
})

server.listen(port, () => {
    console.log(`server is listening on port ${port}`)
})