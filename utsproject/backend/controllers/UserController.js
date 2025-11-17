import { readData, writeData } from '../models/db.js';

export const getUsers = async (req, res) => {
    try {
        const users = await readData('users');
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const users = await readData('users');
        const user = users.find(u => u.id == req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const Register = async (req, res) => {
    const { name, email, role = 'customer' } = req.body;
    if (!name || !email) {
        return res.status(400).json({ msg: "Name and email are required" });
    }

    try {
        const users = await readData('users');
        if (users.some(u => u.email === email)) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        // Membuat ID baru yang berurutan, bukan UUID
        const lastId = users.length > 0 ? Math.max(...users.map(u => parseInt(u.id))) : 0;
        const newId = (lastId + 1).toString();

        const newUser = {
            id: newId,
            name,
            email,
            role
        };
        users.push(newUser);
        await writeData('users', users);

        res.json({ msg: "Registration Successful" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "Email already exists or invalid data" });
    }
};

export const updateUser = async (req, res) => {
    const { name, email, role } = req.body;
    try {
        const users = await readData('users');
        const userIndex = users.findIndex(u => u.id == req.params.id);

        if (userIndex === -1) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Update data
        users[userIndex].name = name || users[userIndex].name;
        users[userIndex].email = email || users[userIndex].email;
        users[userIndex].role = role || users[userIndex].role;

        await writeData('users', users);
        res.json({ msg: "User Updated Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        let users = await readData('users');
        const updatedUsers = users.filter(u => u.id != req.params.id);

        await writeData('users', updatedUsers);
        res.json({ msg: "User Deleted Successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};
