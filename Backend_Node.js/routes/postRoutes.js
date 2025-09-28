const express = require("express");
const { createHistory, getHistory , updateHistory } = require("../controllers/postController");

const router = express.Router();

router.get('/get/:id' , getHistory);
router.post('/create' , createHistory);
router.put('/update/:id' , updateHistory);
module.exports = router;