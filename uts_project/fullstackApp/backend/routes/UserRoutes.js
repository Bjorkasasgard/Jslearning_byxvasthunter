import express from "express";
import {
    getUsers,
    getUserById,
    Register,
    updateUser,
    deleteUser
} from "../controllers/UserController.js";

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/register', Register); // Sesuai dengan UserForm.js yang menggunakan /register
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;