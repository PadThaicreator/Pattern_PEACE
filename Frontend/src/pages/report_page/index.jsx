import { useState } from 'react';
import styles from './Report.module.css';

export default function ReportPage() {
  const [selectedPost, setSelectedPost] = useState(null);

  return (
    <div>
      <div className={styles.heroSection}>
        <h2 className={styles.heroTitle}>รายงานผล</h2>
        <p className={styles.heroSubtitle}>สรุปผลการวิเคราะห์โพสต์ทั้งหมด</p>
      </div>

      {selectedPost ? (
        <div className={styles.postResult}>
          <button className={styles.backBtn} onClick={() => setSelectedPost(null)}>
            ← กลับ
          </button>
          <div className={styles.postHeader}>
            <div className={styles.authorAvatar}></div>
            <div className={styles.authorInfo}>
              <h3>{selectedPost.author}</h3>
              <div className={styles.postMeta}>
                {selectedPost.platform} • {selectedPost.date}
              </div>
            </div>
          </div>

          <div className={styles.postContent}>
            <h2 className={styles.postTitle}>{selectedPost.title}</h2>
            <p className={styles.postText}>{selectedPost.content}</p>
          </div>

          {selectedPost.comments && (
            <div className={styles.commentsSection}>
              <h3 className={styles.commentsTitle}>ความคิดเห็น</h3>
              <div id="commentsList">
                {selectedPost.comments.map((comment, index) => (
                  <div key={index} className={styles.comment}>
                    <div className={styles.commentAuthor}>{comment.author}</div>
                    <div className={styles.commentText}>{comment.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.postResult}>
          <div className="text-center">เลือกโพสต์ที่ต้องการดูรายงาน</div>
        </div>
      )}
    </div>
  );
}