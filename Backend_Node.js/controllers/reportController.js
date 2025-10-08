
const { PrismaClient } = require("@prisma/client");
const axios = require('axios'); // ต้อง import มาแบบนี้

const prisma = new PrismaClient();

const createReport = async (req, res) => {
  const { reporterId, comment , platform } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: reporterId },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found!" });
    }

    let data;
    let explain
    try {
    const response = await axios.get(`http://127.0.0.1:8000/analyze?comment=${comment}`);
    if(response.data){
      if(response.data.toxicity_analysis.toxic_types.length > 0){
        data = response.data.toxicity_analysis.toxic_types;
        explain = response.data.toxicity_analysis.explanation
      }else{
        data = ["Non Toxic"]
      }
    }
    } catch (err) {
    console.error('FastAPI request failed:', err.message);
    return res.status(502).json({ message: 'Failed to fetch from FastAPI', error: err.message });
    }
    
    

    const report = await prisma.reportHistory.create({
      data: {
        reporterId: reporterId,
        typeOfReport: data,
        platform : platform,
        explain : explain,
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