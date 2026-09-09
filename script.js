(function () {
  "use strict";

  var toastTimer;

  function $(id) {
    return document.getElementById(id);
  }

  function uid() {
    return "SS-" + Math.floor(1000 + Math.random() * 9000);
  }

  function inbox() {
    return ["kajal", "mishra", "027", "@", "outlook", ".com"].join("");
  }

  function showToast(text) {
    var el = $("toast");
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2600);
  }

  function setBusy(form, busy) {
    var btn = form.querySelector("button[type='submit']");
    if (btn) btn.disabled = busy;
  }

  function here(flag, value) {
    var url = new URL(location.href);
    url.searchParams.set(flag, value || "1");
    return url.toString();
  }

  function sendForm(form) {
    return fetch("https://formsubmit.co/ajax/" + inbox(), {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    }).then(function (res) {
      return res.json().then(function (body) {
        var ok = body && (body.success === true || body.success === "true");
        if (!res.ok || !ok) {
          throw new Error((body && body.message) || "Send failed");
        }
        return body;
      });
    });
  }

  function fallbackPost(form) {
    form.action = "https://formsubmit.co/" + inbox();
    form.method = "POST";
    form.submit();
  }

  function activationNote(error) {
    var text = error && error.message ? String(error.message) : "";
    if (/activat|confirm|verify|inbox|own this email/i.test(text)) {
      return "Open Outlook (and Junk) for a FormSubmit mail, click the confirm link once, then send again.";
    }
    return "";
  }

  var reserveForm = $("reserveForm");
  var reserveBox = $("reserveMsg");
  if (reserveForm && reserveForm.elements.date) {
    reserveForm.elements.date.min = new Date().toISOString().split("T")[0];
  }

  var query = new URLSearchParams(location.search);
  if (query.get("booked") && reserveBox) {
    reserveBox.hidden = false;
    reserveBox.textContent = "Table held - " + query.get("booked") + ". Quote this ID at the door.";
    showToast("Reservation " + query.get("booked"));
    history.replaceState({}, "", location.pathname + "#reserve");
  }
  if (query.get("wrote") && $("contactMsg")) {
    $("contactMsg").hidden = false;
    $("contactMsg").textContent = "Thank you. We have your note.";
    showToast("Message sent");
    history.replaceState({}, "", location.pathname + "#visit");
  }

  if (reserveForm) {
    reserveForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!reserveForm.reportValidity()) return;
      var id = uid();
      if ($("reserveId")) $("reserveId").value = id;
      if ($("reserveSubject")) $("reserveSubject").value = "SavorySpot reservation " + id;
      if ($("reserveNext")) $("reserveNext").value = here("booked", id);
      setBusy(reserveForm, true);
      sendForm(reserveForm).then(function () {
        if (reserveBox) {
          reserveBox.hidden = false;
          reserveBox.textContent = "Table held - " + id + ". " +
            reserveForm.elements.guests.value + " guests on " +
            reserveForm.elements.date.value + " at " +
            reserveForm.elements.time.value + ". Quote this ID at the door.";
        }
        showToast("Reservation " + id);
        reserveForm.reset();
        reserveForm.elements.date.min = new Date().toISOString().split("T")[0];
        setBusy(reserveForm, false);
      }).catch(function (error) {
        var note = activationNote(error);
        if (note && reserveBox) {
          reserveBox.hidden = false;
          reserveBox.textContent = note;
          setBusy(reserveForm, false);
          return;
        }
        fallbackPost(reserveForm);
      });
    });
  }

  var contactForm = $("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      if ($("contactNext")) $("contactNext").value = here("wrote", "1");
      var name = contactForm.elements.name.value;
      setBusy(contactForm, true);
      sendForm(contactForm).then(function () {
        var box = $("contactMsg");
        if (box) {
          box.hidden = false;
          box.textContent = "Thank you, " + name + ". We have your note.";
        }
        showToast("Message sent");
        contactForm.reset();
        setBusy(contactForm, false);
      }).catch(function (error) {
        var note = activationNote(error);
        if (note && $("contactMsg")) {
          $("contactMsg").hidden = false;
          $("contactMsg").textContent = note;
          setBusy(contactForm, false);
          return;
        }
        fallbackPost(contactForm);
      });
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
