const express = require("express");
const { register, login } = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// router.get("/dashboard", verifyToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password"); // ไม่ส่ง password กลับ

//     res.json({
//       message: "Protected route accessed",
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch user data" });
//   }
// });

module.exports = router;