const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const Wishlist = require('../models/Wishlist');

// Validation middleware
const validateWishlistData = (req, res, next) => {
    const { name, price } = req.body;
    
    if (!name || !price) {
        logger.warn('Validation failed: Missing required fields', JSON.stringify(req.body));
        return res.status(400).json({ error: 'Name and price are required' });
    }
    
    if (typeof price !== 'number' || price < 0) {
        logger.warn('Validation failed: Invalid price', price);
        return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    next();
};

// CREATE
router.post('/add', validateWishlistData, async (req, res) => {
    try {
        logger.info('Creating new wishlist item', JSON.stringify(req.body));
        const item = await Wishlist.create(req.body);
        logger.info('Wishlist item created', item._id);
        res.status(201).json(item);
    } catch (error) {
        logger.error('Error creating item:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// READ
router.get('/', async (req, res) => {
    try {
        logger.info('Fetching all wishlist items');
        const items = await Wishlist.find();
        logger.info(`Fetched ${items.length} items`);
        res.json(items);
    } catch (error) {
        logger.error('Error fetching items:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE
router.put('/:id', validateWishlistData, async (req, res) => {
    try {
        logger.info(`Updating wishlist item: ${req.params.id}`);
        
        const updatedItem = await Wishlist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedItem) {
            logger.warn(`Item not found: ${req.params.id}`);
            return res.status(404).json({ error: 'Item not found' });
        }

        logger.info(`Item updated: ${req.params.id}`);
        res.json(updatedItem);

    } catch (error) {
        logger.error('Error updating item:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        logger.info(`Deleting wishlist item: ${req.params.id}`);
        
        const deletedItem = await Wishlist.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            logger.warn(`Item not found for deletion: ${req.params.id}`);
            return res.status(404).json({ error: 'Item not found' });
        }

        logger.info(`Item deleted: ${req.params.id}`);
        res.json({ message: 'Item deleted successfully' });

    } catch (error) {
        logger.error('Error deleting item:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
