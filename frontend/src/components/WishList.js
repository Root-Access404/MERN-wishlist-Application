import { useEffect, useState } from 'react';
import axios from 'axios';

function WishList() {

    const [items, setItems] = useState([]);
    const [editItem, setEditItem] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/wishlist');
            setItems(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const deleteItem = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/wishlist/${id}`);
            fetchItems();
        } catch (error) {
            console.log(error);
        }
    };

    const updateItem = async () => {
        try {
            await axios.put(
                `http://localhost:5000/api/wishlist/${editItem._id}`,
                {
                    name: editItem.name,
                    price: editItem.price,
                    remark: editItem.remark
                }
            );

            setEditItem(null);
            fetchItems();

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>

            <h2 className="subtitle">Wishlist Items</h2>

            {/* ITEMS LIST */}
            {items.map((item) => (
                <div className="card" key={item._id}>

                    <h3>{item.name}</h3>

                    <p>Price: ₹{item.price}</p>

                    <p>{item.remark}</p>

                    <div className="btn-group">

                        <button
                            className="edit-btn"
                            onClick={() => setEditItem(item)}
                        >
                            Edit
                        </button>

                        <button
                            className="delete-btn"
                            onClick={() => deleteItem(item._id)}
                        >
                            Delete
                        </button>

                    </div>
                </div>
            ))}

            {/* EDIT UI (MODAL STYLE) */}
            {editItem && (
                <div className="card">

                    <h3>Edit Item</h3>

                    <input
                        placeholder="Name"
                        value={editItem.name}
                        onChange={(e) =>
                            setEditItem({ ...editItem, name: e.target.value })
                        }
                    />

                    <input
                        placeholder="Price"
                        value={editItem.price}
                        onChange={(e) =>
                            setEditItem({ ...editItem, price: e.target.value })
                        }
                    />

                    <input
                        placeholder="Remark"
                        value={editItem.remark}
                        onChange={(e) =>
                            setEditItem({ ...editItem, remark: e.target.value })
                        }
                    />

                    <div className="btn-group">

                        <button className="edit-btn" onClick={updateItem}>
                            Update
                        </button>

                        <button
                            className="delete-btn"
                            onClick={() => setEditItem(null)}
                        >
                            Cancel
                        </button>

                    </div>

                </div>
            )}

        </div>
    );
}

export default WishList;