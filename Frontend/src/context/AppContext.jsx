import { createContext, useContext, useState } from 'react';

// Mock data from the original HTML file
export const mockData = {
  reddit: {
    author: "TechGuru2024",
    platform: "Reddit",
    date: "2 ชั่วโมงที่แล้ว",
    title: "สอนวิธีเขียน React Hooks ให้เป็นมืออาชีพ",
    content: "สวัสดีครับ วันนี้ผมมาแชร์เทคนิคการเขียน React Hooks ที่ได้ลองใช้มาหลายปี รวมถึงการใช้ useState, useEffect, และ custom hooks ต่างๆ ที่จะช่วยให้โค้ดของเราสะอาดและมีประสิทธิภาพมากขึ้น...",
    comments: [
      { author: "ReactLearner", text: "ขอบคุณสำหรับเทคนิคดีๆ ครับ!" },
      { author: "WebDev101", text: "มีประโยชน์มากเลยครับ" },
    ]
  },
  facebook: {
    author: "สมชาย ใจดี",
    platform: "Facebook",
    date: "1 วันที่แล้ว",
    title: "รีวิวร้านอาหารใหม่ย่านทองหล่อ",
    content: "เมื่อเย็นไปลองร้านอาหารไทยใหม่ย่านทองหล่อ รสชาติดีมาก บรรยากาศดี ราคาไม่แพง แนะนำเมนูต้มยำกุ้งกับผัดไทย อร่อยมากจริงๆ ให้ 5 ดาว! 🌟🌟🌟🌟🌟",
    comments: [
      { author: "มานี", text: "น่าไปลองจังเลยค่ะ" },
      { author: "สมศรี", text: "ขอชื่อร้านหน่อยค่ะ" },
    ]
  },
  twitter: {
    author: "@TechReporter",
    platform: "X (Twitter)",
    date: "3 ชั่วโมงที่แล้ว",
    title: "ข่าวด่วน: OpenAI เปิดตัว GPT-5",
    content: "🚨 Breaking: OpenAI เพิ่งประกาศเปิดตัว GPT-5 อย่างเป็นทางการ! ความสามารถใหม่รวมถึง multimodal reasoning และประสิทธิภาพที่เพิ่มขึ้น 50% #AI #GPT5 #OpenAI",
    comments: [
      { author: "@AIEnthusiast", text: "นี่เป็นก้าวสำคัญของวงการ AI เลย!" },
      { author: "@TechNews", text: "รอดูว่าจะเปลี่ยนโลกยังไงต่อ" },
    ]
  },
  stackoverflow: {
    author: "CodeMaster",
    platform: "Stack Overflow",
    date: "5 ชั่วโมงที่แล้ว",
    title: "How to optimize React performance with useMemo and useCallback?",
    content: "I'm working on a large React application and facing performance issues. I understand that useMemo and useCallback can help, but I'm not sure when and how to use them effectively. Can someone explain the best practices?",
    comments: [
      { author: "ReactPro", text: "Here's a detailed explanation..." },
      { author: "OptimizationGuru", text: "Let me add some examples..." },
    ]
  }
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('homepage');
  const [selectedPost, setSelectedPost] = useState(null);
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  const handleAnalyzePost = (link, platform) => {
    const post = mockData[platform];
    if (post) {
      setSelectedPost(post);
      setHistory(prev => [post, ...prev]);
      setCurrentPage('postResult');
    }
  };

  const value = {
    currentPage,
    setCurrentPage,
    selectedPost,
    setSelectedPost,
    user,
    setUser,
    history,
    handleAnalyzePost,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};