const mongoose = require('mongoose');
const data_connect = require('../connectdb/dataConnect.js');
const Schema = mongoose.Schema;

var productSchema = new Schema({
  "_id": {type:String, default : '', trim : true},
  "title": {type:String, default : '', trim : true},
  "handle": {type:String, default : '', trim : true},
  "description": {type:String, default : '', trim : true},
  "type": {type:String, default : '', trim : true},
  "vendor": {type:String, default : '', trim : true}
},{ collection: 'Product'});
 
module.exports = data_connect.model('Product', productSchema);