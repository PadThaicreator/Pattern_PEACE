const axios = require('axios');

function extractImageUrlFromText(text) {
  // จับ URL พร้อม query params
  const urlRegex = /(https?:\/\/\S+\.(?:png|jpe?g|gif)(\?\S*)?)/gi;
  const matches = text.match(urlRegex);
  return matches ? matches[0].replace(/&amp;/g, '&') : null; // แปลง &amp; เป็น &
}

async function fetchRedditPost(postId, subreddit) {
  try {
    console.log('Fetching Reddit post:', { postId, subreddit });
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
    return {
      author: comment.data.author,
      content: comment.data.body,
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

    console.log(result);
    return result;

  } catch (error) {
    console.error('Reddit fetch error:', error);
    throw new Error(`Failed to fetch Reddit post: ${error.message}`);
  }
}

// ทดลองเรียก
fetchRedditPost("1nrenca", "Fauxmoi");
