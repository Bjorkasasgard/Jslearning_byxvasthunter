import React, { useState, useEffect } from "react";
import axios from "../api"; 
import { Link } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    const response = await axios.get("/api/products");
    setProducts(response.data);
  };

  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`/api/products/${productId}`);
      getProducts();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mt-5">
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <h1 className="title">Products</h1>
          </div>
        </div>
      </div>
      <div className="columns is-multiline mt-2">
        {products.map((product) => (
          <div className="column is-one-quarter" key={product.id}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="card-image">
                <figure className="image is-4by3">
                  <img src={product.url} alt={product.name} />
                </figure>
              </div>
              <div className="card-content" style={{ flexGrow: 1 }}>
                <div className="media">
                  <div className="media-content">
                    <p className="title is-4">{product.name}</p>
                    <p className="subtitle is-5">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price || 0)}
                    </p>
                  </div>
                </div>
                <div className="content">
                  {product.description || "No description available."}
                  <br />
                  <strong>Stok: {product.quantity || 0}</strong>
                </div>
              </div>

              <footer className="card-footer">
                <Link to={`/edit/${product.id}`} className="card-footer-item">
                  Edit
                </Link>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="card-footer-item has-text-danger"
                >
                  Delete
                </button>
              </footer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductList;
