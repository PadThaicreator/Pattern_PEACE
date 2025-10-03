
const { PrismaClient } = require("@prisma/client");
const { axios } = require("axios");
const prisma = new PrismaClient();

const createReport = async (req, res) => {
  const { reporterId, comment } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: reporterId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found!" });
    }

    let data;
    try {
    const response = await axios.get(`http://127.0.0.1:8000/${comment}`);
    data = response.data;
    } catch (err) {
    console.error('FastAPI request failed:', err.message);
    return res.status(502).json({ message: 'Failed to fetch from FastAPI', error: err.message });
    }
    let predict
    if(data.message != "Non Toxic"){
        // ฟิลเตอร์ TOXIC ตามเงื่อนไข
        const filtered = data.filter((item) => {
        if (item.label === "TOXIC") {
            return item.score >= 0.4 && item.score <= 0.6; // TOXIC อยู่ในช่วงที่กำหนด
        }
        return true; // อื่น ๆ เอาหมด
        });

        // เรียงจาก score มากไปน้อย
        filtered.sort((a, b) => b.score - a.score);

        // เอาแค่ 3 อันดับแรก
        predict = filtered.slice(0, 3).map((item) => item.label);
    }

    const report = await prisma.reportHistory.create({
      data: {
        reporterId: reporterId,
        typeOfReport: predict || ["Non Toxic"],
        comment: comment,
      },
    });
    res.status(201).json({ message: "Comment Reported!", report });
  } catch (error) {
    res.status(500).json({ message: error.message });
    console.log(error)
  }
};

const getAllReport = async (req, res) => {
  try {
    const reports = await prisma.reportHistory.findMany();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReportById = async (req, res) => {
  const { reporterId } = req.params;
  try {
    const reports = await prisma.reportHistory.findMany({
      where: { reporterId: reporterId },
      orderBy: { createdAt: "desc" },
    });
    if (reports.length === 0) {
      return res.status(404).json({ message: "No history found!" });
    }

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReportByType = async (req,res) =>{
    try {
        const type = req.params.type
        
        const data = await prisma.reportHistory.findMany({
            where : {
                typeOfReport : {
                    has: type.toUpperCase() 
                }
            }
        })
        res.json(data);
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

module.exports = { createReport, getAllReport, getAllReportById , getReportByType};