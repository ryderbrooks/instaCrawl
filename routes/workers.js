var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/data', function(req, res, next) {
    res.send('respond with a resource');
});

router.post("/stopConsuming", function(req, res, next) {

});

router.post("/startConsuming", function(req, res, next) {

});

module.exports = router;
