import express from 'express';
import { getProductPage } from '../controllers/ViewController.js';

const router = express.Router();

router.get('/product/:id', getProductPage);

export default router;