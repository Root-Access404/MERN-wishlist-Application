import './App.css';

import WishlistForm from './components/WishlistForm';
import WishList from './components/WishList';

function App() {
  return (
    <div className="app">

      <h1 className="title">Wishlist App</h1>
      <h1 className="text-4xl font-bold text-blue-600">
  Tailwind Working
</h1>

      <WishlistForm />
      <WishList />

    </div>
  );
}

export default App;