const mongoose = require('mongoose');
const data_connect = require('../connectdb/dataConnect.js');
const Schema = mongoose.Schema;

var storeSchema = new Schema({
  "_id": {type:String, default : '', trim : true},
  "list_id": {type:String, default : '', trim : true},
  "name": {type:String, default : '', trim : true},
  "domain": {type:String, default : '', trim : true},
  "email_address": {type:String, default : '', trim : true}
},{ collection: 'Store'});
 
module.exports = data_connect.model('Store', storeSchema);