import { useEffect, useState } from "react";
import styles from "../report_page/Report.module.css";
import axios from "axios";
import { config } from "../../config";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { formatDate } from "../../utility/formatTime";
import { useNavigate } from "react-router-dom";

export default function HistoryPage() {
  const [history, setHistory] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const user = useSelector((state) => state.user.user);
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${config.apiBackend}/history/get/${user.id}`
      );

      if (res.data) {
        setHistory(res.data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-orange-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }
  return (
    <div className={styles.heroSection}>
      

      <div className={`${styles.postResult} !bg-gray-100 flex flex-col gap-3`}>
        <div className="text-2xl font-bold">History Post</div>
        {history ? (
          history.map((item, index) => <HistoryCard key={index} item={item} />)
        ) : (
          <div className={styles.postResult}>
            <div className="text-center">ยังไม่มีประวัติการวิเคราะห์</div>
          </div>
        )}
      </div>
    </div>
  );
}

const HistoryCard = (prop) => {
  const { item } = prop;

  const Platform = (item) => {
    switch (item) {
      case "facebook":
        return "Facebook";
      case "reddit":
        return "Reddit";
      case "twitter":
        return "X";
      case "stackoverflow":
        return "StackOverflow";
      default:
        throw new Error("Unsupported platform");
    }
  };
  const platform = Platform(item.platform);
  const navigate = useNavigate();
  const handleAnalyzer = () => {
    navigate("/result", {
      state: {
        postData: item.postData,
        platform: item.platform,
        url: item.url,
        historyId: false,
      },
    });
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-lg flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="flex gap-4 items-center">
          <img
            src={`Logo_${platform}.png`}
            width={50}
            className="rounded-lg shadow-md"
          />
          <div>{platform}</div>
        </div>
        <div>
          <div className="bg-blue-400 p-2 text-white rounded-xl text-[14px]">
            {formatDate(item.createdAt)}
          </div>
        </div>
      </div>
      <div>
        <div>Title : {item.title}</div>
        <div className="flex justify-between">
          <a href={item.url} target="_blank" className="text-blue-400">
            Original Post
          </a>
          <div
            className="text-blue-400 cursor-pointer"
            onClick={handleAnalyzer}
          >
            Analyzer
          </div>
        </div>
      </div>
    </div>
  );
};
