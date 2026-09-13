const express = require('express');
const serverless = require('serverless-http');

const app = express();
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';
const ADMIN_TOKEN = 'mati-store-secret-token-2026';

app.use(express.json());

let memoryProducts = [
  {
    id: "phone-stand-speaker",
    title: "Foldable Phone Stand with Bluetooth Speaker",
    titleBn: "ফোন স্ট্যান্ড আর ব্লুটুথ স্পিকার একসাথে",
    category: "phone",
    price: 1090,
    oldPrice: 1190,
    discount: "৮% ছাড়",
    savings: 100,
    tag: "Popular",
    image: "assets/phone_stand_speaker.jpg",
    tab: "available"
  },
  {
    id: "screwdriver-kit",
    title: "Cordless Electric Screwdriver Kit",
    titleBn: "ছোটখাটো কাজের জন্য স্ক্রু ড্রাইভার কিট",
    category: "home",
    price: 1690,
    oldPrice: 1790,
    discount: "৬% ছাড়",
    savings: 100,
    tag: "New",
    image: "assets/screwdriver_kit.jpg",
    tab: "new"
  },
  {
    id: "led-clock",
    title: "3D LED Digital Clock",
    titleBn: "এক নজরে সময় দেখুন",
    category: "home",
    price: 890,
    oldPrice: 990,
    discount: "১০% ছাড়",
    savings: 100,
    tag: "Offer",
    image: "assets/led_digital_clock.jpg",
    tab: "offer"
  },
  {
    id: "wireless-mic",
    title: "SX21 Dual Wireless Lavalier Microphone",
    titleBn: "ক্রিস্টাল ক্লিয়ার সাউন্ড রেকর্ডার",
    category: "audio",
    price: 1890,
    oldPrice: 1990,
    discount: "৫% ছাড়",
    savings: 100,
    tag: "Top Rated",
    image: "assets/wireless_mic.jpg",
    tab: "available"
  }
];

let memoryOrders = [
  {
    id: "MATI-1001",
    customerName: "Md Siam",
    customerPhone: "01871887014",
    customerAddress: "Dhanmondi, Dhaka",
    deliveryLocation: "inside",
    deliveryFee: 60,
    productId: "phone-stand-speaker",
    productTitle: "Foldable Phone Stand with Bluetooth Speaker",
    productPrice: 1090,
    totalPrice: 1150,
    paymentMethod: "COD",
    status: "Confirmed",
    createdAt: new Date().toISOString()
  }
];

function requireAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers['authorization'] || req.query.adminToken;
  if (token === ADMIN_TOKEN || token === `Bearer ${ADMIN_TOKEN}`) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Admin login required.' });
}

// API: Admin Login
app.post('/.netlify/functions/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE) {
    return res.json({ success: true, message: 'Login successful', token: ADMIN_TOKEN });
  }
  return res.status(401).json({ success: false, message: 'ভুল এডমিন পাসওয়ার্ড!' });
});

// API: Public Products List
app.get('/.netlify/functions/api/products', (req, res) => {
  res.json({ success: true, count: memoryProducts.length, products: memoryProducts });
});

// API: Add Product
app.post('/.netlify/functions/api/products', requireAdminAuth, (req, res) => {
  const { title, titleBn, category, price, oldPrice, discount, tag, image, tab } = req.body;
  const slug = (title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const id = `${slug}-${Date.now().toString().slice(-4)}`;

  const newP = {
    id,
    title,
    titleBn: titleBn || title,
    category: category || 'phone',
    price: Number(price || 1000),
    oldPrice: Number(oldPrice || 1200),
    discount: discount || '',
    savings: 200,
    tag: tag || 'New',
    image: image || 'assets/phone_stand_speaker.jpg',
    tab: tab || 'available'
  };

  memoryProducts.unshift(newP);
  res.status(201).json({ success: true, message: 'Product added', product: newP });
});

// API: Delete Product
app.delete('/.netlify/functions/api/products/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  memoryProducts = memoryProducts.filter(p => p.id !== id);
  res.json({ success: true, message: 'Product deleted' });
});

// API: Public Order Tracking
app.get('/.netlify/functions/api/orders/track', (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ success: false, message: 'Query is required.' });

  const q = query.trim().toLowerCase();
  const found = memoryOrders.filter(o => o.id.toLowerCase() === q || o.customerPhone.includes(q));

  if (!found.length) {
    return res.status(404).json({ success: false, message: 'কোনো অর্ডার পাওয়া যায়নি!' });
  }

  const tracked = found.map(o => ({
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

// API: Export CSV
app.get('/.netlify/functions/api/admin/export-csv', requireAdminAuth, (req, res) => {
  let csv = 'Tracking ID,Customer Name,Customer Phone,Address,Delivery Area,Product Title,Product Price,Delivery Fee,Total Price,Payment Method,TrxID,Status,Order Date\n';

  memoryOrders.forEach(o => {
    const cleanAddress = `"${(o.customerAddress || '').replace(/"/g, '""')}"`;
    const cleanTitle = `"${(o.productTitle || '').replace(/"/g, '""')}"`;
    csv += `${o.id},"${o.customerName}",${o.customerPhone},${cleanAddress},${o.deliveryLocation || 'inside'},${cleanTitle},${o.productPrice},${o.deliveryFee},${o.totalPrice},${o.paymentMethod || 'COD'},"${o.trxId || ''}",${o.status},${o.createdAt}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="mati_store_orders.csv"');
  res.status(200).send(csv);
});

// API: Get Orders (Protected)
app.get('/.netlify/functions/api/orders', requireAdminAuth, (req, res) => {
  res.json({ success: true, count: memoryOrders.length, orders: memoryOrders });
});

// API: Create Order (Public)
app.post('/.netlify/functions/api/orders', (req, res) => {
  const { customerName, customerPhone, customerAddress, deliveryLocation, productId, productTitle, productPrice, paymentMethod, trxId } = req.body;
  
  const nextIdNum = 1000 + memoryOrders.length + 1;
  const orderId = `MATI-${nextIdNum}`;
  const deliveryFee = deliveryLocation === 'outside' ? 120 : 60;
  const totalPrice = Number(productPrice || 0) + deliveryFee;

  const newOrder = {
    id: orderId,
    customerName,
    customerPhone,
    customerAddress,
    deliveryLocation: deliveryLocation || 'inside',
    deliveryFee,
    productId: productId || 'custom',
    productTitle: productTitle || 'Mati Store Gadget',
    productPrice: Number(productPrice || 0),
    totalPrice,
    paymentMethod: paymentMethod || 'COD',
    trxId: trxId || '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  memoryOrders.unshift(newOrder);
  res.status(201).json({ success: true, message: 'Order created', order: newOrder });
});

// API: Update Order Status (Protected)
app.patch('/.netlify/functions/api/orders/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const index = memoryOrders.findIndex(o => o.id === id);

  if (index !== -1) {
    memoryOrders[index].status = status;
    return res.json({ success: true, order: memoryOrders[index] });
  }
  res.status(404).json({ success: false, message: 'Order not found' });
});

// API: Stats (Protected)
app.get('/.netlify/functions/api/stats', requireAdminAuth, (req, res) => {
  const totalOrders = memoryOrders.length;
  const totalRevenue = memoryOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = memoryOrders.filter(o => o.status === 'Pending').length;
  const deliveredOrders = memoryOrders.filter(o => o.status === 'Delivered').length;

  res.json({
    success: true,
    stats: { totalOrders, totalRevenue, pendingOrders, deliveredOrders }
  });
});

module.exports.handler = serverless(app);


