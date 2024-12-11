/********************************************************************************* 

WEB322 – Assignment 03
I declare that this assignment is my own work in accordance with Seneca
Academic Policy.  No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students. I acknoledge that violation of this policy
to any degree results in a ZERO for this assignment and possible failure of
the course. 

Name:   
Student ID:   
Date:  
Cyclic Web App URL:  
GitHub Repository URL:  

********************************************************************************/

const express = require("express");
const itemData = require("./store-service");
const path = require("path");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");


cloudinary.config({
  cloud_name: "",
  api_key: "",
  api_secret: "",
  secure: true,
});

const upload = multer(); // no { storage: storage }
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect("/about");
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/shop", (req, res) => {
  itemData.getPublishedItems()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      res.status(500).json({ message: err.message });
    });
});

app.get('/items', (req,res)=>
{
    let queryPromise = null;
    if(req.query.category){
        queryPromise = itemData.getItemsByCategory(req.query.category);
    }else if(req.query.minDate){
        queryPromise = itemData.getItemsByMinDate(req.query.minDate);
    }else{
        queryPromise = itemData.getAllItems()
    } 
    queryPromise.then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    })
});

app.get("/items/add", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/addItem.html"));
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

app.get('/item/:id', (req,res)=>{
    itemData.getItemById(req.params.id).then(data=>{
        res.json(data);
    }).catch(err=>{
        res.json({message: err});
    });
});

app.get("/categories", (req, res) => {
    itemData
    .getCategories()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({ message: err });
    });
});

app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

itemData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening/running on: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
