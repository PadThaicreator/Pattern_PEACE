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

  const KNOWN_TYPES = ['TOXIC','OBSCENE','THREAT','INSULT','IDENTITY_HATE'];
  const toTitleCaseEnum = (text) => {
    if (!text) return '';
    return text
      .toString()
      .replaceAll('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };
  const formatReportTypes = (value) => {
    if (Array.isArray(value)) {
      return value.map(toTitleCaseEnum).join(', ');
    }
    if (typeof value === 'string') {
      const found = KNOWN_TYPES.filter((t) => value.includes(t));
      if (found.length > 0) {
        return found.map(toTitleCaseEnum).join(', ');
      }
      return toTitleCaseEnum(value);
    }
    return '';
  };

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
      {selectedReport ? (
        <div className={styles.postResult}>
          <button className={styles.backBtn} onClick={() => setSelectedReport(null)}>
            ← กลับ
          </button>

          <div className={styles.postHeader}>
            <div className={styles.authorAvatar}></div>
            <div className={styles.authorInfo}>
              <h3>Report Type: {formatReportTypes(selectedReport.typeOfReport)}</h3>
              <div className={styles.postMeta}>Created: {formatDate(selectedReport.createdAt)}</div>
            </div>
          </div>

          <div className={styles.postContent}>
            <h2 className={styles.postTitle}>Comment:</h2>
            <p className={styles.postText}>{selectedReport.comment || 'No additional comment'}</p>
          </div>
        </div>
      ) : (
        <div className={`${styles.postResult} flex flex-col gap-3`}>
          <div className="text-2xl font-bold">List of your report</div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className="bg-white shadow-md p-4 rounded-lg flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="font-semibold">
                    {formatReportTypes(report.typeOfReport)}
                  </div>
                  <div>
                    <div className="bg-blue-400 p-2 text-white rounded-xl text-[14px]">
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {report.comment || 'No additional comment'}
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    className="text-blue-400"
                    onClick={() => setSelectedReport(report)}
                  >
                    View Detail
                  </button>
                </div>
              </div>
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