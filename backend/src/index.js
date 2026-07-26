import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import medicineRoutes from "./routes/medicines.js";
import searchRoutes from "./routes/search.js";
import pharmacyRoutes from "./routes/pharmacy.js";
import pharmacyDirectoryRoutes from "./routes/pharmacies.js";
import adminRoutes from "./routes/admin.js";
import reservationRoutes from "./routes/reservations.js";
import prescriptionRoutes from "./routes/prescriptions.js";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();

app.use(cors());
// Voice chat posts base64 audio, which blows past the 100kb express default.
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static("uploads"));
app.use("/api", rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "medhanet-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/pharmacies", pharmacyDirectoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/chat", chatRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, "0.0.0.0", () => console.log(`Backend running on http://localhost:${PORT} (bound to 0.0.0.0)`));
