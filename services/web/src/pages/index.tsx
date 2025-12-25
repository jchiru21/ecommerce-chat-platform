import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

interface Cart {
  items: CartItem[];
}

interface Order {
  id: string;
  total: number;
  status: string;
  items: { product: Product; quantity: number }[];
}

interface Message {
  id: string;
  content: string;
  userId: string;
  user: { name?: string; email: string };
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export default function Home() {
  const [status, setStatus] = useState<string>('loading...');
  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>('');
  const [cart, setCart] = useState<Cart>({ items: [] });
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  // Auth forms
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    // Check backend status
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus('error'));

    // Load token from localStorage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Decode user from token (simple way, in production use proper decoding)
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser({ id: payload.id, email: payload.email });
      } catch (e) {
        localStorage.removeItem('token');
      }
    }

    // Fetch products
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchCart();
      fetchOrders();
      fetchMessages();

      // Connect to socket
      const newSocket = io('http://localhost:4001');
      setSocket(newSocket);

      newSocket.emit('join', user.id);

      newSocket.on('newMessage', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, token]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? 'login' : 'register';
    const body = authMode === 'login' ? { email, password } : { email, name, password };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setEmail('');
        setPassword('');
        setName('');
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    setCart({ items: [] });
    setOrders([]);
  };

  const addToCart = async (productId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error(error);
    }
  };

  const createOrder = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchCart();
        fetchOrders();
        alert('Order created!');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    try {
      socket?.emit('sendMessage', { userId: user.id, content: newMessage });
      setNewMessage('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: 40, minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <motion.h1
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ color: 'white', textAlign: 'center', marginBottom: 20 }}
      >
        Ecom Chat Web
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{ color: 'white', textAlign: 'center', marginBottom: 30 }}
      >
        Backend status: {status}
      </motion.p>

      {!user ? (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ maxWidth: 400, margin: '0 auto', background: 'white', padding: 30, borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
        >
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            style={{ textAlign: 'center', marginBottom: 20 }}
          >
            {authMode === 'login' ? 'Login' : 'Register'}
          </motion.h2>
          <form onSubmit={handleAuth}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.3 }}
              style={{ marginBottom: 15 }}
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 5, fontSize: 16 }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.3 }}
              style={{ marginBottom: 15 }}
            >
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 5, fontSize: 16 }}
              />
            </motion.div>
            {authMode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 1.2, duration: 0.3 }}
                style={{ marginBottom: 15 }}
              >
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 5, fontSize: 16 }}
                />
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              style={{ width: '100%', padding: 12, background: '#667eea', color: 'white', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer' }}
            >
              {authMode === 'login' ? 'Login' : 'Register'}
            </motion.button>
          </form>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.3 }}
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            style={{ width: '100%', padding: 10, background: 'transparent', color: '#667eea', border: '1px solid #667eea', borderRadius: 5, fontSize: 16, cursor: 'pointer', marginTop: 10 }}
          >
            Switch to {authMode === 'login' ? 'Register' : 'Login'}
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ maxWidth: 1200, margin: '0 auto' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}
          >
            <motion.p style={{ color: 'white', fontSize: 18 }}>Welcome, {user.name || user.email}!</motion.p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              style={{ padding: '8px 16px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              Logout
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{ background: 'white', padding: 20, borderRadius: 10, marginBottom: 20, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
          >
            <motion.h2
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              Products
            </motion.h2>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
              style={{ listStyle: 'none', padding: 0 }}
            >
              {products.map((product, index) => (
                <motion.li
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  style={{ padding: 15, border: '1px solid #ddd', borderRadius: 5, marginBottom: 10, background: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    <strong>{product.name}</strong> - ${product.price} (Stock: {product.stock})
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#28a745' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addToCart(product.id)}
                    style={{ padding: 8, background: '#007bff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}
                  >
                    Add to Cart
                  </motion.button>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.6, duration: 0.5 }}
            style={{ background: 'white', padding: 20, borderRadius: 10, marginBottom: 20, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
          >
            <motion.h2
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 1.8, duration: 0.3 }}
            >
              Cart
            </motion.h2>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              style={{ listStyle: 'none', padding: 0 }}
            >
              {cart.items.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2.1 + index * 0.1, duration: 0.3 }}
                  style={{ padding: 15, border: '1px solid #ddd', borderRadius: 5, marginBottom: 10, background: '#f9f9f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <div>
                    {item.product.name} x{item.quantity} - ${item.product.price * item.quantity}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: '#dc3545' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => removeFromCart(item.product.id)}
                    style={{ padding: 8, background: '#ff4757', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}
                  >
                    Remove
                  </motion.button>
                </motion.li>
              ))}
            </motion.ul>
            {cart.items.length > 0 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createOrder}
                style={{ marginTop: 20, padding: 12, background: '#28a745', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer', width: '100%' }}
              >
                Checkout
              </motion.button>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.5 }}
            style={{ background: 'white', padding: 20, borderRadius: 10, marginBottom: 20, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
          >
            <motion.h2
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 2.6, duration: 0.3 }}
            >
              Orders
            </motion.h2>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8, duration: 0.5 }}
              style={{ listStyle: 'none', padding: 0 }}
            >
              {orders.map((order, index) => (
                <motion.li
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.9 + index * 0.1, duration: 0.3 }}
                  style={{ padding: 15, border: '1px solid #ddd', borderRadius: 5, marginBottom: 10, background: '#f9f9f9' }}
                >
                  Order #{order.id} - Total: ${order.total} - Status: {order.status}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
            style={{ background: 'white', padding: 20, borderRadius: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}
          >
            <motion.h2
              initial={{ y: -10 }}
              animate={{ y: 0 }}
              transition={{ delay: 3.2, duration: 0.3 }}
            >
              Chat
            </motion.h2>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.4, duration: 0.5 }}
              style={{ border: '1px solid #ccc', padding: 10, height: 200, overflowY: 'scroll', borderRadius: 5, marginBottom: 10 }}
            >
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.userId === user!.id ? 50 : -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 3.5 + index * 0.05, duration: 0.3 }}
                  style={{
                    marginBottom: 10,
                    textAlign: msg.userId === user!.id ? 'right' : 'left',
                    background: msg.userId === user!.id ? '#007bff' : '#f1f1f1',
                    color: msg.userId === user!.id ? 'white' : 'black',
                    padding: 10,
                    borderRadius: 10,
                    maxWidth: '70%',
                    marginLeft: msg.userId === user!.id ? '30%' : '0',
                    marginRight: msg.userId === user!.id ? '0' : '30%'
                  }}
                >
                  <strong>{msg.user.name || msg.user.email}:</strong> {msg.content}
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.6, duration: 0.3 }}
              style={{ display: 'flex' }}
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ flex: 1, padding: 10, border: '1px solid #ddd', borderRadius: 5, marginRight: 10 }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                style={{ padding: 10, background: '#007bff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}
              >
                Send
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
