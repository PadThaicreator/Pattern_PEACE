const express = require("express");
const { createReport, getAllReport } = require("../controllers/reportController");

const router = express.Router();

router.post("/createReport", createReport);
router.get("/reports", getAllReport);

module.exports = router;