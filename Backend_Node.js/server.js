const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const pullApiRoutes = require("./routes/pullApiRoutes");
const historyRoutes = require("./routes/postRoutes")
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", reportRoutes);
app.use("/pull", pullApiRoutes);
app.use("/history", historyRoutes);

app.get("/check-db-connection", async (req, res) => {
  try {
    await prisma.$connect();
    res.send({ message: "Connect to DataBase" });
  } catch (error) {
    console.log("Error : ", error.message);
    res.status(500).send({ error: error.message });
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`)});