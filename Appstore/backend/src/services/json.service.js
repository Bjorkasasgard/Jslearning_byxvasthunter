// /backend/src/services/json.service.js
const fs = require('fs').promises; // Gunakan promise untuk async/await
const path = require('path');

// Tentukan path ke file data kita
const dataDirectory = path.join(__dirname, '..', 'data');
const productsPath = path.join(dataDirectory, 'products.json');
const usersPath = path.join(dataDirectory, 'users.json');
const ordersPath = path.join(dataDirectory, 'orders.json');

// --- FUNGSI GENERIK UNTUK MEMBACA FILE ---
async function readData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    throw new Error('Could not read data');
  }
}

// --- FUNGSI PRODUCTS ---
async function readProductsData() {
  return readData(productsPath);
}

async function findProductById(id) {
  const products = await readProductsData();
  return products.find(p => p.id === id) || null;
}

// --- FUNGSI USERS ---
async function readUsersData() {
  return readData(usersPath);
}

async function findUserById(id) {
  const users = await readUsersData();
  return users.find(u => u.id === id) || null;
}

// --- FUNGSI ORDERS ---
async function readOrdersData() {
  return readData(ordersPath);
}

async function findOrderById(id) {
  const orders = await readOrdersData();
  return orders.find(o => o.id === id) || null;
}

// Ekspor semua fungsi
module.exports = {
  readProductsData,
  findProductById,
  readUsersData,
  findUserById,
  readOrdersData,
  findOrderById,
};