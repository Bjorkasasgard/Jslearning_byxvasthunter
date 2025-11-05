import { useState, useEffect } from 'react';
// 1. Import hook 'useParams' untuk membaca ID dari URL
// dan 'Link' untuk tombol kembali
import { useParams, Link } from 'react-router-dom';

const API_URL = 'http://localhost:8000/api';

function ProductDetail() {
  // 2. Ambil 'id' dari parameter URL
  const { id } = useParams(); 
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        // 3. Panggil API untuk 1 produk spesifik
        const response = await fetch(`${API_URL}/products/${id}`); // <-- Perhatikan /products/:id
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProduct(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]); // <-- Jalankan ulang 'fetch' jika 'id' di URL berubah

  if (loading) return <div>Loading detail produk...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Produk tidak ditemukan.</div>; // Jika data tidak ada

  // 4. Tampilkan detail 1 produk
  return (
    <div className="container">
      <h1>{product.name}</h1>
      <div className="product-detail">
        <p><strong>Harga:</strong> Rp {product.price.toLocaleString('id-ID')}</p>
        <p><strong>Stok:</strong> {product.stock}</p>
        <p>(Deskripsi produk bisa ditambahkan di sini...)</p>
      </div>
      <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>
        &laquo; Kembali ke Daftar Produk
      </Link>
    </div>
  );
}

export default ProductDetail;