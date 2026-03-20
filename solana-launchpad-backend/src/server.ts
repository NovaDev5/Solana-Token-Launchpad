
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/routes";

dotenv.config();
const app = express();

/*
 CORS Configuration
*/
const corsOptions: cors.CorsOptions = {
  origin: [
    "http://localhost:8080"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", router);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
