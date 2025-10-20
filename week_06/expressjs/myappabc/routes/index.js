var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send(`<html>
      <head>
        <title>Index page</title>
      </head>
      <body>
        <h1>Hello world</h1>
        <p>Welcome to my website</p>
      </body>
    </html>`);
});


module.exports = router;

