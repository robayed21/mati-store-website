// Mati Store Netlify Function (dependency-free, no express)
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123';
const ADMIN_TOKEN = 'mati-store-secret-token-2026';

let memoryProducts = [
  {
    id: "phone-stand-speaker",
    title: "Foldable Phone Stand with Bluetooth Speaker",
    titleBn: "ফোন স্ট্যান্ড আর ব্লুটুথ স্পিকার একসাথে",
    category: "phone",
    price: 1090,
    oldPrice: 1190,
    discount: "৮% ছাড়ের",
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
    discount: "১০% ছাড়া",
    savings: 100,
    tag: "Offer",
    image: "assets/led_digital_clock.jpg",
    tab: "offer"
  },
  {
    id: "wireless-mic",
    title: "SX21 Dual Wireless Lavalier Microphone",
    titleBn: "ক্রিস্টাল ক্লিয়ার সাউন্ড রেকর্ডিং",
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

let memoryReviews = [
  {
    id: "rev-1",
    name: "রাকিব হাসান",
    location: "মিরপুর, ঢাকা",
    rating: 5,
    comment: "ফোন স্ট্যান্ড আর স্পিকার কম্বোটা দারুণ কাজ করছে! ২ দিনের মধ্যে ঢাকায় ডেলিভারি পেয়েছি। পুরোপুরি চেক করে টাকা দেওয়ার সুযোগটা অনেক ভালো লেগেছে।",
    badge: "Verified Customer",
    avatarColor: "#0284c7",
    avatarBg: "#e0f2fe",
    initial: "র",
    createdAt: new Date().toISOString()
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

function json(status, obj) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-token, authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
    },
    body: JSON.stringify(obj)
  };
}

function csvResponse(status, text) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mati_store_orders.csv"',
      'Access-Control-Allow-Origin': '*'
    },
    body: text
  };
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    const raw = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body;
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function isAdminAuthorized(event) {
  const h = event.headers || {};
  const token = h['x-admin-token'] || h['X-Admin-Token'] || h['authorization'] || h['Authorization'] || (event.queryStringParameters && event.queryStringParameters.adminToken);
  return token === ADMIN_TOKEN || token === `Bearer ${ADMIN_TOKEN}`;
}

exports.handler = async (event) => {
  const method = (event.httpMethod || 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-admin-token, authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS'
      },
      body: ''
    };
  }

  let path = event.path || '';
  path = path.replace(/^\/\.netlify\/functions\/api/, '');
  if (!path.startsWith('/')) path = '/' + path;

  const query = event.queryStringParameters || {};
  const body = parseBody(event);
  const segments = path.split('/').filter(Boolean);

  // ---- PUBLIC: GET /products ----
  if (method === 'GET' && segments[0] === 'products' && segments.length === 1) {
    return json(200, { success: true, count: memoryProducts.length, products: memoryProducts });
  }

  // ---- PUBLIC: GET /reviews ----
  if (method === 'GET' && segments[0] === 'reviews' && segments.length === 1) {
    return json(200, { success: true, count: memoryReviews.length, reviews: memoryReviews });
  }

  // ---- PUBLIC: POST /reviews ----
  if (method === 'POST' && segments[0] === 'reviews' && segments.length === 1) {
    const { name, location, rating, comment } = body;
    if (!name || !comment) {
      return json(400, { success: false, message: 'Name and review comment are required.' });
    }
    const initial = String(name).trim().charAt(0);
    const newRev = {
      id: `rev-${Date.now()}`,
      name,
      location: location || 'বাংলাদেশ',
      rating: Number(rating || 5),
      comment,
      badge: 'Verified Customer',
      avatarColor: '#0284c7',
      avatarBg: '#e0f2fe',
      initial,
      createdAt: new Date().toISOString()
    };
    memoryReviews.unshift(newRev);
    return json(201, { success: true, message: 'Review added', review: newRev });
  }

  // ---- ADMIN: POST /admin/login ----
  if (method === 'POST' && segments[0] === 'admin' && segments[1] === 'login') {
    if (body.passcode === ADMIN_PASSCODE) {
      return json(200, { success: true, message: 'Login successful', token: ADMIN_TOKEN });
    }
    return json(401, { success: false, message: 'ভুল এডমিন পাসওয়ার্ড!' });
  }

  // ---- ADMIN: POST /products ----
  if (method === 'POST' && segments[0] === 'products' && segments.length === 1) {
    if (!isAdminAuthorized(event)) return json(401, { success: false, message: 'Unauthorized. Admin login required.' });
    const { title, titleBn, category, price, oldPrice, discount, tag, image, tab } = body;
    const slug = String(title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
    return json(201, { success: true, message: 'Product added', product: newP });
  }

  // ---- ADMIN: DELETE /products/:id ----
  if (method === 'DELETE' && segments[0] === 'products' && segments[1]) {
    if (!isAdminAuthorized(event)) return json(401, { success: false, message: 'Unauthorized. Admin login required.' });
    memoryProducts = memoryProducts.filter(p => p.id !== segments[1]);
    return json(200, { success: true, message: 'Product deleted' });
  }

  // ---- PUBLIC: GET /orders/track ----
  if (method === 'GET' && segments[0] === 'orders' && segments[1] === 'track') {
    const q = String(query.query || '').trim().toLowerCase();
    if (!q) return json(400, { success: false, message: 'Query is required.' });
    const found = memoryOrders.filter(o => String(o.id).toLowerCase() === q || String(o.customerPhone).includes(q));
    if (!found.length) {
      return json(404, { success: false, message: 'কোনো অর্ডার পাওয়া যায়নি!' });
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
    return json(200, { success: true, count: tracked.length, orders: tracked });
  }

  // ---- ADMIN: GET /admin/export-csv ----
  if (method === 'GET' && segments[0] === 'admin' && segments[1] === 'export-csv') {
    if (!isAdminAuthorized(event)) return json(401, { success: false, message: 'Unauthorized. Admin login required.' });
    let out = 'Tracking ID,Customer Name,Customer Phone,Address,Delivery Area,Product Title,Product Price,Delivery Fee,Total Price,Payment Method,TrxID,Status,Order Date\n';
    memoryOrders.forEach(o => {
      const cleanAddress = `"${String(o.customerAddress || '').replace(/"/g, '""')}"`;
      const cleanTitle = `"${String(o.productTitle || '').replace(/"/g, '""')}"`;
      out += `${o.id},"${o.customerName}",${o.customerPhone},${cleanAddress},${o.deliveryLocation || 'inside'},${cleanTitle},${o.productPrice},${o.deliveryFee},${o.totalPrice},${o.paymentMethod || 'COD'},"${o.trxId || ''}",${o.status},${o.createdAt}\n`;
    });
    return csvResponse(200, out);
  }

  // ---- PUBLIC: POST /orders ----
  if (method === 'POST' && segments[0] === 'orders' && segments.length === 1) {
    const { customerName, customerPhone, customerEmail, customerAddress, deliveryLocation, productId, productTitle, productPrice, paymentMethod, trxId } = body;
    const nextIdNum = 1000 + memoryOrders.length + 1;
    const orderId = `MATI-${nextIdNum}`;
    const deliveryFee = deliveryLocation === 'outside' ? 120 : 60;
    const totalPrice = Number(productPrice || 0) + deliveryFee;
    const newOrder = {
      id: orderId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
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
    return json(201, { success: true, message: 'Order created', order: newOrder });
  }

  // ---- ADMIN: GET /orders ----
  if (method === 'GET' && segments[0] === 'orders' && segments.length === 1) {
    if (!isAdminAuthorized(event)) return json(401, { success: false, message: 'Unauthorized. Admin login required.' });
    return json(200, { success: true, count: memoryOrders.length, orders: memoryOrders });
  }

  // ---- ADMIN: PATCH /orders/:id ----
  if (method === 'PATCH' && segments[0] === 'orders' && segments[1]) {
    if (!isAdminAuthorized(event)) return json(401, { success: false, message: 'Unauthorized. Admin login required.' });
    const idx = memoryOrders.findIndex(o => o.id === segments[1]);
    if (idx !== -1) {
      memoryOrders[idx].status = body.status;
      return json(200, { success: true, order: memoryOrders[idx] });
    }
    return json(404, { success: false, message: 'Order not found' });
  }

  // ---- ADMIN: GET /stats ----
  if (method === 'GET' && segments[0] === 'stats') {
    if (!isAdminAuthorized(event)) return json(401, { success: false, message: 'Unauthorized. Admin login required.' });
    const totalOrders = memoryOrders.length;
    const totalRevenue = memoryOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const pendingOrders = memoryOrders.filter(o => o.status === 'Pending').length;
    const deliveredOrders = memoryOrders.filter(o => o.status === 'Delivered').length;
    return json(200, { success: true, stats: { totalOrders, totalRevenue, pendingOrders, deliveredOrders } });
  }

  // ---- PUBLIC: POST /ai/chat (Larprouter) ----
  if (method === 'POST' && segments[0] === 'ai' && segments[1] === 'chat') {
    const messages = body.messages;
    if (!messages || !Array.isArray(messages)) {
      return json(400, { success: false, message: 'Messages array is required.' });
    }

    const apiKey = process.env.LARPROUTER_API_KEY;
    if (!apiKey) {
      return json(500, { success: false, message: 'AI service is not configured (LARPROUTER_API_KEY missing).' });
    }

    try {
      const systemPrompt = {
        role: 'system',
        content: "You are Mati Store's AI Shopping Assistant. Mati Store is a popular e-commerce store in Bangladesh selling everyday gadgets like phone stands, bluetooth speakers, LED clocks, wireless microphones, and cordless screwdrivers with Cash on Delivery (COD). Answer customer queries in a helpful, polite, and friendly manner. Reply in Bengali if the customer writes in Bengali."
      };

      const response = await fetch('https://larprouter.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: process.env.LARPROUTER_MODEL || 'deepseek-v4.1-flash',
          messages: [systemPrompt, ...messages]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        return json(200, { success: true, reply: data.choices[0].message.content });
      }
      return json(500, { success: false, message: 'AI response failed' });
    } catch (err) {
      console.error('AI Chat Error:', err);
      return json(500, { success: false, message: 'Internal server error during AI chat.' });
    }
  }

  return json(404, { success: false, message: 'Not found: ' + method + ' ' + path });
};
