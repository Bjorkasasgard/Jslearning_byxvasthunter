import { readData } from '../models/db.js';

export const getProductPage = async (req, res) => {
  try {
    const products = await readData('products');
    const product = products.find(p => p.id == req.params.id);

    if (!product) {
      return res.status(404).send('<h1>Product Not Found</h1>');
    }

    // Ini adalah contoh HTML sederhana. Di aplikasi nyata, Anda akan menggunakan template engine.
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head><title>${product.name}</title></head>
      <body>
        <h1>${product.name}</h1>
        <img src="${product.url}" alt="${product.name}" width="300">
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
};