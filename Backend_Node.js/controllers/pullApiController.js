const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs") ;
const jwt = require("jsonwebtoken");
const axios = require("axios")

const pullTwitterPost = async (req, res) => {
  try {
    const tweetId = req.params.id;

    // ดึง tweet หลัก
    const tweetRes = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
      headers: { Authorization: `Bearer ${process.env.BEARER_TOKEN}` },
      params: { 'tweet.fields': 'created_at,author_id,public_metrics' }
    });

    const tweetData = tweetRes.data.data;

    // Clean text ของ tweet หลัก
    const cleanedTweetText = tweetData.text
      .replace(/@\w+/g, '')           // ลบ mentions
      .replace(/https?:\/\/t\.co\/\w+/g, '') // ลบ short URLs
      .trim();

    const content = { ...tweetData, text: cleanedTweetText };

    // ดึง replies
    const repliesRes = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: { Authorization: `Bearer ${process.env.BEARER_TOKEN}` },
      params: {
        query: `conversation_id:${tweetId}`,
        'tweet.fields': 'author_id,created_at',
        max_results: 20 // fetch a limited set then slice to 5 below
      }
    });

    // Take only up to 5 replies to reduce rate/size
    const rawReplies = (repliesRes.data.data || []).slice(0, 5);
    const comments = rawReplies.map(comment => {
      const image = extractImageUrlFromText(comment.text);
      const cleanedText = comment.text
        .replace(/@\w+/g, '')             // remove mentions
        .replace(/https?:\/\/t\.co\/\w+/g, '') // remove short URLs
        .trim();
      return { ...comment, text: cleanedText, image };
    });

    // ส่ง response
    res.send({
      platform: 'X (Twitter)',
      url: `https://twitter.com/user/status/${tweetId}`,
      content,
      comments
    });

  } catch (error) {
    console.error('pullTwitterPost error:', error.message);
    if (error.response) {
      console.error('Twitter API response status:', error.response.status);
      console.error('Twitter API response data:', error.response.data);
      return res.status(502).json({ message: 'Twitter API error', status: error.response.status, data: error.response.data });
    }
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
  .slice(0,5)
  .map(comment => {
    const image = extractImageUrlFromText(comment.data.body);
    const rawContent = comment.data.body;
    const normalizedContent = rawContent.replace(/&amp;/g, '&');
    const contents = image ? normalizedContent.replace(image, "").trim() : normalizedContent;
    return {
      author: comment.data.author,
      content: contents ,
      image // will be the full preview link if present
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

// proxy image fetch to avoid CORS for frontend OCR
const fetch = require('node-fetch');

const fetchImageProxy = async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ message: 'Invalid url parameter' });
    }

    // Basic safety: limit to reasonable length
    if (url.length > 2000) return res.status(400).json({ message: 'URL too long' });

    // Fetch image as arraybuffer
    const resp = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000, headers: { 'User-Agent': 'PEACE_Pattern/1.0' } });
    const contentType = resp.headers['content-type'] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(Buffer.from(resp.data, 'binary'));
  } catch (err) {
    console.error('fetchImageProxy error:', err.message || err);
    if (err.response) {
      return res.status(502).json({ message: 'Upstream fetch failed', status: err.response.status });
    }
    res.status(500).json({ message: 'Failed to fetch image' });
  }
};

// add proxy export
module.exports.fetchImageProxy = fetchImageProxy;