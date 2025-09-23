const puppeteer = require('puppeteer');

async function scrapeFacebookPost(postUrl, email, password) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // เข้า Facebook login
  await page.goto('https://www.facebook.com/login');
  await page.type('#email', email, { delay: 50 });
  await page.type('#pass', password, { delay: 50 });
  await page.click('button[name="login"]');
  await page.waitForNavigation();

  // เข้าโพสต์
  await page.goto(postUrl, { waitUntil: 'networkidle2' });

  // ดึงข้อความโพสต์
  const postText = await page.evaluate(() => {
    const post = document.querySelector('[data-ad-preview="message"]');
    return post ? post.innerText : null;
  });

  console.log('Post:', postText);

  // ดึงคอมเมนต์ (ตัวอย่างดึง comment แรก ๆ)
  const comments = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[aria-label="Comment"]'))
      .map(c => c.innerText);
  });

  console.log('Comments:', comments);

  await browser.close();
}

// ตัวอย่างใช้งาน
scrapeFacebookPost(
  'https://www.facebook.com/bbcnews/posts/pfbid02ir4k7dZyDYzMwHopxvET6hSnCHjyy9wdBDRdgvvZPEw2Tr2VCs97feWGmWVi7hFel',
  'hellosairahus@gmail.com',
  'P_oonnawit1'
);
