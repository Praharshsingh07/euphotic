const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./dishes.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the dishes database.');
});

// Create dishes table if not exists
db.run(`CREATE TABLE IF NOT EXISTS dishes (
  dishId INTEGER PRIMARY KEY AUTOINCREMENT,
  dishName TEXT NOT NULL,
  imageUrl TEXT NOT NULL,
  isPublished INTEGER DEFAULT 0
)`);

// Populate the database with initial data if it's empty
db.get("SELECT COUNT(*) as count FROM dishes", [], (err, row) => {
  if (err) {
    console.error(err.message);
  } else if (row.count === 0) {
    const initialDishes = [
      { dishName: 'Jeera Rice', imageUrl: 'https://nosh-assignment.s3.ap-south-1.amazonaws.com/jeera-rice.jpg', isPublished: 1 },
      { dishName: 'Paneer Tikka', imageUrl: 'https://nosh-assignment.s3.ap-south-1.amazonaws.com/paneer-tikka.jpg', isPublished: 1 },
      { dishName: 'Rabdi', imageUrl: 'https://nosh-assignment.s3.ap-south-1.amazonaws.com/rabdi.jpg', isPublished: 1 },
      { dishName: 'Chicken Biryani', imageUrl: 'https://nosh-assignment.s3.ap-south-1.amazonaws.com/chicken-biryani.jpg', isPublished: 1 },
      { dishName: 'Alfredo Pasta', imageUrl: 'https://nosh-assignment.s3.ap-south-1.amazonaws.com/alfredo-pasta.jpg', isPublished: 1 }
    ];

    const stmt = db.prepare("INSERT INTO dishes (dishName, imageUrl, isPublished) VALUES (?, ?, ?)");
    initialDishes.forEach(dish => {
      stmt.run(dish.dishName, dish.imageUrl, dish.isPublished);
    });
    stmt.finalize();
    console.log('Initial data inserted.');
  }
});

// GET all dishes
app.get('/dishes', (req, res) => {
  db.all("SELECT * FROM dishes", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows.map(row => ({...row, isPublished: Boolean(row.isPublished)})));
  });
});

// POST toggle publish status
app.post('/toggle-publish/:id', (req, res) => {
  const id = req.params.id;
  db.run("UPDATE dishes SET isPublished = NOT isPublished WHERE dishId = ?", id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: `Dish ${id} updated successfully`, changes: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});