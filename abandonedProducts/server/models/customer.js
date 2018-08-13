const mongoose = require('mongoose');
const data_connect = require('../connectdb/dataConnect.js');
const Schema   = mongoose.Schema;

var customerSchema = new Schema({
  "_id": {type:String, default : '', trim : true},
  "first_name": {type:String, default : '', trim : true},
  "last_name": {type:String, default : '', trim : true},
  "email_address": {type:String, default : '', trim : true},
  "opt_in_status": {type:Boolean, default : false, trim : true},
  "company": {type:String, default : '', trim : true},
  "orders_count": {type:Number, default : 0, trim : true}
},{ collection: 'Customer'});
 
module.exports = data_connect.model('Customer', customerSchema);