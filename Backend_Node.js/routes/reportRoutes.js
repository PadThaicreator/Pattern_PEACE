const express = require("express");
const { createReport, getAllReport, getAllReportById , getReportByType } = require("../controllers/reportController");

const router = express.Router();

router.post("/createReport", createReport);
router.get("/reports", getAllReport);
router.get("/reports/:reporterId", getAllReportById);
router.get('/reports/getType/:type' , getReportByType);
module.exports = router;