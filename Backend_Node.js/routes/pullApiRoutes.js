const express = require("express");
const { pullTwitterPost } = require("../controllers/pullApiController");


const router = express.Router();

router.get("/twitter/:id", pullTwitterPost);


module.exports = router;