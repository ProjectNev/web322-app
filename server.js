/********************************************************************************* 

WEB322 – Assignment 04
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
        // Define the navLink helper
        navLink: function(url, options) {
            const className = app.locals.activeRoute === url ? 'active' : '';
            return new Handlebars.SafeString(`<a href="${url}" class="${className}">${options.fn(this)}</a>`);
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
app.use(express.static("public"));

// Middleware to handle the active route
app.use((req, res, next) => {
  // Set the activeRoute in the app.locals for global access by templates
  app.locals.activeRoute = req.path;
  next();
});

// Define your routes here
app.get('/', (req, res) => {
  res.redirect('/shop'); // Redirecting to the shop
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
      .then(data => {
          if(data.length > 0) {
              res.render("items", {items: data});
          } else {
              res.render("items", {message: "No results found"});
          }
      })
      .catch(err => {
          res.render("items", {message: "Failed to retrieve items"});
      });
});

app.get("/items/add", (req, res) => {
  res.render("addItem");
});

app.post("/items/add", upload.single("featureImage"), (req, res) => {
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            console.log(result);
            return result;
        }
        upload(req).then((uploaded) => {
            processItem(uploaded.url);
        });
    } else {
        processItem("");
    }

    function processItem(imageUrl) {
        req.body.featureImage = imageUrl;

        itemData
            .addItem(req.body)
            .then((post) => {
                res.redirect("/items");
            })
            .catch((err) => {
                res.status(500).send(err);
            });
    }
});

app.get('/item/:id', (req,res) => {
    itemData.getItemById(req.params.id).then(data => {
        res.json(data);
    }).catch(err => {
        res.json({message: err});
    });
});

app.get("/categories", (req, res) => {
  itemData.getCategories()
      .then(data => {
          if (data.length > 0) {
              res.render("categories", {categories: data});
          } else {
              res.render("categories", {message: "No results found"});
          }
      })
      .catch(err => {
          res.render("categories", {message: "Failed to retrieve categories"});
      });
});

app.get('/category/:category', (req, res) => {
  let category = req.params.category;
  storeService.getPublishedItemsByCategory(category)
      .then(items => {
          res.render('categoryView', {
              items: items.map(item => {
                  item.description = handlebars.helpers.safeHTML(item.description);
                  return item;
              })
          });
      })
      .catch(err => {
          res.render('error', {message: err});
      });
});

app.use((req, res) => {
    res.status(404).send("404 - Page Not Found");
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
