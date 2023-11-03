// require packages
require('dotenv').config();
const express = require('express');
const app = express();
const mongo = require('mongodb')
const dns = require('dns')
const mongoose = require ('mongoose')
const cors = require('cors');
const bodyParser = require('body-parser');
const shortid = require('shortid');
const validUrl = require('valid-url');
const urlparser = require ('url');

// Basic Configuration
const port = process.env.PORT || 3000;
const urlDatabase = [];
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
// connect to db
const uri = process.env.MONGO_URI
mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
//  Schema and collection
const Schema = mongoose.Schema
const urlSchema = new Schema ({
  original_url:{type:String},
  short_url: {type:String}
})
const URL = mongoose.model("URL", urlSchema)
// Your first API endpoint

app.post("/api/shorturl/", async (req, res) => {
  const url = req.body.url;
  const urlCode = shortid.generate();
  const isInputUrlValid = validUrl.isWebUri(url);
  console.log("Request URL:", url);
  const validUrlRegex = /https:\/\/www.|http:\/\/www./g;
  if (!isInputUrlValid && !validUrlRegex.test(url)) {
    return res.status(400).json({ error: "invalid url" });
  }

  const hostname = urlparser.parse(url).hostname;

  dns.lookup(hostname, async (err, address) => {
    if (err) {
      res.status(401).json({ error: "invalid url" });
    } else {
      try {
        let foundShortUrl = await URL.findOne({ original_url: url });

        if (foundShortUrl) {
          res.json({
            original_url: foundShortUrl.original_url,
            short_url: foundShortUrl.short_url,
          });
        } else {
          foundShortUrl = new URL({
            original_url: url,
            short_url: urlCode,
          });
          await foundShortUrl.save();
          res.json({
            original_url: foundShortUrl.original_url,
            short_url: foundShortUrl.short_url,
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json("Server error");
      }
    }
  });
});

app.get('/api/shorturl/:short_url?', async  (req, res) => {
try {
const urlParams = await URL.findOne( {
short_url: req.params.short_url})
if (urlParams) {
return res.redirect(urlParams.original_url)}
else {
return res.status (404).json( 'No URL found' )}}
catch (err) {
console. loq(err)
res.status (500). json( 'Server error')}})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
