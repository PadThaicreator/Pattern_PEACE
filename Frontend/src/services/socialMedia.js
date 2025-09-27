import axios from 'axios';
import { htmlToText } from 'html-to-text';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAOxM4QEAAAAA8uEi52qBRw9E788x42dhpS9TDVQ%3DHgQEE2kFejbvoeN8HTekIvjg0C84c3GeyDV5HPqOHd273MVI7s';

export async function fetchFacebookPost(postUrl, email, password) {
  // For demo purposes - direct scraping not recommended in production
  // Should use Facebook Graph API with proper authentication
  return {
    platform: 'Facebook',
    url: postUrl,
    content: 'Facebook content cannot be fetched directly from frontend. Use Facebook Graph API instead.',
    comments: []
  };
}

export async function fetchRedditPost(postId, subreddit) {
  try {
    console.log('Fetching Reddit post:', { postId, subreddit });
    const response = await axios.get(`https://www.reddit.com/r/${subreddit}/comments/${postId}.json`, {
      headers: {
        'User-Agent': 'PEACE_Pattern/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log('Reddit API response:', response.data);
    const postData = response.data[0]?.data?.children[0]?.data;
    if (!postData) {
      throw new Error('Invalid Reddit API response format');
    }

    const comments = (response.data[1]?.data?.children || [])
      .filter(comment => comment.kind === 't1' && comment.data)
      .map(comment => ({
        author: comment.data.author,
        content: comment.data.body
      }));

    return {
      platform: 'Reddit',
      url: `https://www.reddit.com/r/${subreddit}/comments/${postId}`,
      content: {
        title: postData.title,
        text: postData.selftext || postData.title
      },
      comments
    };
  } catch (error) {
    console.error('Reddit fetch error:', error);
    throw new Error(`Failed to fetch Reddit post: ${error.message}`);
  }
}

export async function fetchTwitterPost(tweetId) {
  try {
    const tweetRes = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      params: { 'tweet.fields': 'created_at,author_id,public_metrics' }
    });

    const repliesRes = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      params: {
        query: `conversation_id:${tweetId}`,
        'tweet.fields': 'author_id,created_at'
      }
    });

    return {
      platform: 'X (Twitter)',
      url: `https://twitter.com/user/status/${tweetId}`,
      content: tweetRes.data.data,
      comments: repliesRes.data.data || []
    };
  } catch (error) {
    throw new Error(`Failed to fetch Twitter post: ${error.message}`);
  }
}

export async function fetchStackOverflowPost(questionId) {
  try {
    const questionRes = await axios.get(`https://api.stackexchange.com/2.3/questions/${questionId}`, {
      params: {
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
      }
    });

    const answersRes = await axios.get(`https://api.stackexchange.com/2.3/questions/${questionId}/answers`, {
      params: {
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
      }
    });

    const question = questionRes.data.items[0];
    const answers = answersRes.data.items.map(answer => ({
      author: answer.owner.display_name,
      content: htmlToText(answer.body)
    }));

    return {
      platform: 'Stack Overflow',
      url: question.link,
      content: {
        title: question.title,
        body: htmlToText(question.body)
      },
      comments: answers
    };
  } catch (error) {
    throw new Error(`Failed to fetch Stack Overflow post: ${error.message}`);
  }
}

export function parsePostUrl(url) {
  try {
    if (url.includes('facebook.com')) {
      return { type: 'facebook', url };
    } else if (url.includes('reddit.com')) {
      // Handle both old and new Reddit URLs, with or without additional parameters
      const match = url.match(/reddit\.com\/r\/([^\/]+)\/comments\/([^\/\?]+)/);
      if (match) {
        const subreddit = match[1];
        const postId = match[2].split('?')[0]; // Remove any query parameters
        console.log('Parsed Reddit URL:', { subreddit, postId });
        return { type: 'reddit', subreddit, postId };
      }
      return null;
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      const match = url.match(/\/status\/(\d+)/);
      // alert(match[1]);
      return match ? { type: 'twitter', tweetId: match[1] } : null;
    } else if (url.includes('stackoverflow.com')) {
      const match = url.match(/questions\/(\d+)/);
      return match ? { type: 'stackoverflow', questionId: match[1] } : null;
    }
    return null;
  } catch (error) {
    return null;
  }
}