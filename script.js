(function () {
  "use strict";

  var cart = {};
  var toastTimer;

  function $(id) {
    return document.getElementById(id);
  }

  function rupees(n) {
    return "₹" + Number(n).toLocaleString("en-IN");
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function uid() {
    return "SS-" + Math.floor(1000 + Math.random() * 9000);
  }

  function showToast(text) {
    var el = $("toast");
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  }

  function cartQty() {
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + cart[id].qty;
    }, 0);
  }

  function cartTotal() {
    var sub = Object.keys(cart).reduce(function (sum, id) {
      return sum + cart[id].qty * cart[id].price;
    }, 0);
    return Math.round(sub * 1.05);
  }

  function renderCart() {
    var count = $("cartCount");
    var list = $("cartList");
    var form = $("checkoutForm");
    var total = $("cartTotal");
    if (count) count.textContent = String(cartQty());
    if (!list) return;

    var ids = Object.keys(cart);
    if (!ids.length) {
      list.innerHTML = '<p class="empty">Your order is empty.</p>';
      if (form) form.hidden = true;
      return;
    }

    list.innerHTML = ids.map(function (id) {
      var item = cart[id];
      return '<div class="line"><div><strong>' + escapeText(item.name) +
        "</strong><div>" + rupees(item.price * item.qty) +
        '</div></div><div class="qty">' +
        '<button type="button" data-id="' + escapeText(id) + '" data-d="-1">−</button>' +
        "<span>" + item.qty + "</span>" +
        '<button type="button" data-id="' + escapeText(id) + '" data-d="1">+</button></div></div>';
    }).join("");
    if (total) total.textContent = rupees(cartTotal());
    if (form) form.hidden = false;
  }

  function addItem(id, name, price) {
    if (!id) return;
    if (!cart[id]) cart[id] = { name: name, price: Number(price) || 0, qty: 0 };
    cart[id].qty += 1;
    renderCart();
    showToast(name + " added");
  }

  document.addEventListener("click", function (event) {
    var card = event.target.closest("[data-id]");
    if (card && event.target.tagName === "BUTTON" && !event.target.dataset.d) {
      addItem(card.getAttribute("data-id"), card.getAttribute("data-name"), card.getAttribute("data-price"));
      return;
    }
    var stepper = event.target.closest("[data-d]");
    if (stepper) {
      var item = cart[stepper.getAttribute("data-id")];
      if (!item) return;
      item.qty += Number(stepper.getAttribute("data-d"));
      if (item.qty <= 0) delete cart[stepper.getAttribute("data-id")];
      renderCart();
    }
  });

  var drawer = $("drawer");
  var cartBtn = $("cartBtn");
  var closeDrawer = $("closeDrawer");
  if (cartBtn && drawer) {
    cartBtn.addEventListener("click", function () { drawer.hidden = false; });
  }
  if (closeDrawer && drawer) {
    closeDrawer.addEventListener("click", function () { drawer.hidden = true; });
    drawer.addEventListener("click", function (event) {
      if (event.target === drawer) drawer.hidden = true;
    });
  }

  var checkout = $("checkoutForm");
  if (checkout) {
    checkout.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!Object.keys(cart).length) return;
      var data = new FormData(checkout);
      var id = uid();
      var total = cartTotal();
      var names = Object.keys(cart).map(function (key) {
        return cart[key].qty + " × " + cart[key].name;
      }).join(", ");
      var list = $("cartList");
      cart = {};
      renderCart();
      if (list) {
        list.innerHTML = '<p class="form-msg"><strong>Order ' + id + " confirmed.</strong> " +
          escapeText(data.get("name")) + ", " + escapeText(names) + ". Total " + rupees(total) +
          ". We’ll use " + escapeText(data.get("phone")) + " if the kitchen needs you.</p>";
      }
      checkout.reset();
      showToast("Kitchen confirmed " + id);
    });
  }

  var reserveForm = $("reserveForm");
  if (reserveForm && reserveForm.elements.date) {
    reserveForm.elements.date.min = new Date().toISOString().split("T")[0];
    reserveForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!reserveForm.reportValidity()) return;
      var data = new FormData(reserveForm);
      var id = uid();
      var box = $("reserveMsg");
      if (box) {
        box.hidden = false;
        box.textContent = "Table held — " + id + ". " + data.get("guests") +
          " guests on " + data.get("date") + " at " + data.get("time") +
          ". Quote this ID at the door. A note is going to " + data.get("email") + ".";
      }
      showToast("Reservation " + id);
      reserveForm.reset();
      reserveForm.elements.date.min = new Date().toISOString().split("T")[0];
    });
  }

  var contactForm = $("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var data = new FormData(contactForm);
      var box = $("contactMsg");
      if (box) {
        box.hidden = false;
        box.textContent = "Host desk: Hello " + data.get("name") +
          ", we have your note and will write to " + data.get("email") +
          " within two hours. For tonight, reserve above.";
      }
      showToast("The host replied");
      contactForm.reset();
    });
  }

  function reply(text) {
    var q = String(text).toLowerCase();
    if (/(hi|hello|hey|namaste)/.test(q)) return "Namaste. SavorySpot is 100% pure veg. Hours, menu, or a table?";
    if (/(hour|open|close)/.test(q)) return "Daily 8:00 AM to 11:00 PM. Last seating 10:30 PM.";
    if (/(where|address|bandra)/.test(q)) return "14 Government Colony Road, Bandra East, Mumbai 400051.";
    if (/(meat|chicken|fish|egg|non.?veg|mutton)/.test(q)) return "We are 100% pure vegetarian. No meat, fish or egg. Jain thali without onion and garlic on request.";
    if (/(jain|onion|garlic)/.test(q)) return "Yes — Jain cooking with no onion or garlic. Tell us when you reserve or order.";
    if (/(menu|thali|biryani|food|veg|paneer|poha|idli)/.test(q)) return "Pure veg menu: kanda poha, ragi idli, paneer tikka masala, Punjabi thali, special brass thali, veg dum biryani.";
    if (/(book|reserv|table)/.test(q)) return "Use Reserve a table. You’ll get a booking ID on this page.";
    if (/(order|pickup)/.test(q)) return "Add dishes from the menu, then open Order.";
    return "Noted. Reserve on this page, or call +91 22 3561 4400.";
  }

  var hostBtn = $("hostBtn");
  var hostPanel = $("hostPanel");
  var hostLog = $("hostLog");
  var hostForm = $("hostForm");
  function bubble(role, text) {
    if (!hostLog) return;
    var el = document.createElement("div");
    el.className = "bubble " + role;
    el.textContent = text;
    hostLog.appendChild(el);
    hostLog.scrollTop = hostLog.scrollHeight;
  }
  if (hostBtn && hostPanel) {
    hostBtn.addEventListener("click", function () {
      hostPanel.hidden = false;
      if (hostLog && !hostLog.childElementCount) bubble("host", "Namaste. Pure veg kitchen — ask about the thali, biryani, or a table.");
    });
  }
  var closeHost = $("closeHost");
  if (closeHost && hostPanel) {
    closeHost.addEventListener("click", function () { hostPanel.hidden = true; });
  }
  if (hostForm) {
    hostForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = $("hostInput");
      if (!input) return;
      var text = input.value.trim();
      if (!text) return;
      bubble("user", text);
      input.value = "";
      setTimeout(function () { bubble("host", reply(text)); }, 350);
    });
  }

  var menuBtn = $("menuBtn");
  var nav = $("nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") nav.classList.remove("is-open");
    });
  }

  var topbar = $("topbar");
  if (topbar) {
    var onScroll = function () {
      topbar.classList.toggle("is-on", window.scrollY > 40);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  renderCart();
})();
