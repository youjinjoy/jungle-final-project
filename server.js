/*********************/
/* mongoDB */

const mongoose = require('mongoose');
const os = require('os');

mongoose.connect('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/* modeling */
const Schema = mongoose.Schema;

const highlightInfoSchema = new Schema({
  text: String,
  startContainer: Schema.Types.Mixed,
  startOffset: Number,
  endContainer: Schema.Types.Mixed,
  endOffset: Number
});

const highlightSchema = new Schema({
  highlightInfos: [highlightInfoSchema] 
});

const htmlContentSchema = new Schema({
  html: String
});

const Highlight = mongoose.model('Highlights', highlightSchema);
const HtmlContent = mongoose.model('HtmlContent', htmlContentSchema);

/*********************/

// const morgan = require('morgan')
const express = require('express')
const app = express()
const port = 3030
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/api/save-highlight', (req, res) => {
  const newHighlight = new Highlight(req.body);
  newHighlight.save().then(() => res.send('Highlight saved'));
  // console.log("/api/save-highlight post test",savedData);
});

app.post('/api/delete-highlight', (req, res) => {
  // find one by id and delete
  console.log(req.body._id);
  // Highlight.findOneAndDelete({ _id: req.body._id }).then(() => res.send('Highlight deleted'));


  // newHighlight.delete().then(() => res.send('Highlight deleted'));
  // console.log("/api/delete-highlight post test",savedData);
});

app.get('/api/save-highlight', (req, res) => {
  Highlight.find().then(highlights => res.json(highlights));
});

app.get('/api/find-highlights', async (req, res) => {
  try {
    const highlights = await Highlight.find(); // 'Highlight'는 Mongoose 모델
    res.json(highlights);
    // console.log("*** /api/find-highlights get test",highlights);
  } catch (error) {
    res.status(500).send('Error fetching highlights');
  }
});

app.post('/api/find-one-highlight', async (req, res) => {
  try {
    const highlightId = req.body.id;
    const highlight = await Highlight.findById(highlightId); // Highlight는 모델
    if (highlight) {
      res.json(highlight); // 하이라이트를 찾았다면 JSON으로 반환
    } else {
      res.status(404).send('Highlight not found');
    }
  } catch (error) {
    res.status(500).send('Error occurred: ' + error.message);
  }
});

// 예시: 'Highlight' 모델의 모든 문서를 삭제하는 API
app.post('/api/delete-highlights', async (req, res) => {
  try {
    await Highlight.deleteMany({}); // 모든 하이라이트 삭제
    res.status(200).send('All highlights deleted');
  } catch (error) {
    res.status(500).send('Error occurred: ' + error.message);
  }
});

app.post('/api/delete-one-highlight', async (req, res) => {
  try {
    // console.log(req.body.id);
    await Highlight.deleteOne({ _id: req.body.id });
    res.status(200).send('Highlight deleted');
  } catch (error) {
    res.status(500).send('Error occurred: ' + error.message);
  }
});

/* text */
app.post('/api/save-text', async (req, res) => {
  try {
    const { html } = req.body;
    // DB에 html 저장 로직
    const newHtmlContent = new HtmlContent({ html });
    await newHtmlContent.save();
    res.status(200).send('내용 저장 성공');
  } catch (error) {
    res.status(500).send('Error occurred: ' + error.message);
  }
});

app.get('/api/get-text', async (req, res) => {
  try {
    // DB에서 html 데이터 가져오기
    const htmlContent = await HtmlContent.findOne({}).sort({ _id: -1 }); // 가장 최근에 저장된 내용 가져오기
    res.json({ html: htmlContent });
  } catch (error) {
    res.status(500).send('Error occurred: ' + error.message);
  }
});

function getLocalExternalIp() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (const alias of iface) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address;
      }
    }
  }
  return "0.0.0.0";
}

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log(`http://localhost:${port}`);
  console.log(`http://${getLocalExternalIp()}:${port}`);
})

