const MENU = [
  { id: "poha", name: "Poha", price: 99, category: "breakfast", image: "images/breakfast1.jpeg", blurb: "Flattened rice, peanuts, lemon" },
  { id: "idli", name: "Idli", price: 150, category: "breakfast", image: "images/breakfast2.jpeg", blurb: "Steamed cakes, coconut chutney" },
  { id: "dosa", name: "Masala dosa", price: 189, category: "breakfast", image: "images/breakfast3.jpg", blurb: "Crisp dosa, spiced potato" },
  { id: "naan", name: "Paneer naan platter", price: 360, category: "lunch", image: "images/lunch1.jpeg", blurb: "Tandoor paneer, butter naan" },
  { id: "thali", name: "Punjabi thali", price: 445, category: "lunch", image: "images/lunch2.jpeg", blurb: "Dal, sabzi, roti, rice, raita" },
  { id: "dal", name: "Dal makhani bowl", price: 295, category: "lunch", image: "images/lunch3.jpeg", blurb: "Slow-cooked black lentils" },
  { id: "special", name: "Special thali", price: 599, category: "dinner", image: "images/dinner1.jpeg", blurb: "Chef's tasting plates" },
  { id: "biryani", name: "Dum biryani", price: 350, category: "dinner", image: "images/dinner2.jpeg", blurb: "Saffron rice, raita, gravy" },
  { id: "tandoor", name: "Tandoori platter", price: 520, category: "dinner", image: "images/dinner3.jpeg", blurb: "Grill, chutneys, laccha onion" }
];

const cart = new Map();
let activeFilter = "all";

const menuGrid = document.getElementById("menuGrid");
const cartCount = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartSummary = document.getElementById("cartSummary");
const modal = document.getElementById("modal");
const chatPanel = document.getElementById("chatPanel");
const chatLog = document.getElementById("chatLog");

function rupees(n) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  document.getElementById("toasts").appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function showModal(title, body) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").textContent = body;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

function hideModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function renderMenu() {
  const dishes = MENU.filter((item) => activeFilter === "all" || item.category === activeFilter);
  menuGrid.innerHTML = dishes.map((item) => `
    <article class="dish">
      <img src="${item.image}" alt="${escapeHtml(item.name)}">
      <div class="dish-body">
        <h3>${escapeHtml(item.name)}</h3>
        <p class="dish-meta">${escapeHtml(item.blurb)}</p>
        <div class="dish-row">
          <span class="price">${rupees(item.price)}</span>
          <button type="button" data-add="${item.id}">Add to order</button>
        </div>
      </div>
    </article>
  `).join("");
}

function cartQty() {
  return [...cart.values()].reduce((sum, item) => sum + item.qty, 0);
}

function cartTotals() {
  const subtotal = [...cart.values()].reduce((sum, item) => sum + item.qty * item.price, 0);
  const gst = Math.round(subtotal * 0.05);
  return { subtotal, gst, total: subtotal + gst };
}

function renderCart() {
  cartCount.textContent = String(cartQty());
  if (!cart.size) {
    cartItems.innerHTML = `<p class="empty-cart">Your order is empty. Add a dish from the menu.</p>`;
    cartSummary.hidden = true;
    return;
  }

  cartItems.innerHTML = [...cart.values()].map((item) => `
    <div class="cart-line">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <div class="price">${rupees(item.price * item.qty)}</div>
      </div>
      <div class="qty">
        <button class="qty-btn" type="button" data-change="${item.id}" data-delta="-1">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" type="button" data-change="${item.id}" data-delta="1">+</button>
      </div>
    </div>
  `).join("");

  const totals = cartTotals();
  document.getElementById("subtotal").textContent = rupees(totals.subtotal);
  document.getElementById("gst").textContent = rupees(totals.gst);
  document.getElementById("total").textContent = rupees(totals.total);
  cartSummary.hidden = false;
}

function addToCart(id) {
  const dish = MENU.find((item) => item.id === id);
  const existing = cart.get(id);
  cart.set(id, { ...dish, qty: existing ? existing.qty + 1 : 1 });
  renderCart();
  toast(`${dish.name} added to your order`);
}

function changeQty(id, delta) {
  const item = cart.get(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart.delete(id);
  renderCart();
}

function bookingId() {
  return `SS-${Math.floor(1000 + Math.random() * 9000)}`;
}

function replyToChat(text) {
  const lower = text.toLowerCase();
  if (/(hi|hello|hey)\b/.test(lower)) {
    return "Hello from SavorySpot. I can help with hours, the menu, reservations, or orders.";
  }
  if (/(hour|open|close|time)/.test(lower)) {
    return "We are open daily from 8:00 AM to 11:00 PM. Last seating is 10:30 PM.";
  }
  if (/(where|location|address|bandra|mumbai)/.test(lower)) {
    return "You’ll find us in Bandra East, Mumbai. Parking is available beside the entrance.";
  }
  if (/(menu|food|veg|dish|biryani|breakfast)/.test(lower)) {
    return "Breakfast, lunch, and dinner are on the menu. Most plates are vegetarian. Tap Add to order, or tell me a dish you like.";
  }
  if (/(book|reserv|table|seat)/.test(lower)) {
    return "I can take a table request. Scroll to Reserve, or share a date, time, and guest count here.";
  }
  if (/(order|deliver|pickup|cart)/.test(lower)) {
    return "Add dishes to your order, then checkout for dine-in or 25-minute pickup. We confirm on this page instantly.";
  }
  if (/(price|cost|how much)/.test(lower)) {
    return "Plates start at ₹99. The special thali is ₹599. GST is 5% at checkout.";
  }
  return "Thanks for writing in. A host has this note. For a guaranteed table, use Reserve — you’ll get a booking ID immediately.";
}

function addBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  chatLog.appendChild(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function openChat() {
  chatPanel.hidden = false;
  if (!chatLog.childElementCount) {
    addBubble("host", "Welcome to SavorySpot. Ask about hours, the menu, or a table — I’ll reply here.");
  }
}

document.getElementById("filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter-btn").forEach((el) => el.classList.toggle("is-active", el === button));
  renderMenu();
});

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(button.dataset.add);
});

document.getElementById("cartBtn").addEventListener("click", () => {
  cartDrawer.classList.add("is-open");
  cartDrawer.setAttribute("aria-hidden", "false");
});

document.getElementById("closeCart").addEventListener("click", () => {
  cartDrawer.classList.remove("is-open");
  cartDrawer.setAttribute("aria-hidden", "true");
});

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) {
    cartDrawer.classList.remove("is-open");
  }
  const button = event.target.closest("[data-change]");
  if (!button) return;
  changeQty(button.dataset.change, Number(button.dataset.delta));
});

document.getElementById("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const id = bookingId();
  const totals = cartTotals();
  const lines = [...cart.values()].map((item) => `${item.qty} × ${item.name}`).join(", ");
  const fulfillment = data.get("fulfillment") === "pickup" ? "Pickup in about 25 minutes" : "We’ll send it to your table";
  showModal(
    "Order confirmed",
    `Hi ${data.get("name")}, your order ${id} is in.\n\n${lines}\nTotal: ${rupees(totals.total)}\n${fulfillment}.\n\nWe’ll text ${data.get("phone")} if the kitchen needs anything.`
  );
  cart.clear();
  renderCart();
  event.target.reset();
  cartDrawer.classList.remove("is-open");
  toast(`Kitchen replied: order ${id} confirmed`);
});

const reserveForm = document.getElementById("reserveForm");
const dateInput = reserveForm.elements.date;
dateInput.min = new Date().toISOString().split("T")[0];

reserveForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(reserveForm);
  const chosen = new Date(`${data.get("date")}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (chosen < today) {
    toast("Please pick today or a future date");
    return;
  }
  const id = bookingId();
  const occasion = data.get("occasion") ? ` Occasion: ${data.get("occasion")}.` : "";
  const message = `You're booked, ${data.get("name")}.\n\nBooking ${id}\n${data.get("guests")} guests · ${data.get("date")} · ${data.get("time")}${occasion}\n\nA confirmation is also headed to ${data.get("email")}. Arrive 10 minutes early and quote this ID at the door.`;
  localStorage.setItem("savoryspot-booking", JSON.stringify({ id, message }));
  showModal("Table reserved", message);
  toast(`Host replied: table ${id} is held`);
  reserveForm.reset();
  dateInput.min = new Date().toISOString().split("T")[0];
});

document.getElementById("contactForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const reply = document.getElementById("latestReply");
  reply.hidden = false;
  reply.innerHTML = `<strong>Reply from SavorySpot</strong><p>Hi ${escapeHtml(data.get("name"))}, we received your note and will follow up at ${escapeHtml(data.get("email"))} within 2 hours. If you need a table tonight, reserve above and you’ll get an ID instantly.</p>`;
  showModal(
    "Message received",
    `Thanks, ${data.get("name")}. Our host team just replied on this page and will also write to ${data.get("email")}.`
  );
  toast("SavorySpot replied to your message");
  event.target.reset();
});

document.getElementById("chatToggle").addEventListener("click", openChat);
document.getElementById("closeChat").addEventListener("click", () => {
  chatPanel.hidden = true;
});

document.getElementById("chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;
  addBubble("user", text);
  input.value = "";
  setTimeout(() => addBubble("host", replyToChat(text)), 450);
});

document.getElementById("navToggle").addEventListener("click", () => {
  const nav = document.getElementById("siteNav");
  const open = nav.classList.toggle("is-open");
  document.getElementById("navToggle").setAttribute("aria-expanded", String(open));
});

document.getElementById("siteNav").addEventListener("click", (event) => {
  if (event.target.tagName === "A") {
    document.getElementById("siteNav").classList.remove("is-open");
  }
});

document.getElementById("closeModal").addEventListener("click", hideModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) hideModal();
});

renderMenu();
renderCart();
