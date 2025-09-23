const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// const getUser = async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         const user = await prisma.user.findFirst({ where:{ email:email } });
//         if(!user) {
//             return res.status(401).json({ message: "User doesn't exists"});
//         }
//         res.status(201).json({ message: "User created", user });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const getAllUser = async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {getAllUser};