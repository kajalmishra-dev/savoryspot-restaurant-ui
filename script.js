(function () {
  "use strict";

  var toastTimer;

  function $(id) {
    return document.getElementById(id);
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
        box.textContent = "Table held - " + id + ". " + data.get("guests") +
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
    if (/(hi|hello|hey|namaste)/.test(q)) return "Namaste. SavorySpot is a pure vegetarian dining house. Hours, the thali, or a table?";
    if (/(hour|open|close)/.test(q)) return "Daily 8:00 AM to 11:00 PM. Last seating 10:30 PM.";
    if (/(where|address|bandra)/.test(q)) return "14 Government Colony Road, Bandra East, Mumbai 400051.";
    if (/(meat|chicken|fish|egg|non.?veg|mutton)/.test(q)) return "We are 100% vegetarian. No meat, fish or egg. Jain cooking on request.";
    if (/(jain|onion|garlic)/.test(q)) return "Yes - Jain plates with no onion or garlic. Mention it when you reserve.";
    if (/(menu|thali|food|veg|paneer|idli|kebab|naan)/.test(q)) return "House plates: veg thali, paneer makhani, veg kebab and naan, idli sambar vada. Everything is vegetarian.";
    if (/(book|reserv|table)/.test(q)) return "Use Reserve a table. You’ll get a booking ID on this page.";
    if (/(order|pickup)/.test(q)) return "We don’t take online orders. Reserve a table and dine with us.";
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
      if (hostLog && !hostLog.childElementCount) bubble("host", "Namaste. Pure vegetarian kitchen - ask about the brass thali or a table tonight.");
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
})();
