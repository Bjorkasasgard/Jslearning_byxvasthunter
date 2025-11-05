import { useState, useEffect } from 'react';
// 1. Import <Link> untuk navigasi
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8000/api';

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1>Selamat Datang di Toko Kami</h1>
      <h2>Daftar Produk</h2>
      
      <ul className="product-list">
        {products.map(product => (
          // 2. Buat setiap item menjadi link yang bisa diklik
          <li key={product.id} className="product-item">
            {/* 3. Link ke /product/ID_PRODUK */}
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
              <h3>{product.name}</h3>
              <p>Harga: Rp {product.price.toLocaleString('id-ID')}</p>
              <p>Stok: {product.stock}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;