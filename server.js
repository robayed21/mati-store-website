const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'data', 'orders.json');
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';
const ADMIN_TOKEN = 'mati-store-secret-token-2026';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper: Orders DB
function getOrders() {
  try {
    if (!fs.existsSync(DB_FILE)) return [];
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading orders DB:', err);
    return [];
  }
}

function saveOrders(orders) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing orders DB:', err);
  }
}

const REVIEWS_FILE = path.join(__dirname, 'data', 'reviews.json');

// Helper: Reviews DB
function getReviews() {
  try {
    if (!fs.existsSync(REVIEWS_FILE)) return [];
    const raw = fs.readFileSync(REVIEWS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading reviews DB:', err);
    return [];
  }
}

function saveReviews(reviews) {
  try {
    const dir = path.dirname(REVIEWS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing reviews DB:', err);
  }
}

// API: Public Reviews List
app.get('/api/reviews', (req, res) => {
  const reviews = getReviews();
  res.json({ success: true, count: reviews.length, reviews });
});

// API: Submit Customer Review (Public)
app.post('/api/reviews', (req, res) => {
  const { name, location, rating, comment } = req.body;
  if (!name || !comment) {
    return res.status(400).json({ success: false, message: 'Name and review comment are required.' });
  }

  const reviews = getReviews();
  const initial = name.trim().charAt(0);
  const colors = [
    { color: '#0284c7', bg: '#e0f2fe' },
    { color: '#db2777', bg: '#fce7f3' },
    { color: '#16a34a', bg: '#dcfce7' },
    { color: '#d97706', bg: '#fef3c7' }
  ];
  const choice = colors[reviews.length % colors.length];

  const newReview = {
    id: `rev-${Date.now()}`,
    name,
    location: location || 'বাংলাদেশ',
    rating: Number(rating || 5),
    comment,
    badge: 'Verified Customer',
    avatarColor: choice.color,
    avatarBg: choice.bg,
    initial,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  saveReviews(reviews);

  res.status(201).json({ success: true, message: 'Review submitted successfully!', review: newReview });
});

// Helper: Products DB
function getProducts() {
  try {
    if (!fs.existsSync(PRODUCTS_FILE)) return [];
    const raw = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading products DB:', err);
    return [];
  }
}

function saveProducts(products) {
  try {
    const dir = path.dirname(PRODUCTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing products DB:', err);
  }
}

// Helper: SMS Notification Hook
function sendSMSNotification(phone, orderId, totalPrice) {
  console.log(`[SMS HOOK] 📲 Sending SMS to ${phone}: "ধন্যবাদ! আপনার মতি স্টোরের অর্ডার (ID: ${orderId}, ৳${totalPrice}) গ্রহণ করা হয়েছে।"`);
  // If GREENWEB_API_KEY environment variable is present, trigger HTTP request to SMS gateway
  if (process.env.GREENWEB_API_KEY) {
    // Greenweb / BdSMS integration hook
  }
}

// Admin Auth Middleware
function requireAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'] || req.query.adminToken;
  if (token === ADMIN_TOKEN || token === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Admin login required.' });
}

// API: Admin Login
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE) {
    return res.json({ success: true, message: 'Login successful', token: ADMIN_TOKEN });
  }
  return res.status(401).json({ success: false, message: 'ভুল এডমিন পাসওয়ার্ড!' });
});

// API: Public Products List
app.get('/api/products', (req, res) => {
  const products = getProducts();
  res.json({ success: true, count: products.length, products });
});

// API: Add Product (Protected)
app.post('/api/products', requireAdminAuth, (req, res) => {
  const { title, titleBn, category, price, oldPrice, discount, tag, image, tab } = req.body;
  if (!title || !price) {
    return res.status(400).json({ success: false, message: 'Title and Price are required.' });
  }

  const products = getProducts();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = `${slug}-${Date.now().toString().slice(-4)}`;

  const newProduct = {
    id,
    title,
    titleBn: titleBn || title,
    category: category || 'phone',
    price: Number(price),
    oldPrice: oldPrice ? Number(oldPrice) : Number(price) + 100,
    discount: discount || '',
    savings: oldPrice ? Number(oldPrice) - Number(price) : 100,
    tag: tag || 'New',
    image: image || 'assets/phone_stand_speaker.jpg',
    tab: tab || 'available'
  };

  products.unshift(newProduct);
  saveProducts(products);

  res.status(201).json({ success: true, message: 'Product added successfully', product: newProduct });
});

// API: Delete Product (Protected)
app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  let products = getProducts();
  const filtered = products.filter(p => p.id !== id);

  if (filtered.length === products.length) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  saveProducts(filtered);
  res.json({ success: true, message: 'Product deleted successfully.' });
});

// API: Public Order Tracking
app.get('/api/orders/track', (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ success: false, message: 'Order ID or phone number is required.' });
  }

  const cleanQuery = query.trim().toLowerCase();
  const orders = getOrders();

  const foundOrders = orders.filter(o => 
    o.id.toLowerCase() === cleanQuery || 
    o.customerPhone.includes(cleanQuery)
  );

  if (!foundOrders.length) {
    return res.status(404).json({ success: false, message: 'কোনো অর্ডার পাওয়া যায়নি! সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিন।' });
  }

  const tracked = foundOrders.map(o => ({
    id: o.id,
    customerName: o.customerName,
    productTitle: o.productTitle,
    totalPrice: o.totalPrice,
    paymentMethod: o.paymentMethod || 'COD',
    status: o.status,
    createdAt: o.createdAt
  }));

  res.json({ success: true, count: tracked.length, orders: tracked });
});

// API: Get all orders (Protected)
app.get('/api/orders', requireAdminAuth, (req, res) => {
  let orders = getOrders();
  const { status, search } = req.query;

  if (status && status !== 'all') {
    orders = orders.filter(o => o.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.productTitle.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: orders.length, orders });
});

// API: Export Orders CSV for Courier (Protected)
app.get('/api/admin/export-csv', requireAdminAuth, (req, res) => {
  const orders = getOrders();
  let csv = 'Tracking ID,Customer Name,Customer Phone,Address,Delivery Area,Product Title,Product Price,Delivery Fee,Total Price,Payment Method,TrxID,Status,Order Date\n';

  orders.forEach(o => {
    const cleanAddress = `"${(o.customerAddress || '').replace(/"/g, '""')}"`;
    const cleanTitle = `"${(o.productTitle || '').replace(/"/g, '""')}"`;
    csv += `${o.id},"${o.customerName}",${o.customerPhone},${cleanAddress},${o.deliveryLocation || 'inside'},${cleanTitle},${o.productPrice},${o.deliveryFee},${o.totalPrice},${o.paymentMethod || 'COD'},"${o.trxId || ''}",${o.status},${o.createdAt}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="mati_store_orders.csv"');
  res.status(200).send(csv);
});

// API: Create new order (Public)
app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, customerEmail, customerAddress, deliveryLocation, productId, productTitle, productPrice, paymentMethod, trxId } = req.body;

  if (!customerName || !customerPhone || !customerEmail || !customerAddress || !productPrice) {
    return res.status(400).json({ success: false, message: 'সকল তথ্যাদি সঠিকভাবে পূরণ করুন (নাম, ফোন, ইমেইল, ঠিকানা)' });
  }

  const orders = getOrders();
  const nextIdNum = 1000 + orders.length + 1;
  const orderId = `MATI-${nextIdNum}`;

  const deliveryFee = deliveryLocation === 'outside' ? 120 : 60;
  const totalPrice = Number(productPrice) + deliveryFee;

  const newOrder = {
    id: orderId,
    customerName,
    customerPhone,
    customerEmail: customerEmail || '',
    customerAddress,
    deliveryLocation: deliveryLocation || 'inside',
    deliveryFee,
    productId: productId || 'custom-gadget',
    productTitle: productTitle || 'Mati Store Gadget',
    productPrice: Number(productPrice),
    totalPrice,
    paymentMethod: paymentMethod || 'COD',
    trxId: trxId || '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder);
  saveOrders(orders);

  sendSMSNotification(customerPhone, orderId, totalPrice);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order: newOrder
  });
});

// API: Update order status (Protected)
app.patch('/api/orders/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }

  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();

  saveOrders(orders);

  res.json({ success: true, message: 'Order status updated', order: orders[index] });
});

// API: Admin Stats Summary (Protected)
app.get('/api/stats', requireAdminAuth, (req, res) => {
  const orders = getOrders();
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

  res.json({
    success: true,
    stats: {
      totalOrders,
      totalRevenue,
      pendingOrders,
      confirmedOrders,
      deliveredOrders
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mati Store Server running at http://localhost:${PORT}`);
});


