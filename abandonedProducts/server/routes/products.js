const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Customer = require('../models/customer.js');
const Product = require('../models/product.js');
const Store = require('../models/store.js');
const Cart = require('../models/cart.js');

router.get('/', (req, res)=>{
	res.render("../server/views/index")
});

router.get('/getAbandonedProducts',(req, res)=>{
	Cart.find({},(err, data)=>{//mongo call
		let products = getProductCount(data);//operation to get count of customers who abandoned products
		let productIDs = [];
		for(let key in products){
			productIDs.push(key);//creating array of product IDs
		}
		getObjectByID(Product, productIDs).then((objects)=>{
			res.send(mapObjectsToData(objects, products));//Adding product meta data to product count before sending			
		}).catch((err)=>{
			console.log(err);
		});	
		});
	});

router.post('/getCustomers', (req, res)=>{
	getObjectByID(Customer, req.body.ids).then((objects)=>{
		res.send(objects);
	});
});
module.exports = router;

function getProductCount(data){

	let products = {};
	let formattedProducts = [];
	for (let i=0; i<data.length; i++){
		let currentCart = data[i];
		let currentCustomer = currentCart.customer.id;

		for(let j=0;j<currentCart.lines.length;j++){
			let currentLine = currentCart.lines[j];
			let currentProduct = currentLine.product_id;
			if (!products[currentProduct]) {
				products[currentProduct] = [currentCustomer];
			}
			else if(products[currentProduct].indexOf(currentCustomer)<0){
				products[currentProduct].push(currentCustomer);
			}
		}
	}

	return products;
}

function getObjectByID(object,data){
	return new Promise((resolve, reject)=>{
		object.find({_id:{$in: data}},(err, objects)=>{
			if(err){
				reject(err);
			}
			if(objects){
				resolve(objects);
			}
		});
	});
}

function mapObjectsToData(objects, data){
	let mappedData = [];
	
	for(let i=0;i<objects.length;i++){
		if(data[objects[i]._id]){
			let object =  {};
			object.id = objects[i]._id;
			object.data = objects[i];
			object.info = data[objects[i]._id];
			mappedData.push(object);
		}
	}
	console.log(mappedData);
	return mappedData;
}