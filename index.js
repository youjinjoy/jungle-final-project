const express = require('express')
const app = express()
const port = 3030
const path = require('path')

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index')
})

// app.get('/api/save-highlight', (req, res) => {
//   const highlightData = req.body;
//   // 데이터베이스에 저장하는 로직
//   // 예: MongoDB를 사용하는 경우
//   // saveHighlightToDatabase(highlightData);
//   res.status(200).send('Highlight Saved Page');
// });

// app.post('/api/save-highlight', (req, res) => {
//   const highlightData = req.body;
//   // 데이터베이스에 저장하는 로직
//   // 예: MongoDB를 사용하는 경우
//   // saveHighlightToDatabase(highlightData);
//   res.status(200).send('Highlight saved');
// });

app.get('/api/save-highlight', (req, res) => {
  res.send(req.body);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})