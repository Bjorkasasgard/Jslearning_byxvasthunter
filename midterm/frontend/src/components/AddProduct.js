import React, { useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const loadImage = (e) => {
    const image = e.target.files[0];
    setFile(image);
    setPreview(URL.createObjectURL(image));
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("description", description);
    try {
      await axios.post("/api/products", formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="columns is-centered mt-5">
      <div className="column is-two-thirds">
        <div className="box">
        <h1 className="title">Add New Product</h1>
        <form onSubmit={saveProduct}>
          <div className="field">
            <label className="label">Product Name</label>
            <div className="control">
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Product Name"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Price</label>
            <div className="control">
              <input
                type="number"
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Quantity</label>
            <div className="control">
              <input
                type="number"
                className="input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Description</label>
            <div className="control">
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product Description"
              ></textarea>
            </div>
          </div>

          <div className="field">
            <label className="label">Image</label>
            <div className="control">
              <div className="file has-name is-fullwidth">
                <label className="file-label">
                  <input
                    type="file"
                    className="file-input"
                    onChange={loadImage}
                    required
                  />
                  <span className="file-cta">
                    <span className="file-label">Choose a file...</span>
                  </span>
                  <span className="file-name">
                    {file ? file.name : "No file uploaded"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {preview ? (
            <figure className="image is-128x128 mb-4">
              <img src={preview} alt="Preview Image" />
            </figure>
          ) : (
            ""
          )}

          <div className="field">
            <div className="field is-grouped">
              <div className="control">
              <button type="submit" className="button is-success">
                Save
              </button>
              </div>
              <div className="control">
                <button type="button" className="button is-light" onClick={() => navigate('/')}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
