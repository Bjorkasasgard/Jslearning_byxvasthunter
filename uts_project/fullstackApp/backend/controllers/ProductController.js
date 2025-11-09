import { readData, writeData } from '../models/db.js';
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getProducts = async(req, res)=>{
    try {
        const response = await readData('products');
        res.json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getProductById = async(req, res)=>{
    try {
        const products = await readData('products');
        const response = products.find(p => p.id == req.params.id);
        if (!response) return res.status(404).json({ msg: "Product not found" });
        res.json(response);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const saveProduct = (req, res)=>{
    if(req.files === null) return res.status(400).json({msg: "No File Uploaded"});
    const name = req.body.title;
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = ['.png','.jpg','.jpeg'];

    if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});
    if(fileSize > 5000000) return res.status(422).json({msg: "Image must be less than 5 MB"});

    const imagePath = path.join(__dirname, '../public/images', fileName);
    file.mv(imagePath, async(err)=>{
        if(err) return res.status(500).json({msg: err.message});
        try {
            const products = await readData('products');

            // Membuat ID baru yang berurutan
            const lastId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id, 10))) : 0;
            const newId = lastId + 1;

            const newProduct = {
                id: newId,
                name: name,
                image: fileName,
                url: url
            };
            products.push(newProduct);
            await writeData('products', products);
            res.status(201).json({msg: "Product Created Successfuly"});
        } catch (error) {
            console.log(error.message);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    });
};

export const updateProduct = async (req, res) => {
    const products = await readData('products');
    const productIndex = products.findIndex(p => p.id == req.params.id);
    if (productIndex === -1) return res.status(404).json({ msg: "No Data Found" });
    
    const product = products[productIndex];
    if(!product) return res.status(404).json({msg: "No Data Found"});

    let fileName = "";
    if (req.files === null || req.files.file === null) {
        fileName = product.image;
    } else {
        const file = req.files.file;
        const fileSize = file.data.length;
        const ext = path.extname(file.name);
        fileName = file.md5 + ext;
        const allowedType = ['.png','.jpg','.jpeg'];

        if (!allowedType.includes(ext.toLowerCase())) return res.status(422).json({ msg: "Invalid Images" });
        if (fileSize > 5000000) return res.status(422).json({ msg: "Image must be less than 5 MB" });

        const filepath = path.join(__dirname, '../public/images', product.image);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        const newFilepath = path.join(__dirname, '../public/images', fileName);
        file.mv(newFilepath, (err) => {
            if (err) return res.status(500).json({ msg: err.message });
        });
    }
    const name = req.body.title;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;

    try {
        const updatedProduct = {
            ...product,
            name: name,
            image: fileName,
            url: url
        };
        products[productIndex] = updatedProduct;
        await writeData('products', products);
        res.status(200).json({msg: "Product Updated Successfuly"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const deleteProduct = async(req, res)=>{
    try {
        let products = await readData('products');
        const product = products.find(p => p.id == req.params.id);
        if (!product) return res.status(404).json({ msg: "No Data Found" });

        const filepath = path.join(__dirname, '../public/images', product.image);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }
        
        products = products.filter(p => p.id != req.params.id);
        await writeData('products', products);

        res.status(200).json({msg: "Product Deleted Successfuly"});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};