import { Routes, Route } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import './App.css'; // (Biarkan CSS tetap ter-import)

function App() {
  // App.jsx sekarang hanya berisi definisi rute
  return (
    <Routes>
      {/* Rute 1: Halaman utama (/) akan menampilkan komponen ProductList */}
      <Route path="/" element={<ProductList />} />
      
      {/* Rute 2: Halaman detail (/product/:id) akan menampilkan ProductDetail */}
      {/* ':id' adalah parameter dinamis */}
      <Route path="/product/:id" element={<ProductDetail />} />

      {/* TODO: Tambahkan rute untuk /users, /orders, dll nanti */}
    </Routes>
  );
}

export default App;