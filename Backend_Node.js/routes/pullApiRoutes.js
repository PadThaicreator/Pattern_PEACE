const express = require("express");
const { pullTwitterPost , pullRedditPost } = require("../controllers/pullApiController");


const router = express.Router();

router.get("/twitter/:id", pullTwitterPost);
router.get("/reddit/:id/:subreddit", pullRedditPost);

module.exports = router;