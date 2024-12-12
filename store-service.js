const Sequelize = require('sequelize');

// Initialize the connection to your database
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'tB09JVFmyeuh', {
    host: 'ep-floral-fire-a5wdi1pj.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define the Item model
const Item = sequelize.define('Item', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    itemDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN,
    price: Sequelize.DOUBLE
});

// Define the Category model
const Category = sequelize.define('Category', {
    category: Sequelize.STRING
});

// Define the relationship between Item and Category
Item.belongsTo(Category, {foreignKey: 'category'});

function initialize() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            resolve();
        }).catch(err => {
            reject("unable to sync the database");
        });
    });
}

function getAllItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({
            include: [Category]
        }).then(items => {
            resolve(items);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

function getItemsByCategory(categoryId) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { categoryId: categoryId },
            include: [Category]
        }).then(items => {
            resolve(items);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

function getItemsByMinDate(minDateStr) {
    return new Promise((resolve, reject) => {
        const { gte } = Sequelize.Op;
        Item.findAll({
            where: {
                itemDate: {
                    [gte]: new Date(minDateStr)
                }
            }
        }).then(items => {
            resolve(items);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

function getItemById(id) {
    return new Promise((resolve, reject) => {
        Item.findByPk(id, {
            include: [Category]
        }).then(item => {
            if (item) {
                resolve(item);
            } else {
                reject("no results returned");
            }
        }).catch(err => {
            reject("no results returned");
        });
    });
}

function addItem(itemData) {
    return new Promise((resolve, reject) => {
        itemData.published = itemData.published ? true : false;
        for (let key in itemData) {
            if (itemData[key] === "") {
                itemData[key] = null;
            }
        }
        itemData.itemDate = new Date();
        Item.create(itemData).then(item => {
            resolve(item);
        }).catch(err => {
            reject("unable to create item");
        });
    });
}

function getPublishedItems() {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: { published: true },
            include: [Category]
        }).then(items => {
            resolve(items);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

function getPublishedItemsByCategory(categoryId) {
    return new Promise((resolve, reject) => {
        Item.findAll({
            where: {
                categoryId: categoryId,
                published: true
            },
            include: [Category]
        }).then(items => {
            resolve(items);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

function getCategories() {
    return new Promise((resolve, reject) => {
        Category.findAll().then(categories => {
            resolve(categories);
        }).catch(err => {
            reject("no results returned");
        });
    });
}

function addCategory(categoryData) {
    return new Promise((resolve, reject) => {
        for (let key in categoryData) {
            if (categoryData[key] === "") {
                categoryData[key] = null;
            }
        }
        Category.create(categoryData)
            .then(category => resolve(category))
            .catch(err => reject("unable to create category"));
    });
}

// Delete a category by ID
function deleteCategoryById(id) {
    return new Promise((resolve, reject) => {
        Category.destroy({
            where: { id: id }
        })
        .then(() => resolve())
        .catch(err => reject("unable to delete category"));
    });
}

// Delete an item by ID
function deleteItemById(id) {
    return new Promise((resolve, reject) => {
        Item.destroy({
            where: { id: id }
        })
        .then(deleted => {
            if (deleted) resolve();
            else reject("Item not found");
        })
        .catch(err => reject("Unable to delete item"));
    });
}


// Export all functions to be used in other parts of the application
module.exports = {
    initialize,
    getItemById,
    getAllItems,
    getPublishedItems,
    getCategories,
    addItem,
    getItemsByCategory,
    getPublishedItemsByCategory,
    getItemsByMinDate,
    addCategory,
    deleteCategoryById,
    deleteItemById
};
