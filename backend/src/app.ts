import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import customerRoutes from "./routes/customer.routes"
import followUpRoutes from "./routes/followup.routes";
import productRoutes from "./routes/product.routes";
import stockRoutes from "./routes/stock.routes";
import challanRoutes from "./routes/challan.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(cors());
app.use(express.json());



app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "ERP API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api", followUpRoutes);
app.use("/api/products", productRoutes);
app.use("/api", stockRoutes);
app.use("/api/challans", challanRoutes);
app.use("/api/dashboard", dashboardRoutes);


export default app;