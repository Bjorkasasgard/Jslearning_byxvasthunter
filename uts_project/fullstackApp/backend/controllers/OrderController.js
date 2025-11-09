import { readData, writeData } from '../models/db.js';

export const getOrders = async (req, res) => {
    try {
        const orders = await readData('orders');
        const users = await readData('users');
        const products = await readData('products');

        const populatedOrders = orders.map(order => {
            const user = users.find(u => u.id === order.userId);
            const product = products.find(p => p.id === order.productId);
            return {
                ...order,
                user: user ? { name: user.name, email: user.email } : null,
                product: product ? { name: product.name, url: product.url } : null
            };
        });

        res.json(populatedOrders);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const orders = await readData('orders');
        const order = orders.find(o => o.id == req.params.id);

        if (!order) return res.status(404).json({ msg: "Order not found" });

        const users = await readData('users');
        const products = await readData('products');
        const user = users.find(u => u.id === order.userId);
        const product = products.find(p => p.id === order.productId);

        const populatedOrder = {
            ...order,
            user: user ? { name: user.name, email: user.email } : null,
            product: product ? { name: product.name, url: product.url } : null
        };

        res.json(populatedOrder);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const createOrder = async (req, res) => {
    const { userId, productId, quantity, total_price, status = 'pending' } = req.body;
    try {
        const orders = await readData('orders');

        // Membuat ID baru yang berurutan
        const lastId = orders.length > 0 ? Math.max(...orders.map(o => parseInt(o.id))) : 0;
        const newId = (lastId + 1).toString();

        const newOrder = {
            id: newId,
            userId,
            productId,
            quantity,
            total_price,
            status
        };
        orders.push(newOrder);
        await writeData('orders', orders);
        res.status(201).json({ msg: "Order Created Successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const orders = await readData('orders');
        const orderIndex = orders.findIndex(o => o.id == req.params.id);
        if (orderIndex === -1) return res.status(404).json({ msg: "Order not found" });

        orders[orderIndex].status = status;
        await writeData('orders', orders);

        res.status(200).json({ msg: "Order Status Updated Successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};