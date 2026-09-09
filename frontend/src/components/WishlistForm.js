import { useState } from 'react';
import axios from 'axios';
import { getWishlistAddUrl } from '../config/api';

function WishlistForm() {

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        link: '',
        remark: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.name || !formData.price) {
                setError('Product name and price are required');
                setLoading(false);
                return;
            }

            const res = await axios.post(
                getWishlistAddUrl(),
                formData,
                {
                    timeout: 5000
                }
            );

            console.log('Item added:', res.data);
            alert("Item Added Successfully");
            
            // Reset form
            setFormData({
                name: '',
                price: '',
                link: '',
                remark: ''
            });
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'Failed to add item';
            console.error('Error adding item:', error);
            setError(errorMessage);
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="wishlist-form"
            onSubmit={handleSubmit}
        >

            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
            />

            <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                required
                min="0"
            />

            <input
                type="text"
                name="link"
                placeholder="Product Link"
                value={formData.link}
                onChange={handleChange}
                disabled={loading}
            />

            <input
                type="text"
                name="remark"
                placeholder="Remark"
                value={formData.remark}
                onChange={handleChange}
                disabled={loading}
            />

            <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Item'}
            </button>

        </form>
    );
}

export default WishlistForm;
