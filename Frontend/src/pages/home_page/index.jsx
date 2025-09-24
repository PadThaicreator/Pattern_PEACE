
import { useState } from 'react';
import styles from './Home.module.css';

export default function HomePage() {
  const [postLink, setPostLink] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '/Logo_Facebook.png' },
    { id: 'reddit', name: 'Reddit', icon: '/Logo_Reddit.jpg' },
    { id: 'twitter', name: 'X', icon: '/Logo_X.jpg' },
    { id: 'stackoverflow', name: 'Stack Overflow', icon: '/Logo_StackOverflow.png' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!postLink.trim()) {
      alert('Please Enter Link');
      return;
    }

    let platform = 'reddit'; // default
    if (postLink.includes('facebook.com')) platform = 'facebook';
    else if (postLink.includes('twitter.com') || postLink.includes('x.com')) platform = 'twitter';
    else if (postLink.includes('stackoverflow.com')) platform = 'stackoverflow';

    setAnalyzing(true);
    // Here you would make the API call to analyze the post
    // For now, we'll just simulate it
    try {
      // TODO: Replace with actual API call
      console.log('Analyzing post:', { postLink, platform });
      // Navigate to report page after analysis
      // You might want to pass the results through state management or URL params
    } catch (error) {
      console.error('Error analyzing post:', error);
      alert('Error analyzing post. Please try again.');
    } finally {
      setAnalyzing(false);
      setPostLink('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={styles.homepage}>
      <div className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Social Media Post Analyzer</h1>

        <div className={styles.socialPlatforms}>
          {platforms.map((platform) => (
            <div 
              key={platform.id} 
              className={`${styles.platformContainer} ${selectedPlatform === platform.id ? styles.selected : ''}`}
              onClick={() => {
                setSelectedPlatform(platform.id);
                setPostLink('');  // Clear input when switching platform
              }}
            >
              <div className={styles.platformIcon}>
                <img 
                  src={platform.icon} 
                  alt={platform.name} 
                  className={styles.platformImage}
                />
              </div>
              <div>{platform.name}</div>
            </div>
          ))}
        </div>

        <div className={styles.linkInputSection}>
          <input
            type="text"
            id="postLink"
            className={styles.linkInput}
            placeholder="Enter Link..."
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={handleSubmit} className={styles.submitBtn}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}