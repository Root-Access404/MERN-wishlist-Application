const express = require('express');
const router = express.Router();

const Wishlist = require('../models/Wishlist');

// CREATE
router.post('/add', async (req, res) => {
    try {
        const item = await Wishlist.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// READ
router.get('/', async (req, res) => {
    try {
        const items = await Wishlist.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// DELETE
router.delete('/:id', async (req, res) => {
    try {

        await Wishlist.findByIdAndDelete(req.params.id);

        res.json({
            message: 'Item deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {

        const updatedItem = await Wishlist.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedItem);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});


module.exports = router;