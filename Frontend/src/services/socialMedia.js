import axios from 'axios';
import { htmlToText } from 'html-to-text';
import { config } from '../config';

const BEARER_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAOxM4QEAAAAA8uEi52qBRw9E788x42dhpS9TDVQ%3DHgQEE2kFejbvoeN8HTekIvjg0C84c3GeyDV5HPqOHd273MVI7s';

export async function fetchFacebookPost(postUrl, email, password) {
  // For demo purposes - direct scraping not recommended in production
  // Should use Facebook Graph API with proper authentication
  return {
    platform: 'Facebook',
    url: postUrl,
    content: 'Facebook content cannot be fetched directly from frontend. Use Facebook Graph API instead.',
    comments: []
  };
}

export async function fetchRedditPost(postId, subreddit) {
  try {
    const res = await axios.get(`${config.apiBackend}/pull/reddit/${postId}/${subreddit}`)
    const data = res.data;

    // OCR any images in post content and comments
    if (data?.content?.image) {
      try {
        const ocr = await ocrImageFromUrl(data.content.image);
        if (ocr) data.content.text = (data.content.text || data.content.body || '') + `\n\nPicture Content:\n${ocr}`;
      } catch (e) { console.warn('Reddit post image OCR failed', e); }
    }

    if (Array.isArray(data.comments)) {
      await Promise.all(data.comments.map(async (c) => {
        if (c.image) {
          try {
            const ocr = await ocrImageFromUrl(c.image);
            if (ocr) c.content = (c.content || '') + `\n\nPicture Content:\n${ocr}`;
          } catch (e) { console.warn('Reddit comment OCR failed', e); }
        }
      }));
    }

    return data;
  } catch (error) {
    console.error(error)
  }
}

export async function fetchTwitterPost(tweetId) {
  try {
    // Use backend proxy to fetch Twitter/X post to avoid exposing tokens in frontend
  const res = await axios.get(`${config.apiBackend}/pull/twitter/${tweetId}`);
    return res.data;
  } catch (error) {
    throw new Error(`Failed to fetch Twitter post: ${error.message}`);
  }
}

export async function fetchStackOverflowPost(questionId) {
  try {
    // ensure the shared ocr helper is available
    const questionRes = await axios.get(`https://api.stackexchange.com/2.3/questions/${questionId}`, {
      params: {
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
      }
    });

    const answersRes = await axios.get(`https://api.stackexchange.com/2.3/questions/${questionId}/answers`, {
      params: {
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
      }
    });

    const question = questionRes.data.items[0];

    // Helper: extract image URLs from HTML (from <img> tags and direct links)
    function extractImageUrls(html) {
      const urls = new Set();
      try {
        const doc = new DOMParser().parseFromString(html || '', 'text/html');
        const imgs = Array.from(doc.getElementsByTagName('img'));
        imgs.forEach(i => i.src && urls.add(i.src));
      } catch (e) {
        // DOMParser may not be available in some non-browser contexts
      }

      // Also find plain image URLs in the HTML/text
        const urlRegex = /(https?:\/\/[^\s"'<>]+?\.(?:png|jpe?g|gif|bmp|webp)(?:\?[^\s"'<>]*)?)/gi;
      let m;
      while ((m = urlRegex.exec(html || '')) !== null) {
        urls.add(m[1]);
      }

      return Array.from(urls);
    }

    // Helper: perform OCR with robust dynamic import/fallbacks
    let tesseractModule = null;
    try {
      tesseractModule = await import('tesseract.js');
    } catch (e) {
      console.warn('tesseract.js dynamic import failed:', e);
    }

    // ocrImage: try multiple ways to OCR depending on available API
    async function ocrImage(blob) {
      if (!tesseractModule) return null;

      // Preferred: createWorker API
      const createWorkerFn = tesseractModule.createWorker || (tesseractModule.default && tesseractModule.default.createWorker);
      if (createWorkerFn) {
        // Do not pass a function into the worker options (can't be cloned into Worker).
        // Some tesseract builds accept a boolean or object for logger; pass nothing here for safety.
        const worker = createWorkerFn();
        try {
          if (typeof worker.load === 'function') {
            await worker.load();
            if (typeof worker.loadLanguage === 'function') await worker.loadLanguage('eng');
            if (typeof worker.initialize === 'function') await worker.initialize('eng');
          }

          if (typeof worker.recognize === 'function') {
            const res = await worker.recognize(blob);
            const text = res?.data?.text || res?.text || '';
            await worker.terminate?.();
            return text;
          }
          // If worker has no recognize, fall through to fallback below
        } catch (err) {
          console.warn('Worker-based OCR failed:', err);
          try { await worker.terminate?.(); } catch (_) {}
        }
      }

      // Fallback: module.recognize
      try {
        const recognizeFn = tesseractModule.recognize || (tesseractModule.default && tesseractModule.default.recognize);
        if (typeof recognizeFn === 'function') {
          const res = await recognizeFn(blob, 'eng');
          return res?.data?.text || res?.text || '';
        }
      } catch (err) {
        console.warn('Module-level recognize failed:', err);
      }

      return null;
    }

    // Helper: perform OCR on image URLs and append results
    async function processHtmlWithOcr(html) {
      let text = htmlToText(html || '');
      const imageUrls = extractImageUrls(html);

      // Clean common StackOverflow artifacts and remove raw/bracketed image URLs
      try {
        // Remove the placeholder phrase that often appears: "enter image description here"
        text = text.replace(/enter image description here/gi, '');

        // Remove occurrences of the exact image URLs (both plain and bracketed forms)
        for (const u of imageUrls) {
          if (!u) continue;
          // remove plain occurrences
          text = text.split(u).join('');
          // remove bracketed occurrences like [https://...]
          const bracketed = new RegExp('\\\\[' + u.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&') + '\\\\]', 'g');
          text = text.replace(bracketed, '');
        }

        // Also remove any remaining bracketed image URLs (generic)
        text = text.replace(/\[https?:\/\/[^\]\s]+\]/gi, '');

        // Collapse excessive blank lines
        text = text.replace(/\n{3,}/g, '\n\n').trim();
      } catch (e) {
        console.warn('Text cleanup failed', e);
      }

      for (const url of imageUrls) {
        try {
          // fetch image as blob to avoid CORS/img tag issues in some cases
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
          const blob = await resp.blob();

          const ocrText = await ocrImage(blob);
          if (ocrText && ocrText.trim()) {
            text += `\n\nPicture Content:\n${ocrText.trim()}`;
          } else {
            // If OCR yielded nothing, include a small placeholder instead of the raw URL
            text += `\n\nPicture Content: (no readable text)`;
          }
        } catch (err) {
          // If OCR or fetch fails, fall back to a small placeholder
          console.warn('OCR failed for', url, err);
          text += `\n\nPicture Content: (unable to fetch image)`;
        }
      }

      return text;
    }

    const processedQuestionBody = await processHtmlWithOcr(question.body);

    // process answers in parallel with OCR
    const answers = await Promise.all(answersRes.data.items.map(async answer => {
      const processed = await processHtmlWithOcr(answer.body);
      return {
        author: answer.owner.display_name,
        content: processed
      };
    }));

    return {
      platform: 'Stack Overflow',
      url: question.link,
      content: {
        title: question.title,
        body: processedQuestionBody
      },
      comments: answers
    };
  } catch (error) {
    throw new Error(`Failed to fetch Stack Overflow post: ${error.message}`);
  }
}

export function parsePostUrl(url) {
  try {
    if (url.includes('facebook.com')) {
      return { type: 'facebook', url };
    } else if (url.includes('reddit.com')) {
      // Handle both old and new Reddit URLs, with or without additional parameters
      const match = url.match(/reddit\.com\/r\/([^\/]+)\/comments\/([^\/\?]+)/);
      if (match) {
        const subreddit = match[1];
        const postId = match[2].split('?')[0]; // Remove any query parameters
        console.log('Parsed Reddit URL:', { subreddit, postId });
        return { type: 'reddit', subreddit, postId };
      }
      return null;
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      const match = url.match(/\/status\/(\d+)/);
      return match ? { type: 'twitter', tweetId: match[1] } : null;
    } else if (url.includes('stackoverflow.com')) {
      const match = url.match(/questions\/(\d+)/);
      return match ? { type: 'stackoverflow', questionId: match[1] } : null;
    }
    return null;
  } catch (error) {
    return error;
  }
}

// --- Shared OCR helper (top-level) ---
let _tesseractModule = null;
async function ensureTesseract() {
  if (!_tesseractModule) {
    try { _tesseractModule = await import('tesseract.js'); } catch (e) { console.warn('tesseract dynamic import failed', e); }
  }
  return _tesseractModule;
}

async function ocrImageFromUrl(url) {
  try {
    const module = await ensureTesseract();
    if (!module) return null;
    // Try backend proxy first to avoid CORS problems
    const proxyUrl = `${config.apiBackend}/pull/image/proxy?url=${encodeURIComponent(url)}`;
    let resp = await fetch(proxyUrl);
    if (!resp.ok) {
      // fallback to direct fetch
      resp = await fetch(url);
    }
    if (!resp.ok) throw new Error(`Failed to fetch image ${resp.status}`);
    const blob = await resp.blob();

    // prefer worker if available
    const createWorkerFn = module.createWorker || (module.default && module.default.createWorker);
    if (createWorkerFn) {
      const worker = createWorkerFn();
      try {
        if (typeof worker.load === 'function') {
          await worker.load();
          if (typeof worker.loadLanguage === 'function') await worker.loadLanguage('eng');
          if (typeof worker.initialize === 'function') await worker.initialize('eng');
        }
        if (typeof worker.recognize === 'function') {
          const res = await worker.recognize(blob);
          const text = res?.data?.text || res?.text || '';
          await worker.terminate?.();
          return text.trim();
        }
      } catch (err) {
        try { await worker.terminate?.(); } catch (_) {}
        console.warn('worker ocr failed', err);
      }
    }

    const recognizeFn = module.recognize || (module.default && module.default.recognize);
    if (typeof recognizeFn === 'function') {
      const res = await recognizeFn(blob, 'eng');
      return (res?.data?.text || res?.text || '').trim();
    }
    return null;
  } catch (err) {
    console.warn('ocrImageFromUrl failed', err);
    return null;
  }
}