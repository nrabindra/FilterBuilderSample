const mongoose = require('mongoose');
const data_connect = require('../connectdb/dataConnect.js');
const Schema   = mongoose.Schema;

var cartSchema = new Schema({
  "_id": {type:String, default : '', trim : true},
  "customer":{
  	"id": {type:String, default : '', trim : true}
  },
  "lines": [{
  	"id":{type:String, default : '', trim : true},
  	"product_id":{type:String, default : '', trim : true},
  	"quantity": {type:Number, default : 0, trim : true}
  	}],
  "created_at" : { type : Date, default : '', trim : true },
  "updated_at": { type : Date, default : '', trim : true }

},{ collection: 'Cart'});
 
module.exports = data_connect.model('Cart', cartSchema);