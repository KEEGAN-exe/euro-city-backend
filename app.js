import express from "express";
import cors from "cors";
import productRoute from "./src/routes/product_routes.js";
import userRoute from "./src/routes/user_routes.js";
import authentification from "./src/routes/authentication_routes.js";
import categoryRoute from "./src/routes/category_routes.js";
import supplierRoute from "./src/routes/supplier_routes.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/product", productRoute);
app.use("/api/user", userRoute);
app.use("/api/auth", authentification);
app.use("/api/category", categoryRoute);
app.use("/api/supplier", supplierRoute);

export default app;
