import styles from '../report_page/Report.module.css';

export default function HistoryPage() {

 
  return (
    <div className={styles.heroSection}>
      <h2 className={styles.heroTitle}>ประวัติการวิเคราะห์</h2>
      <p className={styles.heroSubtitle}>รายการโพสต์ที่เคยวิเคราะห์</p>
      {/* History list will be implemented here */}
      <div className={styles.postResult}>
        <div className="text-center">ยังไม่มีประวัติการวิเคราะห์</div>
      </div>
    </div>
  );
}