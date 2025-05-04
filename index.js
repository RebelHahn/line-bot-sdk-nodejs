'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const app = express();

// 用妳自己的 Channel Access Token 和 Secret 替換這裡
const config = {
  channelAccessToken: '+bQPdv39CCq/8rB9o8M5FSv832k/ozSPOIMNapjv6YWsAUgiwpdYKfgtyCYeoyJRFSHcDSRjgu+FHXyDk4S1VZUVUEZrc13D6d5NYohtne/fCR9vsSPaWQ6Cx8zhGPHnxV9c22a9XdymDkUlS8sLtQdB04t89/1O/w1cDnyilFU=',
  channelSecret: 'e288b5e2dd7a128a4e965a0479651a73',
};

const client = new line.Client(config);

app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const messages = [
    '我不是機器人，我只是比較敷衍的朋友。',
    '蛤？你說什麼？我剛剛在放空。',
    '這麼勤勞還來密我，你好勇敢喔。',
    '幹嘛啦～我才不想理你呢。',
    '你怎麼那麼愛講話？我都累了。',
    '別鬧了，去吃個飯冷靜一下。',
    '你是不是太閒？需要我陪罵老闆嗎？',
    '我以為你不會來密我，感動一秒鐘好了。',
  "蛤？你說什麼我沒聽清楚，但我決定先生氣一下。",
  "今天沒做事，只有累。",
  "你是不是想被誇？那我先誇，誇張欸你怎麼這麼可愛？",
  "有吃飯嗎？沒有的話…那你再餓一下，減肥。",
  "人家都說愛要及時，但我只想睡覺。",
  "現在立刻馬上給我喝水，不然你會枯掉喔。",
  "不要再裝可憐了，我比你更可憐。",
  "你是想氣死我再繼承我所有可愛嗎？",
  ];

  const replyMessage = messages[Math.floor(Math.random() * messages.length)];

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyMessage,
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`幹話小葵已經上線，監聽在 port ${port}`);
});
