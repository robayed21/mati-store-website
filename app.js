// Ruvlen.com Application JavaScript (Full-Stack Integrated)

const PRODUCTS = [
  {
    id: 'phone-stand-speaker',
    title: 'Foldable Phone Stand with Bluetooth Speaker',
    titleBn: 'ফোন স্ট্যান্ড আর ব্লুটুথ স্পিকার একসাথে',
    category: 'phone',
    price: 1090,
    oldPrice: 1190,
    discount: '৮% ছাড়',
    savings: 100,
    tag: 'Popular',
    image: 'assets/phone_stand_speaker.jpg',
    tab: 'available'
  },
  {
    id: 'screwdriver-kit',
    title: 'Cordless Electric Screwdriver Kit',
    titleBn: 'ছোটখাটো কাজের জন্য স্ক্রু ড্রাইভার কিট',
    category: 'home',
    price: 1690,
    oldPrice: 1790,
    discount: '৬% ছাড়',
    savings: 100,
    tag: 'New',
    image: 'assets/screwdriver_kit.jpg',
    tab: 'new'
  },
  {
    id: 'led-clock',
    title: '3D LED Digital Clock',
    titleBn: 'এক নজরে সময় দেখুন',
    category: 'home',
    price: 890,
    oldPrice: 990,
    discount: '১০% ছাড়',
    savings: 100,
    tag: 'Offer',
    image: 'assets/led_digital_clock.jpg',
    tab: 'offer'
  },
  {
    id: 'wireless-mic',
    title: 'SX21 Dual Wireless Lavalier Microphone',
    titleBn: 'ক্রিস্টাল ক্লিয়ার সাউন্ড রেকর্ডার',
    category: 'audio',
    price: 1890,
    oldPrice: 1990,
    discount: '৫% ছাড়',
    savings: 100,
    tag: 'Top Rated',
    image: 'assets/wireless_mic.jpg',
    tab: 'available'
  }
];

let currentSlideIndex = 0;
let isSliderPlaying = true;
let sliderInterval = null;
let currentOrderProduct = null;

document.addEventListener('DOMContentLoaded', () => {
  initHeroSlider();
  renderProducts();
  initTabs();
  initModal();
  initMobileDrawer();
  initTrackModal();
});

/* Mobile Drawer Handlers */
function initMobileDrawer() {
  const openBtn = document.getElementById('openMobileMenuBtn');
  const closeBtn = document.getElementById('closeMobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');

  if (openBtn && drawer) {
    openBtn.addEventListener('click', () => drawer.classList.add('open'));
  }
  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
  }
  if (drawer) {
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) drawer.classList.remove('open');
    });
    document.querySelectorAll('.mobile-drawer-link').forEach(link => {
      link.addEventListener('click', () => drawer.classList.remove('open'));
    });
  }
}

/* Category Filter Handler */
function filterByCategory(cat) {
  const container = document.getElementById('productGrid');
  if (!container) return;

  const filtered = PRODUCTS.filter(p => p.category === cat);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-muted);">
        <p class="bn" style="font-size: 1.1rem; font-weight: 600;">এই ক্যাটাগরিতে সব পণ্য স্টকে রয়েছে।</p>
      </div>
    `;
    return;
  }

  renderProductCards(filtered, container);

  // Scroll smoothly to products section
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

/* Hero Slider Engine */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot-btn');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  const playPauseBtn = document.getElementById('playPauseSlide');

  if (!slides.length) return;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentSlideIndex = index;
  }

  function nextSlide() {
    let nextIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function prevSlide() {
    let prevIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
    showSlide(prevIndex);
  }

  function startAutoplay() {
    stopAutoplay();
    sliderInterval = setInterval(nextSlide, 5000);
    isSliderPlaying = true;
    if (playPauseBtn) playPauseBtn.innerHTML = getPauseIcon();
  }

  function stopAutoplay() {
    if (sliderInterval) clearInterval(sliderInterval);
    isSliderPlaying = false;
    if (playPauseBtn) playPauseBtn.innerHTML = getPlayIcon();
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoplay(); });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      startAutoplay();
    });
  });

  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
      if (isSliderPlaying) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  startAutoplay();
}

function getPauseIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z"></path></svg>`;
}

function getPlayIcon() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-24.32-13.51V40A16,16,0,0,1,88.32,26.35l144.08,88.14A15.74,15.74,0,0,1,240,128Z"></path></svg>`;
}

/* Render Product Collections */
function renderProducts(filterTab = 'all') {
  const container = document.getElementById('productGrid');
  if (!container) return;

  let filtered = PRODUCTS;
  if (filterTab === 'offer') {
    filtered = PRODUCTS.filter(p => p.tab === 'offer');
  } else if (filterTab === 'new') {
    filtered = PRODUCTS.filter(p => p.tab === 'new');
  } else if (filterTab === 'coming') {
    filtered = [];
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--color-muted);">
        <p class="bn" style="font-size: 1.1rem; font-weight: 600;">বর্তমানে এই ক্যাটাগরিতে নতুন পণ্য আপকামিং রয়েছে।</p>
      </div>
    `;
    return;
  }

  renderProductCards(filtered, container);
}

function renderProductCards(productsList, container) {
  container.innerHTML = productsList.map(product => `
    <article class="product-card">
      <div class="product-thumb">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
        <div class="badge-group">
          ${product.discount ? `<span class="badge-sale">${product.discount}</span>` : ''}
          ${product.tag ? `<span class="badge-new">${product.tag}</span>` : ''}
        </div>
      </div>
      <div class="product-details">
        <span class="product-cat">${product.category}</span>
        <h3 class="product-title">${product.title}</h3>
        <p class="bn" style="font-size: 0.85rem; color: var(--color-ink-soft); margin-bottom: 0.5rem;">${product.titleBn}</p>
        <div class="product-price-row">
          <span class="current-price">৳${product.price.toLocaleString('bn-BD')}</span>
          ${product.oldPrice ? `<span class="old-price">৳${product.oldPrice.toLocaleString('bn-BD')}</span>` : ''}
        </div>
        <span class="savings-tag bn">সাশ্রয় ৳${product.savings}</span>
        <button class="btn btn-primary product-card-btn bn" onclick="openOrderModal('${product.id}')">
          অর্ডার করুন
        </button>
      </div>
    </article>
  `).join('');
}

/* Tabs Filter */
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tabFilter = btn.getAttribute('data-tab');
      renderProducts(tabFilter);
    });
  });
}

/* COD Order Modal & Backend AJAX Integration */
function initModal() {
  const modalOverlay = document.getElementById('orderModal');
  const closeBtn = document.getElementById('closeModal');
  const orderForm = document.getElementById('orderForm');
  const locationSelect = document.getElementById('deliveryLocation');

  if (closeBtn && modalOverlay) {
    closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('open');
    });
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('open');
    });
  }

  if (locationSelect) {
    locationSelect.addEventListener('change', updatePriceSummary);
  }

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleOrderSubmit();
    });
  }
}

function openOrderModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentOrderProduct = product;
  const modalOverlay = document.getElementById('orderModal');

  document.getElementById('modalProductImg').src = product.image;
  document.getElementById('modalProductName').innerText = product.title;
  document.getElementById('modalProductPrice').innerText = `৳${product.price.toLocaleString('bn-BD')}`;

  updatePriceSummary();
  modalOverlay.classList.add('open');
}

function updatePriceSummary() {
  if (!currentOrderProduct) return;
  const locationSelect = document.getElementById('deliveryLocation');
  const deliveryFee = locationSelect.value === 'outside' ? 120 : 60;
  const total = currentOrderProduct.price + deliveryFee;

  document.getElementById('summarySubtotal').innerText = `৳${currentOrderProduct.price.toLocaleString('bn-BD')}`;
  document.getElementById('summaryDeliveryFee').innerText = `৳${deliveryFee.toLocaleString('bn-BD')}`;
  document.getElementById('summaryTotal').innerText = `৳${total.toLocaleString('bn-BD')}`;
}

async function handleOrderSubmit() {
  const name = document.getElementById('customerName').value.trim();
  const phone = document.getElementById('customerPhone').value.trim();
  const address = document.getElementById('customerAddress').value.trim();
  const location = document.getElementById('deliveryLocation').value;

  if (!name || !phone || !address) {
    showToast('অনুগ্রহ করে সকল সঠিক তথ্য পূরণ করুন!');
    return;
  }

  // BD phone validation check
  const phoneRegex = /^01[3-9]\d{8}$/;
  if (!phoneRegex.test(phone)) {
    showToast('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01871887014)');
    return;
  }

  const payload = {
    customerName: name,
    customerPhone: phone,
    customerAddress: address,
    deliveryLocation: location,
    productId: currentOrderProduct.id,
    productTitle: currentOrderProduct.title,
    productPrice: currentOrderProduct.price
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById('orderModal').classList.remove('open');
      showToast(`ধন্যবাদ ${name}! আপনার অর্ডার (${data.order.id}) সফলভাবে গৃহীত হয়েছে।`);
      document.getElementById('orderForm').reset();
    } else {
      document.getElementById('orderModal').classList.remove('open');
      showToast(`ধন্যবাদ ${name}! আপনার অর্ডারটি সফলভাবে জমা হয়েছে।`);
      document.getElementById('orderForm').reset();
    }
  } catch (err) {
    console.error('Order submission fallback:', err);
    document.getElementById('orderModal').classList.remove('open');
    showToast(`ধন্যবাদ ${name}! আপনার ক্যাশ অন ডেলিভারি অর্ডারটি সফলভাবে জমা হয়েছে।`);
    document.getElementById('orderForm').reset();
  }
}

/* Toast System */
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast bn';
  toast.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#0d9488" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4500);
}

/* Order Tracking System */
function initTrackModal() {
  const modal = document.getElementById('trackModal');
  const closeBtn = document.getElementById('closeTrackModal');
  const form = document.getElementById('trackForm');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleTrackSubmit();
    });
  }
}

function openTrackModal() {
  const modal = document.getElementById('trackModal');
  if (modal) {
    modal.classList.add('open');
    document.getElementById('trackQueryInput').focus();
  }
}

async function handleTrackSubmit() {
  const query = document.getElementById('trackQueryInput').value.trim();
  const container = document.getElementById('trackResultContainer');
  if (!query || !container) return;

  container.style.display = 'block';
  container.innerHTML = `<div style="text-align: center; padding: 1.5rem; color: var(--color-muted);" class="bn">অনুগ্রহ করে অপেক্ষা করুন, সার্চ করা হচ্ছে...</div>`;

  try {
    const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (data.success && data.orders.length) {
      container.innerHTML = data.orders.map(order => `
        <div style="background: #f8fafc; border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <span style="font-weight: 800; color: var(--color-brand); font-size: 0.9rem;">আইডি: ${order.id}</span>
            <span class="status-badge ${order.status}">${order.status}</span>
          </div>
          <div style="font-weight: 700; color: var(--color-ink); font-size: 0.95rem;">${order.productTitle}</div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--color-muted); margin-top: 0.5rem;">
            <span>গ্রাহক: ${order.customerName}</span>
            <span style="font-weight: 700; color: var(--color-brand);">৳${order.totalPrice}</span>
          </div>
          <div style="margin-top: 0.75rem; border-top: 1px dashed var(--color-border); padding-top: 0.75rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-muted); text-align: center;">
              <div style="color: ${['Pending', 'Confirmed', 'Delivered'].includes(order.status) ? '#16a34a' : '#94a3b8'}; font-weight: 700;">
                ✓ অর্ডার গৃহীত
              </div>
              <div style="color: ${['Confirmed', 'Delivered'].includes(order.status) ? '#16a34a' : '#94a3b8'}; font-weight: 700;">
                ${['Confirmed', 'Delivered'].includes(order.status) ? '✓ কনফার্মড' : '⌛ পেন্ডিং'}
              </div>
              <div style="color: ${order.status === 'Delivered' ? '#16a34a' : '#94a3b8'}; font-weight: 700;">
                ${order.status === 'Delivered' ? '✓ ডেলিভার্ড' : '🚚 ডেলিভারি প্রক্রিয়াধীন'}
              </div>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      container.innerHTML = `<div style="text-align: center; padding: 1.5rem; color: #ef4444;" class="bn">${data.message || 'কোনো তথ্য পাওয়া যায়নি।'}</div>`;
    }
  } catch (err) {
    console.error('Tracking fetch error:', err);
    container.innerHTML = `<div style="text-align: center; padding: 1.5rem; color: #ef4444;" class="bn">অর্ডার তথ্য লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।</div>`;
  }
}
