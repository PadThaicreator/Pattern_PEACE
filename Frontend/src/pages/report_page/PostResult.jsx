import React from 'react';
import styles from '../report_page/Report.module.css';

const PostResult = ({ post, onBack }) => {
  if (!post) return null;

  return (
    <div className={styles.postResult}>
      <button className={styles.backBtn} onClick={onBack}>
        ← กลับ
      </button>
      <div className={styles.postHeader}>
        <div className={styles.authorAvatar}></div>
        <div className={styles.authorInfo}>
          <h3>{post.author}</h3>
          <div className={styles.postMeta}>
            {post.platform} • {post.date}
          </div>
        </div>
      </div>

      <div className={styles.postContent}>
        <h2 className={styles.postTitle}>{post.title}</h2>
        <p className={styles.postText}>{post.content}</p>
      </div>

      {post.comments && post.comments.length > 0 && (
        <div className={styles.commentsSection}>
          <h3 className={styles.commentsTitle}>ความคิดเห็น</h3>
          <div id="commentsList">
            {post.comments.map((comment, index) => (
              <div key={index} className={styles.comment}>
                <div className={styles.commentAuthor}>{comment.author}</div>
                <div className={styles.commentText}>{comment.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostResult;