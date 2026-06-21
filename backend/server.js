const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/wishlist', wishlistRoutes);

app.get('/', (req, res) => {
    res.send('Wishlist API Running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});