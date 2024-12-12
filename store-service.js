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
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false; // Ensure published field is set
        itemData.id = items.length + 1; // Assign a new ID
        
        // Set the current date in YYYY-MM-DD format
        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        itemData.postDate = formattedDate; // Adding the date to the item data
        
        items.push(itemData); // Add the new item to the items array
        resolve(itemData); // Resolve the promise with the new item
    });
};

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

module.exports.getPublishedItemsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        let filteredItems = items.filter(item => item.published && item.category == category);
        if (filteredItems.length > 0) {
            resolve(filteredItems);
        } else {
            reject("No published items found in this category");
        }
    });
};