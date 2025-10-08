const express = require("express");
const { pullTwitterPost , pullRedditPost } = require("../controllers/pullApiController");


const router = express.Router();

router.get("/twitter/:id", pullTwitterPost);
router.get("/reddit/:id/:subreddit", pullRedditPost);
router.get('/image/proxy', require('../controllers/pullApiController').fetchImageProxy);

module.exports = router;