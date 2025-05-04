const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const CHANNEL_ACCESS_TOKEN = '你的 Channel access token 放這裡';

const replies = [
  "蛤？你說什麼我沒聽清楚，但我決定先生氣一下。",
  "今天沒做事，只有累。",
  "你是不是想被誇？那我先誇，誇張欸你怎麼這麼可愛？",
  "有吃飯嗎？沒有的話…那你再餓一下，減肥。",
  "人家都說愛要及時，但我只想睡覺。",
  "現在立刻馬上給我喝水，不然你會枯掉喔。",
  "不要再裝可憐了，我比你更可憐。",
  "你是想氣死我再繼承我所有可愛嗎？"
];

app.post('/webhook', async (req, res) => {
  const events = req.body.events;

  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const replyText = replies[Math.floor(Math.random() * replies.length)];

      await axios.post('https://api.line.me/v2/bot/message/reply', {
        replyToken: event.replyToken,
        messages: [{ type: 'text', text: replyText }]
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Bearer ${CHANNEL_ACCESS_TOKEN}
        }
      });
    }
  }

  res.sendStatus(200);
});

app.get('/', (req, res) => {
  res.send('小葵在這裡耍廢～');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`小葵機器人正在偷懶中 port ${port}`);
});
