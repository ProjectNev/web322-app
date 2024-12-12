/********************************************************************************* 

WEB322 – Assignment 05
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknowledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name: Nevan Sargeant
Student ID: 112175237
Date: 12/11/2024
Cyclic Web App URL: https://web322-bfb1tvyg4-projectnevs-projects.vercel.app (Doesn't work still...)
GitHub Repository URL: https://github.com/ProjectNev/web322-app

********************************************************************************/

const express = require("express");
const exphbs = require("express-handlebars");
const stripJs = require('strip-js');
const itemData = require("./store-service");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

const Handlebars = require('handlebars');

const handlebars = exphbs.create({
    extname: '.hbs',
    helpers: {
        safeHTML: function(context) {
            return new Handlebars.SafeString(stripJs(context));
        },
        navLink: function(url, options) {
            const className = app.locals.activeRoute === url ? 'active' : '';
            return new Handlebars.SafeString(`<a href="${url}" class="${className}">${options.fn(this)}</a>`);
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }
    }
});

app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

cloudinary.config({
    cloud_name: "dqnrcb8yd",
    api_key: "718317711282295",
    api_secret: "26UsMvHkeQulEh2IspFwd8yNmGc",
    secure: true,
});

const upload = multer(); // no { storage: storage }
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.redirect('/shop');
});

app.get("/about", (req, res) => {
    res.render("about");
});

app.get("/shop", async (req, res) => {
  // Declare an object to store properties for the view
  let viewData = {};

  try {
    // declare empty array to hold "item" objects
    let items = [];

    // if there's a "category" query, filter the returned items by category
    if (req.query.category) {
      // Obtain the published "item" by category
      items = await itemData.getPublishedItemsByCategory(req.query.category);
    } else {
      // Obtain the published "items"
      items = await itemData.getPublishedItems();
    }

    // sort the published items by itemDate
    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

    // get the latest item from the front of the list (element 0)
    let item = items[0];

    // store the "items" and "item" data in the viewData object (to be passed to the view)
    viewData.items = items;
    viewData.item = item;
  } catch (err) {
    viewData.message = "no results";
  }

  try {
    // Obtain the full list of "categories"
    let categories = await itemData.getCategories();

    // store the "categories" data in the viewData object (to be passed to the view)
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "no results";
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", { data: viewData });
});

app.get('/shop/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "item" objects
      let items = [];

      // if there's a "category" query, filter the returned items by category
      if(req.query.category){
          // Obtain the published "items" by category
          items = await itemData.getPublishedItemsByCategory(req.query.category);
      }else{
          // Obtain the published "items"
          items = await itemData.getPublishedItems();
      }

      // sort the published items by itemDate
      items.sort((a,b) => new Date(b.itemDate) - new Date(a.itemDate));

      // store the "items" and "item" data in the viewData object (to be passed to the view)
      viewData.items = items;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the item by "id"
      viewData.item = await itemData.getItemById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await itemData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "shop" view with all of the data (viewData)
  res.render("shop", {data: viewData})
});

app.get('/items', (req, res) => {
    itemData.getAllItems()
        .then(items => {
            if (items.length > 0) {
                res.render("items", { items: items });
            } else {
                res.render("items", { message: "No results found" });
            }
        })
        .catch(err => {
            res.render("items", { message: "Failed to retrieve items" });
        });
});

app.get("/items/add", async (req, res) => {
    try {
        const categories = await storeService.getCategories(); // Assuming your service is named storeService
        res.render("addItem", { categories });
    } catch (error) {
        res.render("addItem", { categories: [] });
    }
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
    const processItem = (imageUrl) => {
        req.body.featureImage = imageUrl;
        itemData.addItem(req.body)
            .then(() => res.redirect("/items"))
            .catch(err => res.status(500).send(err));
    };

    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) resolve(result);
                    else reject(error);
                });

                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        streamUpload(req).then((uploaded) => {
            processItem(uploaded.url);
        }).catch(err => {
            res.status(500).send("Failed to upload image: " + err.message);
        });
    } else {
        processItem("");
    }
});

app.get("/items/delete/:id", (req, res) => {
    itemData.deleteItemById(req.params.id)
        .then(() => res.redirect("/items"))
        .catch(err => res.status(500).send("Unable to remove item: " + err));
});

app.get("/categories", (req, res) => {
    itemData.getCategories()
        .then(categories => res.render("categories", { categories }))
        .catch(err => res.render("categories", { message: "Failed to retrieve categories: " + err.message }));
});

app.get("/categories/add", (req, res) => {
    res.render("addCategory");
});

app.post("/categories/add", (req, res) => {
    itemData.addCategory(req.body)
        .then(() => res.redirect("/categories"))
        .catch(err => res.status(500).send("Unable to add category: " + err.message));
});

app.get("/categories/delete/:id", (req, res) => {
    itemData.deleteCategoryById(req.params.id)
        .then(() => res.redirect("/categories"))
        .catch(err => res.status(500).send("Unable to remove category: " + err.message));
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).render('404');
});


itemData.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log(`Server is listening on port ${HTTP_PORT}`);
    });
}).catch(err => {
    console.error("Failed to start the server:", err);
});
