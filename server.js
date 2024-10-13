const express = require('express');
const path = require("path");
const app = express();
const storeService = require('./store-service');

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect('/about');
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
      .then((publishedItems) => {
        res.json(publishedItems); // Send the list of published items as JSON
      })
      .catch((err) => {
        res.status(500).json({ message: err }); // Send error message in the format { message: 'error' }
      });
});

app.get('/items', (req, res) => {
    storeService.getAllItems()
      .then((items) => {
        res.json(items); // Send all items as JSON
      })
      .catch((err) => {
        res.status(500).json({ message: err }); // Send error message in the format { message: 'error' }
      });
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
      .then((categories) => {
        res.json(categories); // Send all categories as JSON
      })
      .catch((err) => {
        res.status(500).json({ message: err }); // Send error message in the format { message: 'error' }
      });
});

app.use((req, res) => {
    res.status(404).send('Page Not Found');
});

storeService.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Express http server listening on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize data:', err);
});