import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Result.module.css';
import {
  fetchFacebookPost,
  fetchRedditPost,
  fetchTwitterPost,
  fetchStackOverflowPost,
} from '../../services/socialMedia';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!location.state) {
      navigate('/');
      return;
    }

    const { postData, platform, url } = location.state;
    fetchData(postData, platform, url);
  }, [location.state, navigate]);

  const fetchData = async (postData, platform, url) => {
    try {
      let data;
      switch (platform) {
        case 'facebook':
          // Note: Facebook requires login credentials in a real app
          data = await fetchFacebookPost(url);
          break;
        case 'reddit':
          data = await fetchRedditPost(postData.postId, postData.subreddit);
          break;
        case 'twitter':
          data = await fetchTwitterPost(postData.tweetId);
          break;
        case 'stackoverflow':
          data = await fetchStackOverflowPost(postData.questionId);
          break;
        default:
          throw new Error('Unsupported platform');
      }
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Results from {result.platform}</h1>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          New Analysis
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.postContent}>
          <h2>Post Content</h2>
          {typeof result.content === 'string' ? (
            <p>{result.content}</p>
          ) : (
            <>
              {result.content.title && <h3>{result.content.title}</h3>}
              <p>{result.content.text || result.content.body}</p>
            </>
          )}
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            View Original Post
          </a>
        </div>

        <div className={styles.comments}>
          <h2>Comments</h2>
          {result.comments.length === 0 ? (
            <p>No comments found</p>
          ) : (
            <ul>
              {result.comments.map((comment, index) => (
                <li key={index} className={styles.comment}>
                  {comment.author && <strong>{comment.author}: </strong>}
                  <p>{comment.content}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}