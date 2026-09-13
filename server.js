const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'data', 'orders.json');
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';
const ADMIN_TOKEN = 'mati-store-secret-token-2026';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Helper to read orders DB
function getOrders() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading orders DB:', err);
    return [];
  }
}

// Helper to save orders DB
function saveOrders(orders) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing orders DB:', err);
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
    return res.json({
      success: true,
      message: 'Login successful',
      token: ADMIN_TOKEN
    });
  }
  return res.status(401).json({
    success: false,
    message: 'ভুল এডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন।'
  });
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

  // Return public tracking info without sensitive admin info
  const tracked = foundOrders.map(o => ({
    id: o.id,
    customerName: o.customerName,
    productTitle: o.productTitle,
    totalPrice: o.totalPrice,
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

// API: Create new COD order (Public)
app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, customerAddress, deliveryLocation, productId, productTitle, productPrice } = req.body;

  if (!customerName || !customerPhone || !customerAddress || !productPrice) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
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
    customerAddress,
    deliveryLocation: deliveryLocation || 'inside',
    deliveryFee,
    productId: productId || 'custom-gadget',
    productTitle: productTitle || 'Mati Store Gadget',
    productPrice: Number(productPrice),
    totalPrice,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.unshift(newOrder); // newest first
  saveOrders(orders);

  console.log(`[Order Created] ${orderId} by ${customerName} (${customerPhone}) - ৳${totalPrice}`);

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

