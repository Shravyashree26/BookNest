import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [customerName, setCustomerName] = useState('Rahul');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    title: '',
    author: '',
    price: '',
    stock: ''
  });

  const loadBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) throw new Error('Unable to load books');
      setBooks(await response.json());
    } catch (error) {
      setMessage(error.message);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Unable to load orders');
      setOrders(await response.json());
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadBooks();
    loadOrders();
  }, []);

  const addBook = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock)
        })
      });

      if (!response.ok) throw new Error('Book creation failed');

      setForm({ title: '', author: '', price: '', stock: '' });
      setMessage('Book added successfully');
      loadBooks();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const placeOrder = async (book) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: book.id,
          customerName,
          quantity: 1,
          totalPrice: Number(book.price)
        })
      });

      if (!response.ok) throw new Error('Order placement failed');

      setMessage('Order placed successfully');
      loadOrders();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author}`.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header>
        <h1>📚 BookNest</h1>
        <p>Your online bookstore</p>
      </header>

      <main>
        {message && <div className="message">{message}</div>}

        <section className="search">
          <h2>Explore Books</h2>
          <input
            placeholder="Search books or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </section>

        <section className="books">
          {filteredBooks.map((book) => (
            <article className="book-card" key={book.id}>
              <div className="book-icon">📖</div>
              <h3>{book.title}</h3>
              <p>By {book.author}</p>
              <h3>₹{book.price}</h3>
              <p>Available stock: {book.stock}</p>
              <button
                disabled={book.stock < 1 || !customerName.trim()}
                onClick={() => placeOrder(book)}
              >
                Place Order
              </button>
            </article>
          ))}
          {filteredBooks.length === 0 && <p>No books found.</p>}
        </section>

        <section className="add-book">
          <h2>Add New Book</h2>
          <form onSubmit={addBook}>
            <input
              placeholder="Book title"
              required
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
            <input
              placeholder="Author"
              required
              value={form.author}
              onChange={(e) => setForm({...form, author: e.target.value})}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              required
              value={form.price}
              onChange={(e) => setForm({...form, price: e.target.value})}
            />
            <input
              type="number"
              min="0"
              placeholder="Stock"
              required
              value={form.stock}
              onChange={(e) => setForm({...form, stock: e.target.value})}
            />
            <button type="submit">Add Book</button>
          </form>
        </section>

        <section className="orders">
          <h2>Recent Orders</h2>
          {orders.map((order) => (
            <div className="order-row" key={order.id}>
              <span>Order #{order.id}</span>
              <span>{order.customerName}</span>
              <span>Book ID: {order.bookId}</span>
              <span>₹{order.totalPrice}</span>
              <strong>{order.status}</strong>
            </div>
          ))}
        </section>
      </main>

      <footer>BookNest – Powered by Spring Boot and React</footer>
    </div>
  );
}

export default App;
