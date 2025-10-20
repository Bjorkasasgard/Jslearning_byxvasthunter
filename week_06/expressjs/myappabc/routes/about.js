var express = require('express');
var router = express.Router();

/* GET about page. */
router.get('/', function(req, res, next) { // Rute ini akan diakses melalui '/about'
  res.send(`
       <html>
      <head>
        <title>About profile</title>
      </head>
      <body>
        <h1>About Profile</h1>
        <p>Welcome to my website</p> 
      </body>
    </html>`); // Mengubah teks respons agar berbeda
});


module.exports = router;
