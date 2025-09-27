const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs") ;
const jwt = require("jsonwebtoken");
const axios = require("axios")

const pullTwitterPost = async (req, res) => {

  try {
    const tweetId = req.params.id;
    const tweetRes = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
      headers: { Authorization: `Bearer ${process.env.BEARER_TOKEN}` },
      params: { 'tweet.fields': 'created_at,author_id,public_metrics' }
    });

    const repliesRes = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: { Authorization: `Bearer ${process.env.BEARER_TOKEN}` },
      params: {
        query: `conversation_id:${tweetId}`,
        'tweet.fields': 'author_id,created_at'
      }
    });

    // res.send({
    //   platform: 'X (Twitter)',
    //   url: `https://twitter.com/user/status/${tweetId}`,
    //   content: tweetRes.data.data,
    //   comments: repliesRes.data.data || []
    // })

    res.json({
        "message" : "Hello World"
    })
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






module.exports = {pullTwitterPost};