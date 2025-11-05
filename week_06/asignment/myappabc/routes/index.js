// SESSION_06
// var express = require('express');
// var router = express.Router();

// /* GET home page. */
// router.get('/', function (req, res, next) {
//   res.send(`<html>
//       <head>
//         <title>Index page</title>
//       </head>
//       <body>
//         <h1>Hello world</h1>
//         <p>Welcome to my website</p>
//       </body>
//     </html>`);
// });


// module.exports = router;
// SESSION_07
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/register', function(req, res, next) {
  const { username, email, password } = req.body;
  //return as json
  res.json({ 
    "username": username, 
    "email": email, 
    "password": password 
  });
});

module.exports = router;

