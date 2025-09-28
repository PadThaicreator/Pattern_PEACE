const axios = require('axios');

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAOxM4QEAAAAA8uEi52qBRw9E788x42dhpS9TDVQ%3DHgQEE2kFejbvoeN8HTekIvjg0C84c3GeyDV5HPqOHd273MVI7s';

async function getTweetAndReplies(tweetId) {
  try {
    // ดึงทวีตหลัก
    const tweetRes = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      params: { 'tweet.fields': 'created_at,author_id,public_metrics' }
    });
   
    const tweet = tweetRes.data.data;
    console.log('--- TWEET ---');
    console.log(tweet);

    // ดึง replies
    const repliesRes = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      params: {
        query: `conversation_id:${tweetId}`,
        'tweet.fields': 'author_id,created_at,public_metrics'
      }
    });

    console.log('--- REPLIES ---');
    repliesRes.data.data?.forEach(reply => console.log(reply));

  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

// ตัวอย่างใช้งาน
getTweetAndReplies('1969394427744723400');


// 10000 requests per month
