const mongoose = require('mongoose');

	const mongoURI = 'mongodb://127.0.0.1:27017/MailChimpDemo';

module.exports = data_connect = mongoose.createConnection(mongoURI,{ useNewUrlParser: true } );

data_connect.on('connected', function() {  
  console.log('Mongoose connected to DB');
});
