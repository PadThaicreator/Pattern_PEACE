const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs") ;
const jwt = require("jsonwebtoken");
const axios = require("axios")

const pullTwitterPost = async (req, res) => {
  console.log(process.env.BEARER_TOKEN)
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

    res.send({
      platform: 'X (Twitter)',
      url: `https://twitter.com/user/status/${tweetId}`,
      content: tweetRes.data.data,
      comments: repliesRes.data.data || []
    })

   
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function extractImageUrlFromText(text) {
  // จับ URL พร้อม query params
  const urlRegex = /(https?:\/\/\S+\.(?:png|jpe?g|gif)(\?\S*)?)/gi;
  const matches = text.match(urlRegex);
  return matches ? matches[0].replace(/&amp;/g, '&') : null; // แปลง &amp; เป็น &
}


const  pullRedditPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const subreddit = req.params.subreddit
    
    const response = await axios.get(`https://www.reddit.com/r/${subreddit}/comments/${postId}.json`, {
      headers: {
        'User-Agent': 'PEACE_Pattern/1.0',
        'Accept': 'application/json'
      }
    });

    const postData = response.data[0]?.data?.children[0]?.data;
    if (!postData) throw new Error('Invalid Reddit API response format');

    // ดึง URL ของรูป preview จาก Reddit แบบ direct link พร้อม query params
    let imageUrl = null;
    if (postData.preview?.images?.length) {
      const source = postData.preview.images[0].source;
      const sHash = postData.preview.images[0].id || ''; // ถ้ามี hash ของรูป
      // ใส่ width, format, auto, s ให้เหมือนตัวอย่าง
      imageUrl = `${source.url.replace(/&amp;/g, '&')}&width=2048&format=pjpg&auto=webp`;
      if (source.url.includes('s=')) {
        // ถ้ามี s= hash เดิมอยู่ ให้คงไว้
        imageUrl = source.url.replace(/&amp;/g, '&');
      }
    } else if (postData.url && /\.(jpg|jpeg|png|gif)$/.test(postData.url)) {
      imageUrl = postData.url;
    }

    // ดึง comment พร้อมรูปถ้ามี
const comments = (response.data[1]?.data?.children || [])
  .filter(comment => comment.kind === 't1' && comment.data)
  .map(comment => {
    const image = extractImageUrlFromText(comment.data.body);
    const rawContent = comment.data.body;
    const normalizedContent = rawContent.replace(/&amp;/g, '&');
    const contents = image ? normalizedContent.replace(image, "").trim() : normalizedContent;
    return {
      author: comment.data.author,
      content: contents ,
      image // จะได้ full preview link
    };
  });

    const result = {
      platform: 'Reddit',
      url: `https://www.reddit.com/r/${subreddit}/comments/${postId}`,
      content: {
        title: postData.title,
        text: postData.selftext || postData.title,
        image: imageUrl
      },
      comments
    };

    // console.log(result);
    res.json(result)

  } catch (error) {
    console.error('Reddit fetch error:', error);
    throw new Error(`Failed to fetch Reddit post: ${error.message}`);
  }
}


// https://www.reddit.com/r/ThailandTourism/comments/1nrq3kh/thai_peoples_are_crazy_about_taking_loan/

module.exports = {pullTwitterPost , pullRedditPost};