const express = require("express");
const { createHistory, getHistory , updateHistory , getMockUpPost } = require("../controllers/postController");

const router = express.Router();

router.get('/get/:id' , getHistory);
router.post('/create' , createHistory);
router.put('/update/:id' , updateHistory);
router.get('/mockup' , getMockUpPost);
module.exports = router;