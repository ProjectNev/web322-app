const fs = require("fs");

let items = [];
let categories = [];

module.exports.initialize = function () {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/items.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                items = JSON.parse(data);

                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        categories = JSON.parse(data);
                        resolve();
                    }
                });
            }
        });
    });
}


module.exports.getItemById = function(id){
    return new Promise((resolve,reject)=>{
        let foundItem = items.find(item => item.id == id);

        if(foundItem){
            resolve(foundItem);
        }else{
            reject("no result returned");
        }
    });
}

module.exports.getAllItems = function(){
    return new Promise((resolve,reject)=>{
        (items.length > 0 ) ? resolve(items) : reject("no results returned"); 
    });
}

module.exports.getPublishedItems = function(){
    return new Promise((resolve, reject) => {
        let publishedItems = items.filter(item => item.published);  // Corrected filter condition
        if (publishedItems.length > 0) {
            resolve(publishedItems);
        } else {
            reject("no results returned");
        }
    });
}


module.exports.getCategories = function(){
    return new Promise((resolve,reject)=>{
        (categories.length > 0 ) ? resolve(categories) : reject("no results returned"); 
    });
}

module.exports.addItem = function(itemData){
    return new Promise((resolve,reject)=>{
        itemData.published = itemData.published ? true : false;
        itemData.id = items.length + 1;
        items.push(itemData);
        resolve();
    });
}

module.exports.getItemsByCategory = function(category){
    return new Promise((resolve,reject)=>{
        let filteredItems = items.filter(post=>post.category == category);

        if(filteredItems.length == 0){
            reject("no results returned")
        }else{
            resolve(filteredItems);
        }
    });
}

module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(post => (new Date(post.postDate)) >= (new Date(minDateStr)))

        if (filteredItems.length == 0) {
            reject("no results returned")
        } else {
            resolve(filteredItems);
        }
    });
}