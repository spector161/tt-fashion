// === Firebase Configuration ===
const firebaseConfig = {
    apiKey: "AIzaSyAvaNEQcqXWGDQB7PBGtHCfvNcB-OzzVFs",
    authDomain: "t-tfahion.firebaseapp.com",
    projectId: "t-tfahion",
    storageBucket: "t-tfahion.firebasestorage.app",
    messagingSenderId: "392044085352",
    appId: "1:392044085352:web:e08f15f841533311493bdd",
    measurementId: "G-65F0TDRXB9"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let products = [];
let cart = [];
let customerOrders = [];

document.addEventListener("DOMContentLoaded", () => {
    db.collection("products").get().then((snapshot) => {
        products = [];
        snapshot.forEach(doc => {
            products.push(doc.data());
        });
        
        if (products.length === 0) {
            products = [
                { id: "PROD-1", name: "ເສື້ອຢືດຄລາສສິກ", price: 150000, category: "Men", desc: "ຜ້າຝ້າຍພຣີມ່ຽມ 100%", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80", featured: true, stock: 10 }
            ];
        }
        initApp();
    }).catch((error) => {
        initApp();
    });
});

function initApp() {
    renderFeaturedProducts();
    renderShopProducts(products);
    updateCartIcon();
    checkLoginStatus();
}

function navigate(pageId) {
    document.querySelectorAll('.page-section').forEach(section => { section.classList.remove('active'); });
    const target = document.getElementById(pageId);
    if(target) target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if(pageId === 'my-orders') { checkLoginStatus(); }
}

function loginCustomer() {
    const phone = document.getElementById('login-phone').value.trim();
    if(!phone) { alert("ກະລຸນາປ້ອນເບີໂທລະສັບ"); return; }
    sessionStorage.setItem('userPhone', phone);
    checkLoginStatus();
}

function logoutCustomer() {
    sessionStorage.removeItem('userPhone');
    checkLoginStatus();
}

function checkLoginStatus() {
    const phone = sessionStorage.getItem('userPhone');
    const headerUser = document.getElementById('display-user-header');
    
    if(phone) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('orders-content').style.display = 'block';
        document.getElementById('display-user-phone').innerText = phone;
        if(headerUser) headerUser.innerText = '🟢 ' + phone;
        fetchMyOrdersFromFirebase(phone);
    } else {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('orders-content').style.display = 'none';
        if(headerUser) headerUser.innerText = '👤';
    }
}

function fetchMyOrdersFromFirebase(phone) {
    const container = document.getElementById('my-orders-list-container');
    container.innerHTML = `<p style="text-align:center;">ກຳລັງໂຫລດຂໍ້ມູນອໍເດີ້...</p>`;
    
    db.collection("orders").where("phone", "==", phone).get().then(snapshot => {
        customerOrders = [];
        snapshot.forEach(doc => customerOrders.push(doc.data()));
        renderMyOrdersList();
    }).catch(err => {
        container.innerHTML = `<p style="text-align:center; color:red;">ເກີດຂໍ້ຜິດພາດໃນການດึงຂໍ້ມູນ</p>`;
    });
}

function renderMyOrdersList() {
    const container = document.getElementById('my-orders-list-container');
    const searchVal = document.getElementById('search-my-order-input').value.toLowerCase().trim();
    
    const filtered = customerOrders.filter(o => o.id.toLowerCase().includes(searchVal));
    if(filtered.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:20px; color:#757575;">ບໍ່ພົບຂໍ້ມູນອໍເດີ້ສຳລັບເບີໂທນີ້</p>`;
        return;
    }
    filtered.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return 0;
    });

    container.innerHTML = filtered.map(o => `
        <div class="cart-item" style="background:#fff; padding:20px; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05); margin-bottom:15px; display:block;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <span style="font-weight:bold; color:#00D1D1; font-size:16px;">${o.id}</span>
                <span style="font-size:13px; font-weight:600; padding:3px 10px; background:#f0f2f5; border-radius:12px;">${o.status === 'shipped' ? '🟢 ຈັດສົ່ງແລ້ວ' : '🟡 ລໍຖ້າຈັດສົ່ງ'}</span>
            </div>
            <p style="font-size:14px; margin-bottom:5px;"><b>ສິນຄ້າ:</b> ${o.product}</p>
            <p style="font-size:13px; color:#757575; margin-bottom:12px;"><b>ເລກພັດສະດຸ:</b> ${o.trackingNo || '-'}</p>
            <button onclick="viewCustomerOrderDetail('${o.id}')" class="btn btn-outline btn-full" style="padding:6px; font-size:13px;">[ ເບິ່ງລາຍລະອຽດ ]</button>
        </div>
    `).join('');
}

function viewCustomerOrderDetail(id) {
    const order = customerOrders.find(o => o.id === id);
    const container = document.getElementById('customer-order-detail-container');
    
    container.innerHTML = `
        <p style="margin-bottom:8px;"><b>Order ID:</b> <span style="color:#00D1D1; font-weight:bold;">${order.id}</span></p>
        <p style="margin-bottom:8px;"><b>ລູກຄ້າ:</b> ${order.customer}</p>
        <p style="margin-bottom:8px;"><b>ສິນຄ້າ:</b> ${order.product}</p>
        <p style="margin-bottom:15px; padding-bottom:10px; border-bottom:1px dashed #eee;"><b>ລາຄາ:</b> <span style="color:#2e7d32; font-weight:bold;">₭${order.price.toLocaleString()}</span></p>
        
        <div style="margin-bottom:15px; padding:10px; background:#f8f9fa; border-radius:6px;">
            <span style="font-size:12px; font-weight:bold; color:#757575; display:block; margin-bottom:5px;">Timeline:</span>
            <div style="font-size:13px; display:flex; flex-direction:column; gap:4px;">
                <span style="color:${order.timeline.paid ? '#2e7d32' : '#ccc'}">✓ ຊຳລະເງິນແລ້ວ</span>
                <span style="color:${order.timeline.packed ? '#2e7d32' : '#ccc'}">✓ ແພັກສິນຄ້າແລ້ວ</span>
                <span style="color:${order.status === 'shipped' ? '#2e7d32' : '#ccc'}">✓ ຈັດສົ່ງແລ້ວ</span>
            </div>
        </div>

        <p style="font-size:14px; margin-bottom:15px;"><b>ຂົນສົ່ງ:</b> ${order.courier} | <b>ເລກພັດສະດຸ:</b> <span style="color:#00D1D1; font-weight:bold;">${order.trackingNo || '-'}</span></p>
        
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #00D1D1; text-align:center;">
            <p style="font-size: 14px; margin-bottom: 10px; color:#00D1D1; font-weight:bold;"><b>📦 ໃບເສร็จຮັບຂອງ / ໃບບິນຈັດສົ່ງ (ຈາກແອດມິນ):</b></p>
            ${order.adminReceipt ? `
                <img src="${order.adminReceipt}" style="max-width: 100%; border-radius: 8px; border: 2px solid #00D1D1; max-height: 400px; object-fit: contain;">
            ` : `
                <p style="text-align:center; color:#999; font-size:13px; padding: 10px 0;">⏳ ຍັງບໍ່ມີໃບເສร็จຮັບຂອງຈາກແອດມິນ (ກຳລັງດຳເນີນການ)</p>
            `}
        </div>

        ${order.slipImage ? `
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed #eee; text-align:center; opacity: 0.7;">
            <p style="font-size: 13px; margin-bottom: 10px; color:#757575;"><b>🧾 ຫຼັກຖານການໂອນເງິນຂອງທ່ານ:</b></p>
            <img src="${order.slipImage}" style="max-width: 50%; border-radius: 6px; border: 1px solid #ccc; max-height: 200px; object-fit: contain;">
        </div>` : ''}
        
        <div style="display:flex; gap:10px; margin-top:20px;">
            <button onclick="copyTrackingNumber('${order.trackingNo}')" ${!order.trackingNo ? 'disabled' : ''} class="btn btn-dark" style="flex:1; padding:8px; font-size:12px;">[ ຄັດລອກເລກພັດສະດຸ ]</button>
        </div>
    `;
    navigate('order-detail');
}

function copyTrackingNumber(text) {
    if(!text || text === '-') { alert('ຍັງບໍ່ມີເລກພັດສະດຸ!'); return; }
    navigator.clipboard.writeText(text); alert(`ຄັດລອກເລກພັດສະດຸ ${text} ແລ້ວ!`);
}

// === Functions for Shop & Cart ===
function renderFeaturedProducts() {
    const grid = document.getElementById('featured-products-grid');
    const featured = products.filter(p => p.featured === true || p.featured === "true");
    // 🆕 เพิ่มการแสดงคำว่า สินค้าหมด หาก stock <= 0
    grid.innerHTML = featured.map(p => {
        let stockVal = p.stock || 0;
        let btnHTML = stockVal > 0 ? `<button onclick="addToCart('${p.id}')" class="btn-add">ເພີ່ມເຂົ້າກະຕ່າ</button>` : `<button disabled class="btn-add" style="background:#ccc;">ສິນຄ້າໝົດ</button>`;
        return `<div class="product-card">
            <img src="${p.img}" onclick="viewProductDetail('${p.id}')">
            <h4>${p.name}</h4>
            <div class="product-card-footer">
                <span class="product-price">₭${p.price.toLocaleString()}</span>
                ${btnHTML}
            </div>
        </div>`;
    }).join('');
}
function toggleMobileMenu() {
    const navLink = document.getElementById('navLink');
    navLink.classList.toggle('active');
    
    // เพิ่มการจัดการปุ่ม Toggle ให้เปลี่ยนไอคอน (ถ้ามี)
    const toggleBtn = document.querySelector('.menu-toggle');
    if(navLink.classList.contains('active')) {
        toggleBtn.innerHTML = '✕'; // เปลี่ยนเป็นกากบาทเมื่อเปิด
    } else {
        toggleBtn.innerHTML = '☰'; // เปลี่ยนกลับเป็นขีด
    }
}

// ปิดเมนูเมื่อกดเลือกหน้า
const originalNavigate = navigate;
navigate = function(pageId) {
    originalNavigate(pageId);
    const navLink = document.getElementById('navLink');
    const toggleBtn = document.querySelector('.menu-toggle');
    navLink.classList.remove('active');
    toggleBtn.innerHTML = '☰';
}

function renderShopProducts(productsToRender) {
    const grid = document.getElementById('shop-products-grid');
    if(!grid) return;
    if(productsToRender.length === 0) { grid.innerHTML = `<div style="grid-column: span 3; text-align: center; padding: 48px 0;">ບໍ່ພົບສິນຄ້າ</div>`; return; }
    
    // 🆕 เพิ่มการแสดงคำว่า สินค้าหมด หาก stock <= 0
    grid.innerHTML = productsToRender.map(p => {
        let stockVal = p.stock || 0;
        let btnHTML = stockVal > 0 ? `<button onclick="addToCart('${p.id}')" class="btn-add">ເພີ່ມເຂົ້າກະຕ່າ</button>` : `<button disabled class="btn-add" style="background:#ccc;">ສິນຄ້າໝົດ</button>`;
        return `<div class="product-card">
            <img src="${p.img}" onclick="viewProductDetail('${p.id}')">
            <h4>${p.name}</h4>
            <div class="product-card-footer">
                <span class="product-price">₭${p.price.toLocaleString()}</span>
                ${btnHTML}
            </div>
        </div>`;
    }).join('');
}

function applyFilters() {
    const searchVal = document.getElementById('search-input').value.toLowerCase().trim();
    const checked = Array.from(document.querySelectorAll('#category-filters input:checked')).map(cb => cb.value);
    const filtered = products.filter(p => (p.name.toLowerCase().includes(searchVal)) && (checked.length === 0 || checked.includes(p.category)));
    renderShopProducts(filtered);
}

function filterCategory(cat) {
    navigate('shop');
    document.querySelectorAll('#category-filters input').forEach(cb => cb.checked = (cb.value === cat));
    applyFilters();
}

function viewProductDetail(id) {
    const p = products.find(x => x.id == id);
    if(!p) return;
    let stockVal = p.stock || 0;
    
    // 🆕 แจ้งให้ลูกค้าทราบว่าสินค้าเหลือเท่าไหร่
    let stockInfo = stockVal > 0 
        ? `<p style="font-size:14px; margin-bottom:10px; color:#2e7d32;">✅ ມີສິນຄ້າໃນສະຕັອກ: <b>${stockVal}</b> ຊິ້ນ</p>`
        : `<p style="font-size:14px; margin-bottom:10px; color:#ff4d4f;">❌ ສິນຄ້າໝົດສະຕັອກ</p>`;
        
    let btnDisabled = stockVal > 0 ? '' : 'disabled';
    let btnStyle = stockVal > 0 ? '' : 'background-color:#ccc; cursor:not-allowed; border-color:#ccc;';

    document.getElementById('product-detail-container').innerHTML = `
    <div class="detail-card">
        <div class="detail-img-side"><img src="${p.img}" class="detail-main-img"></div>
        <div class="detail-info-side">
            <h2 class="detail-title">${p.name}</h2>
            <span class="detail-price">₭${p.price.toLocaleString()}</span>
            <p class="detail-desc">${p.desc}</p>
            ${stockInfo}
            <div class="qty-selector">
                <label>ຈຳນວນ:</label>
                <input type="number" id="detail-qty" value="1" min="1" max="${stockVal}" class="input-qty" ${btnDisabled}>
            </div>
            <button onclick="addWithQty('${p.id}')" class="btn btn-primary btn-full" style="${btnStyle}" ${btnDisabled}>
                ${stockVal > 0 ? 'ເພີ່ມເຂົ້າກະຕ່າ' : 'ສິນຄ້າໝົດແລ້ວ'}
            </button>
        </div>
    </div>`;
    navigate('product');
}

// 🆕 เพิ่มการเช็ค Stock ก่อนเพิ่มสินค้าลงตะกร้า
function addToCart(id) {
    const p = products.find(x => x.id == id); 
    const stockLimit = p.stock || 0;
    const existing = cart.find(i => i.product.id == id);
    let currentQtyInCart = existing ? existing.qty : 0;
    
    if (currentQtyInCart + 1 > stockLimit) {
        alert(`ຂໍອະໄພ, ສິນຄ້ານີ້ເຫຼືອພຽງ ${stockLimit} ຊິ້ນເທົ່ານັ້ນ!`);
        return;
    }

    if (existing) existing.qty += 1; else cart.push({ product: p, qty: 1 });
    updateCartIcon(); renderCart(); alert(`ເພີ່ມ ${p.name} ແລ້ວ!`);
}

function addWithQty(id) {
    const qty = parseInt(document.getElementById('detail-qty').value) || 1;
    const p = products.find(x => x.id == id); 
    const stockLimit = p.stock || 0;
    const existing = cart.find(i => i.product.id == id);
    let currentQtyInCart = existing ? existing.qty : 0;

    if (currentQtyInCart + qty > stockLimit) {
        alert(`ຂໍອະໄພ, ສິນຄ້ານີ້ເຫຼືອພຽງ ${stockLimit} ຊິ້ນເທົ່ານັ້ນ!`);
        return;
    }

    if (existing) existing.qty += qty; else cart.push({ product: p, qty });
    updateCartIcon(); renderCart(); alert(`ເພີ່ມ ${p.name} ຈຳນວນ ${qty} ຊິ້ນແລ້ວ!`);
}

function updateCartQty(id, newQty) {
    const qty = parseInt(newQty);
    const p = products.find(x => x.id == id);
    const stockLimit = p.stock || 0;

    if (qty > stockLimit) {
        alert(`ຂໍອະໄພ, ສິນຄ້ານີ້ເຫຼືອພຽງ ${stockLimit} ຊິ້ນເທົ່ານັ້ນ!`);
        renderCart(); // คืนค่า input กลับ
        return;
    }

    if (qty <= 0) cart = cart.filter(i => i.product.id != id); 
    else { const item = cart.find(i => i.product.id == id); if (item) item.qty = qty; }
    updateCartIcon(); renderCart();
}

function updateCartIcon() { 
    document.getElementById('cart-icon-count').innerText = cart.reduce((acc, i) => acc + i.qty, 0); 
}

function renderCart() {
    const container = document.getElementById('cart-items-container'); 
    const totalSpan = document.getElementById('cart-total-price');
    if(!container) return;
    if (cart.length === 0) { container.innerHTML = `<div style="text-align:center; padding:32px 0;">ບໍ່ມີສິນຄ້າໃນກະຕ່າ</div>`; totalSpan.innerText = "0"; return; }
    
    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.product.price * item.qty; total += itemTotal;
        const stockLimit = item.product.stock || 0;
        return `<div class="cart-item">
            <div class="item-prod-side"><img src="${item.product.img}" class="cart-item-img"><div class="cart-item-info"><h4>${item.product.name}</h4><span style="font-size:12px; color:#2e7d32;">ສະຕັອກ: ${stockLimit}</span></div></div>
            <div class="item-qty-side"><input type="number" value="${item.qty}" min="0" max="${stockLimit}" onchange="updateCartQty('${item.product.id}', this.value)" class="input-qty"></div>
            <div class="item-price-side">₭${itemTotal.toLocaleString()}</div>
        </div>`;
    }).join('');
    totalSpan.innerText = total.toLocaleString();
}

function goToCheckout() {
    if(cart.length === 0) { alert("ກະລຸນາເລືອກສິນຄ້າກ່ອນ"); return; }
    document.getElementById('checkout-total-price-summary').innerText = cart.reduce((acc, i) => acc + (i.product.price * i.qty), 0).toLocaleString();
    navigate('checkout');
}

// ບັນທຶກອໍເດີ້ ລົງໃນ Firebase Firestore ພ້ອມຕັດສະຕັອກ 🆕
function submitOrder(event) {
    event.preventDefault();
    const fileInput = document.getElementById('slip-upload');
    if(!fileInput.files || fileInput.files.length === 0) { alert("ກະລຸນາອັບໂຫຼດສະລິບ"); return; }
    
    const submitBtn = document.getElementById('btn-submit-order');
    submitBtn.innerText = "ກຳລັງບັນທຶກ...";
    submitBtn.disabled = true;

    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    const total = cart.reduce((acc, i) => acc + (i.product.price * i.qty), 0);
    const itemsSummary = cart.map(item => `${item.product.name} (x${item.qty})`).join(", ");
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64Image = e.target.result;
        const newId = "ORD-" + Date.now().toString().slice(-6); 
        
        const newOrder = {
            id: newId, 
            customer: name, 
            phone: phone, 
            address: address,
            product: itemsSummary, 
            status: 'pending',
            price: total, 
            courier: '-', 
            trackingNo: '',
            timeline: { paid: true, verified: false, packed: false, shipped: false },
            slipImage: base64Image, 
            adminReceipt: '',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        db.collection("orders").doc(newId).set(newOrder).then(() => {
            
            // 📉 คำสั่งตัดสต๊อกทันทีที่ลูกค้าสั่งซื้อสำเร็จ 🆕
            cart.forEach(item => {
                db.collection("products").doc(item.product.id).update({
                    stock: firebase.firestore.FieldValue.increment(-item.qty)
                });
            });

            sessionStorage.setItem('userPhone', phone);
            alert(`🎉 ສັ່ງຊື້ສຳເລັດແລ້ວ! ລະບົບໄດ້ເຂົ້າສູ່ລະບົບໃຫ້ທ່ານອັດຕະໂນມັດ.`);
            cart = []; updateCartIcon(); 
            document.getElementById('checkout-form').reset();
            submitBtn.innerText = "ຢືນຢັນການສັ່ງຊື້"; submitBtn.disabled = false;
            
            // โหลดข้อมูลสินค้าใหม่เพื่ออัปเดตสต๊อกปัจจุบัน
            db.collection("products").get().then((snapshot) => {
                products = [];
                snapshot.forEach(doc => products.push(doc.data()));
                renderFeaturedProducts();
                renderShopProducts(products);
            });

            navigate('my-orders');
        }).catch(err => {
            console.error(err);
            alert("ເກີດຂໍ້ຜິດພາດ: " + err.message);
            submitBtn.innerText = "ຢືນຢັນການສັ່ງຊື້"; submitBtn.disabled = false;
        });
    };
    reader.readAsDataURL(fileInput.files[0]);
}