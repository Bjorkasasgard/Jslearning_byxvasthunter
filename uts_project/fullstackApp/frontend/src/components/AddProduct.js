import React, { useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");   // <-- DITAMBAHKAN
  const [file, setFile] = useState("");
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState("");
  const navigate = useNavigate();

  const loadImage = (e) => {
    const image = e.target.files[0];
    setFile(image);
    setPreview(URL.createObjectURL(image));
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!title || !price || !file) {
      setMsg("Please fill in all fields and select an image.");
      return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("price", price); // ← jangan Number(), kirim STRING


    try {
      await axios.post("/api/products", formData, {
        headers: {
          "Content-type": "multipart/form-data",
        },
      });
      navigate("/");
    } catch (error) {
      if (error.response) {
        setMsg(error.response.data.msg);
      } else {
        setMsg("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="columns is-centered mt-5">
      <div className="column is-half">
        <form onSubmit={saveProduct}>
          {msg && (
            <div className="notification is-danger" role="alert">
              {msg}
            </div>
          )}
          
          {/* Product Name */}
          <div className="field">
            <label className="label">Product Name</label>
            <div className="control">
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Product Name"
              />
            </div>
          </div>

          {/* Product Price */}
          <div className="field">
            <label className="label">Product Price</label>
            <div className="control">
              <input
                type="number"
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price..."
                min="0"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="field">
            <label className="label">Image</label>
            <div className="control">
              <div className="file">
                <label className="file-label">
                  <input
                    type="file"
                    className="file-input"
                    onChange={loadImage}
                  />
                  <span className="file-cta">
                    <span className="file-label">Choose a file...</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview ? (
            <figure className="image is-128x128">
              <img src={preview} alt="Preview Image" />
            </figure>
          ) : null}

          {/* Save Button */}
          <div className="field">
            <div className="control">
              <button type="submit" className="button is-success">
                Save
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddProduct;
