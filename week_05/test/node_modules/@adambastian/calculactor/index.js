console.log("=== calculactorAPP ===")
const tambah = require('./penjumlahan.js'); // impor module
const kurang = require('./pengurangan.js');
const kali = require('./perkalian.js');
const bagi = require('./pembagian.js');

const angka1 = 12;
const angka2 = 2;
console.log(`angka pertama ${angka1}`);
console.log(`angka kedua ${angka2}`);
console.log("===========================================")
const hasilTambah = tambah(angka1, angka2); // 14
console.log(`Hasil penjumlahan: ${hasilTambah}`);
console.log("===========================================")
const hasilKurang = kurang(angka1, angka2); // 10
console.log(`Hasil pengurangan: ${hasilKurang}`);
console.log("===========================================")
const hasilkali = kali(angka1, angka2); // 24
console.log(`Hasil perkalian: ${hasilkali}`)
console.log("===========================================")
const hasilBagi = bagi(angka1, angka2); // 6
console.log(`Hasil pembagian: ${hasilBagi}`);
