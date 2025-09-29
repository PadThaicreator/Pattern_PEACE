import { useEffect, useState } from 'react';
import styles from './Report.module.css';
import api from '../../api';
import { config } from '../../config';
import { useSelector } from 'react-redux';
import { formatDate } from '../../utility/formatTime';

export default function ReportPage() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (!user || !user.id) return;
    fetchReports(user.id);
  }, [user?.id]);

  const fetchReports = async (reporterId) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.get(`/api/reports/${encodeURIComponent(reporterId)}`);
      setReports(res.data || []);
    } catch (err) {
      const backendMsg = err?.response?.data?.message || err?.message || 'Unknown error';
      console.error('Failed to load reports', backendMsg);
      if (err.response && err.response.status === 404) {
        setReports([]);
      } else {
        setError(`Failed to load reports: ${backendMsg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || !user.id) {
    return (
      <div className={styles.heroSection}>
        <div className={`${styles.postResult} !bg-gray-100`}>Waiting for user...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.heroSection}>
        <div className={`${styles.postResult} !bg-gray-100`}>Loading reports...</div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.heroSection}>
        <h2 className={styles.heroTitle}>รายงานผล</h2>
        <p className={styles.heroSubtitle}>สรุปผลการรายงานของผู้ใช้</p>
      </div>

      {selectedReport ? (
        <div className={styles.postResult}>
          <button className={styles.backBtn} onClick={() => setSelectedReport(null)}>
            ← กลับ
          </button>

          <div className={styles.postHeader}>
            <div className={styles.authorAvatar}></div>
            <div className={styles.authorInfo}>
              <h3>Report Type: {selectedReport.typeOfReport}</h3>
              <div className={styles.postMeta}>Created: {formatDate(selectedReport.createdAt)}</div>
            </div>
          </div>

          <div className={styles.postContent}>
            <h2 className={styles.postTitle}>รายละเอียด</h2>
            <p className={styles.postText}>{selectedReport.comment || 'No additional comment'}</p>
          </div>
        </div>
      ) : (
        <div className={`${styles.postResult} flex flex-col gap-3`}>
          <div className="text-2xl font-bold">รายการรายงานของคุณ</div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {reports.length > 0 ? (
            reports.map((report) => (
              <button
                key={report.id}
                className="text-left p-4 rounded-md bg-white border hover:bg-gray-50"
                onClick={() => setSelectedReport(report)}
              >
                <div className="font-semibold">{Array.isArray(report.typeOfReport) ? report.typeOfReport.join(', ') : report.typeOfReport}</div>
                <div className="text-sm text-gray-600">{formatDate(report.createdAt)}</div>
                {report.comment && (
                  <div className="text-sm mt-1 line-clamp-2">{report.comment}</div>
                )}
              </button>
            ))
          ) : (
            <div className={styles.postResult}>
              <div className="text-center">ยังไม่มีรายการรายงาน</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}