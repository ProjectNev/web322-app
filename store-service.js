const fs = require('fs');
const path = require('path');

let items = [];
let categories = [];

function initialize() {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                return reject('Unable to read items file');
            }
            try {
                items = JSON.parse(data);
            } catch (parseErr) {
                return reject('Error parsing items data');
            }

            
            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    return reject('Unable to read categories file');
                }
                try {
                    categories = JSON.parse(data);
                    resolve('Data successfully initialized');
                } catch (parseErr) {
                    reject('Error parsing categories data');
                }
            });
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject('No items found');
        } else {
            resolve(items);
        }
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            reject('No published items found');
        } else {
            resolve(publishedItems);
        }
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject('No categories found');
        } else {
            resolve(categories);
        }
    });
}

module.exports = {
    initialize,
    getAllItems,
    getPublishedItems,
    getCategories
};