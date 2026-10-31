(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Email: a normal clickable link, but only built here in the browser so simple bots can't harvest it ---------- */
  var addr = ["hi", "gabrielsidhom.com"].join("@");
  document.querySelectorAll("[data-mail-slot]").forEach(function (mailSlot) {
    mailSlot.innerHTML = "";
    var link = document.createElement("a");
    link.href = "mailto:" + addr;
    link.textContent = addr;
    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "copy";
    copy.setAttribute("aria-label", "Copy email address");
    copy.title = "Copy email address";
    copy.innerHTML = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1"/><path d="M10.5 3.5v-1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1"/></svg>';
    var note = document.createElement("span");
    note.className = "copied";
    note.setAttribute("role", "status");
    copy.addEventListener("click", function () {
      var done = function () { note.textContent = "copied"; setTimeout(function () { note.textContent = ""; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(addr).then(done, function () { window.prompt("Copy this address:", addr); });
      } else { window.prompt("Copy this address:", addr); }
    });
    mailSlot.appendChild(link);
    mailSlot.appendChild(copy);
    mailSlot.appendChild(note);
  });

  /* ---------- Life so far, out of 90 years (born 28 February 2010), ticking live ---------- */
  var life = document.getElementById("life");
  if (life) {
    var BORN = new Date(2010, 1, 28).getTime();
    var SPAN = 90;
    var YEAR = 365.2425 * 864e5;
    var yrs = life.querySelector(".yrs"), fill = life.querySelector(".fill"), pct = life.querySelector(".pct");
    var update = function () {
      var y = (Date.now() - BORN) / YEAR;
      var share = Math.min(y / SPAN, 1);
      yrs.textContent = y.toFixed(5);
      fill.style.width = (share * 100).toFixed(3) + "%";
      pct.textContent = (share * 100).toFixed(2) + "%";
    };
    update();
    setInterval(update, 1000);
  }

  /* ---------- Background: Coptic letters (mostly) and a few logic symbols, drifting like ink motes ---------- */
  var canvas = document.getElementById("glyphs");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var COPTIC = Array.from(
    "ⲀⲂⲄⲆⲈⲌⲎⲐⲒⲔⲖⲘⲚⲜⲞⲠⲢⲤⲦⲨⲪⲬⲮⲰ" +       // capitals
    "ⲁⲃⲅⲇⲉⲍⲏⲑⲓⲕⲗⲙⲛⲝⲟⲡⲣⲥⲧⲩⲫⲭⲯⲱ" +       // small letters
    "ϢϤϦϨϪϬϮϣϥϧϩϫϭϯ" +                       // letters taken from Demotic Egyptian
    "ⳤ⳥⳦⳧⳨⳩⳪" +                              // Coptic symbols: kai, mi-ro, pi-ro, stauros, tau-ro, khi-ro, shima-sima
    "ⳈⳉⳊⳋⳌⳍⳐⳑⳒⳓ"                           // Old Coptic and dialect letters
  );
  var LOGIC = Array.from("∀∃¬∧∨⊢⊨□◇∴");
  var FONT = '"Noto Sans Coptic", "Segoe UI Historic", "Segoe UI Symbol", "DejaVu Sans", "EB Garamond", serif';
  var INKS = ["155, 42, 29", "155, 42, 29", "60, 44, 32"];   // mostly faded red, some brown-black
  var W = 0, H = 0, dpr = 1, glyphs = [];

  function pick() {
    return Math.random() < 0.8
      ? COPTIC[Math.floor(Math.random() * COPTIC.length)]
      : LOGIC[Math.floor(Math.random() * LOGIC.length)];
  }
  function make() {
    var ang = Math.random() * Math.PI * 2, spd = 0.2 + Math.random() * 0.35;
    return {
      ch: pick(),
      x: Math.random() * W, y: Math.random() * H,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      size: 10 + Math.random() * 16,
      alpha: 0.04 + Math.random() * 0.09,
      ink: INKS[Math.floor(Math.random() * INKS.length)],
      rot: (Math.random() - 0.5) * 0.5,
      vr: (Math.random() - 0.5) * 0.003
    };
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var target = Math.min(240, Math.round((W * H) / 8000));
    while (glyphs.length < target) glyphs.push(make());
    glyphs.length = target;
    glyphs.forEach(function (g) { if (g.x > W) g.x = Math.random() * W; if (g.y > H) g.y = Math.random() * H; });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var i = 0; i < glyphs.length; i++) {
      var g = glyphs[i];
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(g.rot);
      ctx.font = g.size.toFixed(1) + "px " + FONT;
      ctx.fillStyle = "rgba(" + g.ink + ", " + g.alpha.toFixed(3) + ")";
      ctx.fillText(g.ch, 0, 0);
      ctx.restore();
    }
  }
  var last = 0;
  function step(t) {
    var dt = last ? Math.min((t - last) / 16.67, 3) : 1;
    last = t;
    for (var i = 0; i < glyphs.length; i++) {
      var g = glyphs[i];
      g.x += g.vx * dt; g.y += g.vy * dt; g.rot += g.vr * dt;
      var m = 30;
      if (g.x < -m) g.x = W + m; else if (g.x > W + m) g.x = -m;
      if (g.y < -m) g.y = H + m; else if (g.y > H + m) g.y = -m;
      if (Math.random() < 0.001 * dt) g.ch = pick();
    }
    draw();
    if (!document.hidden) requestAnimationFrame(step);
  }
  function start() { resize(); if (reduceMotion) { draw(); return; } requestAnimationFrame(step); }
  window.addEventListener("resize", function () { resize(); if (reduceMotion) draw(); });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !reduceMotion) { last = 0; requestAnimationFrame(step); }
  });
  var ready = (document.fonts && document.fonts.load)
    ? document.fonts.load('16px "Noto Sans Coptic"', "Ⲁ").catch(function () {})
    : Promise.resolve();
  Promise.race([ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(start);
})();
