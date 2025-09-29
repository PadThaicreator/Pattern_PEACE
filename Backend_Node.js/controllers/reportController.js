const { PrismaClient } = require("@prisma/client");
const { default: axios } = require("axios");
const prisma = new PrismaClient();

const createReport = async ( req, res ) => {
    const { reporterId, typeOfReport, comment } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { id: reporterId },
        });

        if (!user) {
            return res.status(401).json({ message: "User not found!" });
        }

        const normalizedTypes = Array.isArray(typeOfReport)
            ? typeOfReport
            : (typeof typeOfReport === 'string' && typeOfReport.length > 0)
                ? [typeOfReport]
                : [];

        const report = await prisma.reportHistory.create({
            data : {
                reporterId : reporterId,
                typeOfReport : normalizedTypes,
                comment : comment 
            }
        });
        res.status(201).json({ message: "Comment Reported!", report });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
            orderBy: { createdAt: "desc"},
        });
        if (reports.length === 0) {
            return res.status(404).json({ message: "No history found!" });
        }
        
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createReport, getAllReport, getAllReportById };
