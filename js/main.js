(function () {
  "use strict";
  var F = window.FARM || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k]; // only used with fixed, trusted SVG strings
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  /* ---------- Broken image fallback ---------- */
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG") {
      t.removeAttribute("srcset");
      t.style.visibility = "hidden";
    }
  }, true);

  /* ---------- WhatsApp helper ---------- */
  var waNumber = String(F.whatsapp || "").replace(/\D/g, "");
  function waLink(message) {
    return waNumber ? "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(message) : null;
  }
  $$("[data-wa]").forEach(function (a) {
    var link = waLink(a.getAttribute("data-wa"));
    if (link) { a.href = link; a.target = "_blank"; a.rel = "noopener"; }
  });

  /* ---------- Header ---------- */
  var header = $(".site-header");
  var toggle = $(".nav-toggle");
  function onScrollHeader() { header.classList.toggle("solid", window.scrollY > 40); }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  toggle.addEventListener("click", function () {
    var open = header.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$(".nav a").forEach(function (a) {
    a.addEventListener("click", function () {
      header.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Hero slideshow ---------- */
  (function () {
    var hero = $(".hero");
    var slides = $$(".slide", hero);
    if (!slides.length) return;
    var caption = $("#slideCaption");
    var dotsBox = $(".dots", hero);
    var navBox = $(".slide-nav", hero);
    var DELAY = 6500, FADE = 1500;
    var idx = 0, timer = null, userPaused = false, hoverPaused = false, busy = false;

    var dots = slides.map(function (_, i) {
      var d = el("button", { "class": "dot", role: "tab", "aria-label": "Photo " + (i + 1) + " of " + slides.length, "aria-selected": i === 0 });
      d.addEventListener("click", function () { go(i, true); });
      dotsBox.appendChild(d);
      return d;
    });

    var pauseBtn = el("button", { "class": "arrow", "aria-label": "Pause slideshow", html: '<svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>' });
    navBox.appendChild(pauseBtn);
    pauseBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      pauseBtn.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
      pauseBtn.innerHTML = userPaused
        ? '<svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>';
      schedule();
    });

    function ready(img) {
      if (img.complete && img.naturalWidth) return Promise.resolve();
      img.loading = "eager";
      var wait = img.decode ? img.decode().catch(function () {}) : Promise.resolve();
      return Promise.race([wait, new Promise(function (r) { setTimeout(r, 2500); })]);
    }

    function go(n, manual) {
      n = (n + slides.length) % slides.length;
      if (n === idx || busy) return;
      busy = true;
      ready($("img", slides[n])).then(function () {
        var prev = slides[idx], next = slides[n];
        slides.forEach(function (s) { if (s !== prev && s !== next) s.classList.remove("leaving", "active"); });
        prev.classList.remove("active");
        prev.classList.add("leaving");
        next.classList.remove("leaving");
        next.classList.add("active");
        idx = n;
        dots.forEach(function (d, i) { d.setAttribute("aria-selected", i === n); });
        caption.textContent = next.getAttribute("data-caption") || "";
        setTimeout(function () { if (prev !== slides[idx]) prev.classList.remove("leaving"); busy = false; }, FADE);
        schedule();
      });
    }

    function schedule() {
      clearTimeout(timer);
      if (reduceMotion || userPaused || hoverPaused || document.hidden) return;
      timer = setTimeout(function () { go(idx + 1); }, DELAY);
    }

    $$(".arrow[data-dir]", hero).forEach(function (b) {
      b.addEventListener("click", function () { go(idx + Number(b.getAttribute("data-dir")), true); });
    });

    var controls = $(".hero-controls", hero);
    [controls].forEach(function (c) {
      c.addEventListener("mouseenter", function () { hoverPaused = true; schedule(); });
      c.addEventListener("mouseleave", function () { hoverPaused = false; schedule(); });
      c.addEventListener("focusin", function () { hoverPaused = true; schedule(); });
      c.addEventListener("focusout", function () { hoverPaused = false; schedule(); });
    });
    document.addEventListener("visibilitychange", schedule);

    // Swipe on touch screens
    var sx = null;
    hero.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1), true);
    }, { passive: true });

    // After the first image has painted, quietly fetch the rest, then start rotating
    function warm() {
      slides.forEach(function (s) { $("img", s).loading = "eager"; });
      schedule();
    }
    if (document.readyState === "complete") warm();
    else window.addEventListener("load", warm);
  })();

  /* ---------- Icons ---------- */
  var ICONS = {
    crop: '<svg viewBox="0 0 24 24"><path d="M12 22V9M12 9c-2-1-3-3-3-5 2 0 3 1 3 3M12 9c2-1 3-3 3-5-2 0-3 1-3 3M12 15c-2-1-3-3-3-5M12 15c2-1 3-3 3-5"/></svg>',
    livestock: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9H3zM9 20v-6h6v6"/></svg>',
    produce: '<svg viewBox="0 0 24 24"><path d="M4 10h16l-2 10H6zM8 10l3-6M16 10l-3-6"/></svg>',
    photo: '<svg viewBox="0 0 24 24"><path d="M3 16l4-8 4 6 3-4 7 6z"/></svg>'
  };

  /* ---------- Responsive image builder ---------- */
  function picture(base, widths, alt, sizes) {
    var srcset = widths.map(function (w) { return base + "-" + w + ".webp " + w + "w"; }).join(", ");
    var mid = widths[Math.min(1, widths.length - 1)];
    return el("img", {
      src: base + "-" + mid + ".webp", srcset: srcset, sizes: sizes, alt: alt || "",
      loading: "lazy", decoding: "async"
    });
  }

  /* ---------- Products ---------- */
  (function () {
    var grid = $("#productGrid");
    var list = F.products || [];
    if (!list.length) {
      grid.appendChild(el("p", { "class": "empty", text: "Our product list is coming soon." }));
      return;
    }
    list.forEach(function (p) {
      var media = el("div", { "class": "product-media" });
      if (p.image && p.image.base) {
        var img = picture(p.image.base, p.image.widths, p.name, "(min-width: 900px) 280px, 90vw");
        img.width = 640; img.height = 400;
        media.appendChild(img);
      } else {
        media.innerHTML = ICONS[p.type] || ICONS.crop;
      }
      var price = (typeof p.price === "number")
        ? (F.currency || "") + p.price.toLocaleString() + (p.unit ? " " + p.unit : "")
        : "Ask for price";
      var msg = "Hello, I would like to enquire about " + p.name + ".";
      var link = waLink(msg);
      var btn = el("a", { "class": "btn btn-outline", href: link || "#contact", text: "Enquire" });
      if (link) { btn.target = "_blank"; btn.rel = "noopener"; }
      grid.appendChild(el("article", { "class": "product reveal" }, [
        media,
        el("div", { "class": "product-body" }, [
          el("h3", { text: p.name }),
          p.description ? el("p", { text: p.description }) : null,
          el("div", { "class": "price", text: price }),
          btn
        ])
      ]));
    });
  })();

  /* ---------- Gallery + lightbox ---------- */
  (function () {
    var grid = $("#galleryGrid");
    var dlg = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
    (F.gallery || []).forEach(function (g) {
      if (g.base) {
        var img = picture(g.base, g.widths, g.alt, "(min-width: 900px) 370px, (min-width: 560px) 46vw, 92vw");
        img.width = 640; img.height = 427;
        var shot = el("button", { "class": "shot reveal", type: "button", "aria-label": "View larger: " + (g.caption || g.alt) }, [
          img, el("span", { "class": "cap", text: g.caption || "" })
        ]);
        shot.addEventListener("click", function () {
          var big = g.widths[g.widths.length - 1];
          lbImg.src = g.base + "-" + big + ".webp";
          lbImg.alt = g.alt || "";
          lbCap.textContent = g.caption || "";
          if (dlg.showModal) dlg.showModal();
        });
        grid.appendChild(shot);
      } else {
        grid.appendChild(el("div", { "class": "shot placeholder reveal", role: "img", "aria-label": (g.caption || "Photo") + " – photo coming soon" }, [
          el("span", { html: ICONS.photo }),
          el("span", { "class": "cap", text: g.caption || "" }),
          el("span", { text: "Photo coming soon" })
        ]));
      }
    });
    $(".lb-close", dlg).addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  })();

  /* ---------- News ---------- */
  (function () {
    var grid = $("#newsGrid");
    var items = F.news || [];
    if (!items.length) {
      grid.appendChild(el("p", { "class": "empty", text: "News and farm updates will appear here soon." }));
      return;
    }
    items.forEach(function (n) {
      var d = n.date ? new Date(n.date) : null;
      var when = d && !isNaN(d) ? d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "";
      grid.appendChild(el("article", { "class": "news-item reveal" }, [
        when ? el("time", { datetime: n.date, text: when }) : null,
        el("h3", { text: n.title || "" }),
        el("p", { text: n.text || "" })
      ]));
    });
  })();

  /* ---------- Contact ---------- */
  (function () {
    var list = $("#contactList");
    function row(label, value, href) {
      var v = href ? el("a", { href: href, text: value }) : el("span", { text: value });
      list.appendChild(el("li", {}, [el("b", { text: label }), v]));
    }
    if (waNumber) row("WhatsApp", "+" + waNumber, waLink("Hello, I would like to make an enquiry."));
    if (F.phone) row("Phone", F.phone, "tel:" + String(F.phone).replace(/[^\d+]/g, ""));
    if (F.email) row("Email", F.email, "mailto:" + F.email);
    if (F.address) row("Address", F.address);
    if (F.hours) row("Hours", F.hours);
    if (!list.children.length) list.appendChild(el("li", { text: "Contact details are coming soon." }));

    var box = $("#socialLinks");
    var names = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube" };
    var any = false;
    Object.keys(names).forEach(function (k) {
      var url = F.social && F.social[k];
      if (url) {
        any = true;
        box.appendChild(el("a", { href: url, target: "_blank", rel: "noopener", text: names[k] }));
      }
    });
    if (!any) box.hidden = true;

    var form = $("#contactForm"), note = $("#formNote");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var message = form.elements.message.value.trim();
      if (!name || !message) { note.textContent = "Please add your name and a message."; return; }
      var link = waLink("Hello, my name is " + name + ". " + message);
      if (!link) { note.textContent = "Our WhatsApp line isn't set up yet. Please check back soon."; return; }
      note.textContent = "Opening WhatsApp…";
      window.open(link, "_blank", "noopener");
    });
  })();

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Scroll reveal ---------- */
  (function () {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (i) { i.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (i, n) {
      i.style.transitionDelay = (n % 3) * 90 + "ms";
      io.observe(i);
    });
  })();

  /* ---------- Gentle parallax on the band ---------- */
  (function () {
    var band = $(".band"), bg = $(".band-bg");
    if (!band || reduceMotion) return;
    var ticking = false;
    function update() {
      ticking = false;
      if (window.innerWidth < 900) { bg.style.transform = ""; return; }
      var r = band.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var offset = (r.top + r.height / 2 - window.innerHeight / 2) * -0.1;
      bg.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();
})();
