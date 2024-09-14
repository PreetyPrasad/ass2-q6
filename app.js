const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const Category = require('./models/category');
const products
const Product = require('./models/product');

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/shop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Setup EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Routes

// Home page: List categories and products
app.get('/', async (req, res) => {
    const categories = await Category.find();
    const products = await Product.find().populate('category');
    res.render('index', { categories, products });
});

// Category Routes

// GET: List all categories
app.get('/categories', async (req, res) => {
    const categories = await Category.find();
    res.render('category', { categories });
});

// POST: Add a new category
app.post('/categories', async (req, res) => {
    const { name } = req.body;
    await Category.create({ name });
    res.redirect('/categories');
});

// DELETE: Delete a category
app.post('/categories/delete/:id', async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
});

// Product Routes

// GET: List all products
app.get('/products', async (req, res) => {
    const products = await Product.find().populate('category');
    res.render('product', { products });
});

// GET: Form to add a product
app.get('/products/add', async (req, res) => {
    const categories = await Category.find();
    res.render('add-product', { categories });
});

// POST: Add a new product
app.post('/products', upload.array('images'), async (req, res) => {
    const { name, category, price } = req.body;
    const images = req.files.map(file => file.path); // Store paths of uploaded images
    await Product.create({ name, category, price, images });
    res.redirect('/products');
});

// GET: Form to edit a product
app.get('/products/edit/:id', async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    const categories = await Category.find();
    res.render('edit-product', { product, categories });
});

// POST: Update a product
app.post('/products/edit/:id', upload.array('images'), async (req, res) => {
    const { name, category, price } = req.body;
    const images = req.files.map(file => file.path); // Store paths of uploaded images
    await Product.findByIdAndUpdate(req.params.id, { name, category, price, images });
    res.redirect('/products');
});

// POST: Delete a product
app.post('/products/delete/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/products');
});

// Start the server
const PORT = 7000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
