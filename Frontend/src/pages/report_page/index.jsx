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
              <div key={report.id} className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200 hover:shadow-xl transition-shadow">
  {/* Header Section */}
  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 flex justify-between items-start border-b border-slate-200">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-xs font-medium text-slate-500">Report Type</span>
      </div>
      <div className="font-semibold text-slate-800 text-base">
        {formatReportTypes(report.typeOfReport)}
      </div>
    </div>
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white rounded-lg text-xs font-medium shadow-sm">
      {formatDate(report.createdAt)}
    </div>
  </div>

  {/* Content Section */}
  <div className="p-4 space-y-4">
    {/* Comment */}
    <div>
      <div className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
        Comment
      </div>
      <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
        {report.comment || 'No additional comment'}
      </div>
    </div>

    {/* Toxic Words Explanation */}
    {report.explain && report.explain.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-amber-500 rounded-full"></div>
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Words That Seem Toxic
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {report.explain.map((word, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-medium shadow-sm"
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>

  {/* Footer Section */}
  <div className="px-4 pb-4 flex justify-end">
    <button
      className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
      onClick={() => setSelectedReport(report)}
    >
      <span>View Details</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
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