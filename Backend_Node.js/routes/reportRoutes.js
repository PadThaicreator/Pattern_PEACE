const express = require("express");
const { createReport, getAllReport, getAllReportById } = require("../controllers/reportController");

const router = express.Router();

router.post("/createReport", createReport);
router.get("/reports", getAllReport);
router.get("/reports/:reporterId", getAllReportById);

module.exports = router;