const axios = require('axios');
const { htmlToText } = require('html-to-text');

async function getQuestionAnswersComments(questionId) {
  try {
    // ดึงคำถาม
    const questionRes = await axios.get(`https://api.stackexchange.com/2.3/questions/${questionId}`, {
      params: {
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
      }
    });

    const question = questionRes.data.items?.[0];
    if (!question) {
      console.error('No question data found.');
      return;
    }

    console.log('--- QUESTION ---');
    console.log('Title:', question.title);
    console.log('Body:', htmlToText(question.body, { wordwrap: 130 }));

    // ดึงคำตอบ
    const answersRes = await axios.get(`https://api.stackexchange.com/2.3/questions/${questionId}/answers`, {
      params: {
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
      }
    });

    console.log('--- ANSWERS ---');
    answersRes.data.items.forEach(answer => {
      console.log(`Author: ${answer.owner.display_name}`);
      console.log('Answer:');
      console.log(htmlToText(answer.body, { wordwrap: 130 }));
      console.log('---');
    });

    // ดึงคอมเมนต์ของคำถาม
    const commentsRes = await axios.get(`https://api.stackexchange.com/2.3/questions/${questionId}/comments`, {
      params: {
        order: 'desc',
        sort: 'creation',
        site: 'stackoverflow',
        filter: 'withbody'
      }
    });

    console.log('--- COMMENTS ---');
    commentsRes.data.items.forEach(comment => {
      console.log(`${comment.owner.display_name}: ${htmlToText(comment.body)}`);
    });

  } catch (error) {
    console.error(error);
  }
}

// ตัวอย่างใช้งาน
getQuestionAnswersComments(79771738);
// https://stackoverflow.com/questions/79771738/jupyter-notebook-shell-command-line-magic-failure-does-not-cause-cell-failure