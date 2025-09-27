
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import { parsePostUrl } from '../../services/socialMedia';
import { useSelector } from 'react-redux';

export default function HomePage() {
  const navigate = useNavigate();
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
    if (!selectedPlatform) {
      alert('Please select a platform');
      return;
    }

    const parsedUrl = parsePostUrl(postLink);
    
    if (!parsedUrl) {
      alert('Invalid URL format. Please check the URL and try again.');
      return;
    }

    if (parsedUrl.type !== selectedPlatform) {
      alert(`The URL provided is not a valid ${selectedPlatform} URL`);
      return;
    }

    setAnalyzing(true);
    
    // Navigate to result page with the URL parameters
    navigate('/result', { 
      state: { 
        postData: parsedUrl,
        platform: selectedPlatform,
        url: postLink
      }
    });
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