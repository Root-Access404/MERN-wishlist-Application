import { useState } from 'react';
import axios from 'axios';

function WishlistForm() {

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        link: '',
        remark: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                'http://localhost:5000/api/wishlist/add',
                formData
            );

            console.log(res.data);
            alert("Item Added");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <form
            className="wishlist-form"
            onSubmit={handleSubmit}
        >

            <input
                type="text"
                name="name"
                placeholder="Product Name"
                onChange={handleChange}
            />

            <input
                type="number"
                name="price"
                placeholder="Price"
                onChange={handleChange}
            />

            <input
                type="text"
                name="link"
                placeholder="Product Link"
                onChange={handleChange}
            />

            <input
                type="text"
                name="remark"
                placeholder="Remark"
                onChange={handleChange}
            />

            <button type="submit">
                Add Item
            </button>

        </form>
    );
}

export default WishlistForm;