import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  FileText,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import {
  fetchFacebookPost,
  fetchRedditPost,
  fetchTwitterPost,
  fetchStackOverflowPost,
} from "../../services/socialMedia";
import axios from "axios";
import { config } from "../../config";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [historyId , setHistory] = useState();

  useEffect(() => {
    if (!location.state) {
      navigate("/");
      return;
    }

    const { postData, platform, url , historyId } = location.state;
    setHistory(historyId);
    fetchData(postData, platform, url);
  }, [location.state, navigate]);

  useEffect(()=> {
    const updata = async () => {
      if (result?.content?.title) {
        
        const payload = {
          title: result?.content?.title,
        };
        await axios.put(`${config.apiBackend}/history/update/${historyId}`, payload);
      }
    }

    updata();
  },[result])

  const fetchData = async (postData, platform, url) => {
    try {
      let data;
      switch (platform) {
        case "facebook":
          data = await fetchFacebookPost(url);
          break;
        case "reddit":
          data = await fetchRedditPost(postData.postId, postData.subreddit);
          break;
        case "twitter":
          data = await fetchTwitterPost(postData.tweetId);
          break;
        case "stackoverflow":
          data = await fetchStackOverflowPost(postData.questionId);
          break;
        default:
          throw new Error("Unsupported platform");
      }
      
      setResult(data);

      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isCodeBlock = (text) => /<[\s\S]+>/.test(text) && text.includes("\n");

  const renderText = (text) => {
    if (!text) return null;
    return isCodeBlock(text) ? (
      <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200">
        <code className="text-gray-800">{text}</code>
      </pre>
    ) : (
      <p className="text-gray-700 leading-relaxed">{text}</p>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-orange-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handlePredict = async (text) => {
    alert(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-pink-100 to-orange-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-blue-600 font-semibold text-lg">
                Results from {result?.platform}
              </span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              New Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Post Content */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Post Content
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {typeof result?.content === "string" ? (
                <div>{renderText(result.content)}</div>
              ) : (
                <div className="space-y-4">
                  {result?.content?.title && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {result.content.title}
                      </h3>
                      <div className="h-px bg-gray-200 mb-4"></div>
                    </div>
                  )}
                  <div>
                    {renderText(result?.content?.text || result?.content?.body)}
                  </div>
                </div>
              )}

              {result?.content?.image && (
                <div className="mt-4">
                  <img
                    src={result.content.image}
                    alt="Post content"
                    className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <a
                  href={result?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Original Post
                </a>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Comments ({result?.comments?.length || 0})
                </h2>
              </div>
            </div>

            <div className="p-6">
              {!result?.comments?.length ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No comments found</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {result.comments.map((comment, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-100 last:border-b-0 pb-8 last:pb-0 "
                    >
                      <div>
                        <div className="flex justify-between">
                          {comment.author && (
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm text-white font-semibold shadow-md">
                                {comment.author.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-gray-900 text-lg">
                                {comment.author}
                              </span>
                            </div>
                          )}
                          <div>
                            {comment.content && (
                              <div
                                className="bg-red-200  rounded-full p-2 flex items-center justify-center cursor-pointer"
                                onClick={() => handlePredict(comment.content)}
                              >
                                <TriangleAlert
                                  color="red"
                                  size={24}
                                  className="w-full h-full"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-0">
                          {renderText(comment.content)}
                          {comment.image && (
                            <img
                              src={comment.image}
                              alt="Comment attachment"
                              className="mt-4 max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                              style={{ maxWidth: "450px" }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
