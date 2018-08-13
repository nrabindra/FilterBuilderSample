const express = require('express')
const app = express()
const all = require('./server/routes/products.js');
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json({ limit: "50mb"}));
app.use('/', all);

app.listen(3000, () => console.log('App is up on port 3000'));