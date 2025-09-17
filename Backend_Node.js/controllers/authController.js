const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs") ;
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data : {
        name : name,
        email : email,
        password: hashedPassword,
      }
    });
    res.status(201).json({ message: "User created", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // find User
    const user = await prisma.user.findFirst({ where:{ email:email } });
    if(!user) return res.status(400).json({ message: "User not found" });

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" })

    // create token by JWT    jwt.sign( {},  process.env.JWT_SECRET, {},)
    const token = jwt.sign({ id:user._id, email:user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login Success", token});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
 
};



module.exports = {register, login};