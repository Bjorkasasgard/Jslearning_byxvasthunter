import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import ProductRoute from "./routes/ProductRoutes.js";
import UserRoute from "./routes/UserRoutes.js"; 
import OrderRoute from "./routes/OrderRoutes.js"; 
import path from "path";
import { fileURLToPath } from "url";

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(FileUpload());
app.use(express.static(path.join(__dirname, "public")));
app.use('/api', ProductRoute);
app.use('/api', UserRoute); 
app.use('/api', OrderRoute); 

app.listen(5000, () => console.log("Server Up and Running..."));