import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import ProductRoute from "./routes/ProductRoutes.js";
import UserRoute from "./routes/UserRoutes.js"; // Asumsi nama file UserRoutes.js
import OrderRoute from "./routes/OrderRoutes.js"; // Asumsi nama file OrderRoutes.js
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// ES Module-friendly way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(FileUpload());
app.use(express.static(path.join(__dirname, "public"))); // <-- Baris ini membuat folder public bisa diakses
app.use('/api', ProductRoute); // Daftarkan di bawah /api
app.use('/api', UserRoute); // Daftarkan di bawah /api
app.use('/api', OrderRoute); // Daftarkan di bawah /api

app.listen(5000, () => console.log("Server Up and Running..."));