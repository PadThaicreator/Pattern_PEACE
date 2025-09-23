const axios = require('axios');

async function fetchRedditPostAndComments() {
  const postId = '1nnd9am';
  const subreddit = 'investing';

  try {
    // ดึงข้อมูลโพสต์
    const postResponse = await axios.get(`https://www.reddit.com/r/${subreddit}/comments/${postId}.json`, {
      headers: { 'User-Agent': 'YourAppName/1.0' }
    });

    const postData = postResponse.data[0].data.children[0].data;
    console.log('Post Title:', postData.title);
    console.log('Post URL:', postData.url);
    console.log('Post Content:', postData.selftext);

    // ดึงคอมเมนต์
    const comments = postResponse.data[1].data.children;
    comments.forEach(comment => {
      if (comment.kind === 't1') {
        console.log('Comment by', comment.data.author);
        console.log('Comment:', comment.data.body);
        console.log('---');
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchRedditPostAndComments();
