document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector("#menu-toggle");
  const navigation = document.querySelector("#main-navigation");

  if (menuToggle && navigation) {
    const closeMenu = () => {
      navigation.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menu");
      menuToggle.innerHTML = '<i class="bi bi-list" aria-hidden="true"></i>';
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      menuToggle.innerHTML = isOpen
        ? '<i class="bi bi-x-lg" aria-hidden="true"></i>'
        : '<i class="bi bi-list" aria-hidden="true"></i>';
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 850) closeMenu();
    });
  }

  const backToTop = document.querySelector("#back-to-top");

  if (backToTop) {
    const updateBackToTop = () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 450);
    };

    window.addEventListener("scroll", updateBackToTop, { passive: true });
    updateBackToTop();

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const slides = Array.from(document.querySelectorAll(".project-slide"));
  const dots = Array.from(document.querySelectorAll(".carousel-dot"));
  const previousButton = document.querySelector("#project-prev");
  const nextButton = document.querySelector("#project-next");
  const carouselRoot = document.querySelector(".project-carousel");
  const markUsed = () => carouselRoot?.classList.add("is-used");
  let currentSlide = 0;

  const showSlide = (index) => {
    if (!slides.length) return;

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentSlide;
      slide.hidden = !isActive;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentSlide;
      dot.classList.toggle("is-active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  if (slides.length) {
    previousButton?.addEventListener("click", () => { markUsed(); showSlide(currentSlide - 1); });
    nextButton?.addEventListener("click", () => { markUsed(); showSlide(currentSlide + 1); });

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset.slideTo);
        if (Number.isInteger(index)) { markUsed(); showSlide(index); }
      });
    });

    const carousel = document.querySelector(".project-carousel");
    carousel?.setAttribute("tabindex", "0");
    carousel?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") { markUsed(); showSlide(currentSlide - 1); }
      if (event.key === "ArrowRight") { markUsed(); showSlide(currentSlide + 1); }
    });

    // Arrastar para o lado no celular também troca o projeto
    let touchStartX = 0;
    let touchStartY = 0;
    carousel?.addEventListener("touchstart", (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    }, { passive: true });
    carousel?.addEventListener("touchend", (event) => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        markUsed();
        showSlide(currentSlide + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });

    showSlide(0);
  }

  /* ---------- Títulos que precisam caber em uma única linha no celular ---------- */
  const fitOneLineHeadings = () => {
    const isMobile = window.matchMedia("(max-width: 600px)").matches;

    document.querySelectorAll("[data-fit-line]").forEach((heading) => {
      heading.style.fontSize = "";
      if (!isMobile) return;

      const available = heading.closest(".container")?.clientWidth || window.innerWidth - 32;
      let size = parseFloat(getComputedStyle(heading).fontSize);

      while (heading.scrollWidth > available && size > 18) {
        size -= 0.5;
        heading.style.fontSize = `${size}px`;
      }
    });
  };

  let fitTimer;
  fitOneLineHeadings();
  window.addEventListener("load", fitOneLineHeadings);
  window.addEventListener("resize", () => {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitOneLineHeadings, 120);
  });
  document.fonts?.ready.then(fitOneLineHeadings);

  /* ---------- Animações e efeitos de rolagem ---------- */
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sombra no cabeçalho ao rolar
  const header = document.querySelector(".site-header");
  if (header) {
    const updateHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
  }

  // Revelação dos blocos ao entrar na tela
  const revealGroups = [
    ".trust-item",
    ".section-heading",
    ".reason-card",
    ".service-card",
    ".project-carousel",
    ".contact-map-column",
    ".contact-list > *",
    ".news-card",
    ".footer-main"
  ];
  const revealItems = Array.from(document.querySelectorAll(revealGroups.join(",")));

  if (revealItems.length && "IntersectionObserver" in window && !prefersReducedMotion) {
    revealItems.forEach((item) => {
      const siblings = Array.from(item.parentElement.children).filter((el) => el.matches(revealGroups.join(",")));
      const position = siblings.indexOf(item);
      item.style.setProperty("--d", `${Math.min(position, 4) * 0.09}s`);
      item.classList.add("reveal");
    });

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // Contador animado (ex.: "40 anos")
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target) || prefersReducedMotion) return;

    const duration = 1500;
    const delay = 700;
    el.textContent = "0";

    setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  });

  // Destaque do item do menu conforme a seção visível
  const navLinks = Array.from(document.querySelectorAll(".main-navigation a[href^='#']"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach((section) => spy.observe(section));
  }

  // Vídeo: só inicia quando o usuário clica em play
  const video = document.querySelector("#video-institucional");
  const videoPlay = document.querySelector("#video-play");
  if (video && videoPlay) {
    videoPlay.addEventListener("click", () => video.play());
    video.addEventListener("play", () => videoPlay.classList.add("is-hidden"));
    video.addEventListener("pause", () => { if (!video.seeking) videoPlay.classList.remove("is-hidden"); });
    video.addEventListener("ended", () => videoPlay.classList.remove("is-hidden"));
  }
});

/* ---------- Carrossel do hero: troca automática a cada 7s, com efeito de página dobrada ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector("#hero-carousel");
  const canvas = document.querySelector("#hero-canvas");
  const label = document.querySelector("#hero-label");
  if (!carousel || !canvas) return;

  const ctx = canvas.getContext("2d");
  const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
  const images = slides.map((slide) => slide.querySelector("img"));
  if (!ctx || slides.length < 2) return;

  const HOLD_MS = 7000;      // tempo parada em cada foto
  const TURN_MS = 1200;      // duração da virada
  const START_SIZE = 6;      // a dobra nasce no canto inferior direito
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let W = 0, H = 0;
  let current = 0;
  let busy = false;
  let holdTimer = null;

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const nextIndex = () => (current + 1) % slides.length;

  const loaded = (img) => new Promise((resolve) => {
    if (img.complete && img.naturalWidth) return resolve();
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });

  /* ----- desenho ----- */
  const drawCover = (img) => {
    if (!img || !img.naturalWidth) return;
    const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
  };

  // Recorta um polígono mantendo os pontos onde f(p) >= 0 (Sutherland–Hodgman)
  const clip = (poly, f) => {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) {
        const t = fa / (fa - fb);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  };

  const tracePath = (poly) => {
    ctx.beginPath();
    poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  };

  const renderStill = () => {
    ctx.clearRect(0, 0, W, H);
    drawCover(images[current]);
  };

  // from/to: índices das fotos | e: progresso da virada (0 a 1)
  const render = (from, to, e) => {
    ctx.clearRect(0, 0, W, H);

    // A linha de dobra sai do canto inferior direito, vai ficando mais vertical e varre a foto até a esquerda
    const phi = Math.PI / 4 + (20 * Math.PI / 180 - Math.PI / 4) * e;
    const n = { x: Math.cos(phi), y: Math.sin(phi) };
    const d0 = (W + H - START_SIZE) / Math.SQRT2;
    const d = d0 + (-40 - d0) * e;
    const dist = (p) => n.x * p[0] + n.y * p[1];

    const page = [[0, 0], [W, 0], [W, H], [0, H]];
    const kept = clip(page, (p) => d - dist(p));
    const removed = clip(page, (p) => dist(p) - d);
    const flap = removed.map(([x, y]) => {
      const k = 2 * (n.x * x + n.y * y - d);
      return [x - k * n.x, y - k * n.y];
    });

    // 1) foto de baixo (a próxima)
    drawCover(images[to]);

    // 2) sombra da dobra sobre a foto de baixo
    if (removed.length > 2) {
      ctx.save();
      tracePath(removed);
      ctx.clip();
      const g = ctx.createLinearGradient(n.x * d, n.y * d, n.x * (d + 70), n.y * (d + 70));
      g.addColorStop(0, "rgba(0,0,0,.38)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // 3) foto de cima (parte que ainda não foi dobrada) + verso da página dobrada
    if (kept.length > 2) {
      ctx.save();
      tracePath(kept);
      ctx.clip();
      drawCover(images[from]);

      if (flap.length > 2) {
        const depth = Math.max(...removed.map(dist)) - d;
        const g = ctx.createLinearGradient(n.x * d, n.y * d, n.x * (d - depth), n.y * (d - depth));
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.18, "#f3f4f3");
        g.addColorStop(0.6, "#e2e5e3");
        g.addColorStop(1, "#cfd4d1");
        ctx.shadowColor = "rgba(0,0,0,.42)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = -n.x * 6;
        ctx.shadowOffsetY = -n.y * 6;
        ctx.fillStyle = g;
        tracePath(flap);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  /* ----- legenda e acessibilidade ----- */
  const setLabel = (text) => {
    if (!label) return;
    if (reduceMotion.matches) { label.textContent = text; return; }
    label.classList.add("is-changing");
    setTimeout(() => {
      label.textContent = text;
      label.classList.remove("is-changing");
    }, 300);
  };

  const describe = () => canvas.setAttribute("aria-label", images[current].alt);

  /* ----- virada automática ----- */
  const schedule = () => {
    clearTimeout(holdTimer);
    holdTimer = setTimeout(turn, HOLD_MS);
  };

  const finish = (to) => {
    current = to;
    describe();
    renderStill();
    busy = false;
    schedule();
  };

  async function turn() {
    if (busy || document.hidden) return;
    busy = true;

    const from = current;
    const to = nextIndex();
    await loaded(images[to]);
    let labelChanged = false;

    if (reduceMotion.matches) {
      setLabel(slides[to].dataset.label || "");
      finish(to);
      return;
    }

    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / TURN_MS, 1);
      render(from, to, ease(t));
      if (!labelChanged && t > 0.35) {
        labelChanged = true;
        setLabel(slides[to].dataset.label || "");
      }
      if (t < 1) requestAnimationFrame(step);
      else finish(to);
    };
    requestAnimationFrame(step);
  }

  /* ----- tamanho do canvas ----- */
  const resize = () => {
    const rect = carousel.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = "high";
    if (!busy) renderStill();
  };

  // Pausa quando a aba não está visível, para não "pular" fotos em segundo plano
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearTimeout(holdTimer);
    else if (!busy) schedule();
  });

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(carousel);
  else window.addEventListener("resize", resize);

  /* ----- início ----- */
  Promise.all([loaded(images[0]), loaded(images[1])]).then(() => {
    resize();
    if (!W || !images[0].naturalWidth) return;   // sem canvas: mantém a primeira foto estática
    describe();
    canvas.hidden = false;
    carousel.classList.add("has-canvas");
    renderStill();
    schedule();
  });
});

/* =====================================================================
   Crédito do desenvolvedor — "By JR Design"
   Protegido contra remoção/alteração. Para liberar a edição (nesta aba),
   abra o console do navegador e execute:  JRCredit.unlock("SENHA")
   A senha NÃO fica no código: apenas o hash SHA-256 (com salt).
   ===================================================================== */
(() => {
  const CREDIT_URL = "https://www.linkedin.com/in/julio-samuel-rodrigues-0a1265294/";
  const CREDIT_TEXT = "By JR Design";
  const SALT = "jrd::";
  const PASS_HASH = "f27495c2820d05d7096387f50dad3cc4f988d7f5a732f91b12bb29f57b7263a6";

  // SHA-256 em JS puro (funciona também em http, onde crypto.subtle não existe)
  const sha256 = (msg) => {
    const rr = (v, a) => (v >>> a) | (v << (32 - a));
    const bytes = Array.from(new TextEncoder().encode(msg));
    const bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (let i = 7; i >= 0; i--) bytes.push(i >= 4 ? 0 : (bitLen >>> (i * 8)) & 255);
    const K = [], H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    for (let n = 2, c = 0; c < 64; n++) {
      let prime = true;
      for (let d = 2; d * d <= n; d++) if (n % d === 0) { prime = false; break; }
      if (prime) { K[c++] = (Math.cbrt(n) % 1) * 4294967296 | 0; }
    }
    for (let o = 0; o < bytes.length; o += 64) {
      const w = [];
      for (let i = 0; i < 16; i++) w[i] = (bytes[o + i * 4] << 24) | (bytes[o + i * 4 + 1] << 16) | (bytes[o + i * 4 + 2] << 8) | bytes[o + i * 4 + 3];
      for (let i = 16; i < 64; i++) {
        const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0;
        const t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, h].forEach((v, i) => { H[i] = (H[i] + v) | 0; });
    }
    return H.map((v) => (v >>> 0).toString(16).padStart(8, "0")).join("");
  };

  let unlocked = false;
  let observer = null;

  const buildCredit = () => {
    const span = document.createElement("span");
    span.className = "footer-credit";
    span.id = "jr-credit";
    span.append("By ");
    const link = document.createElement("a");
    link.href = CREDIT_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "JR Design";
    link.setAttribute("aria-label", "Desenvolvido por JR Design - LinkedIn");
    span.append(link);
    return span;
  };

  const isIntact = (el) => {
    if (!el || el.id !== "jr-credit" || el.textContent !== CREDIT_TEXT || el.children.length !== 1) return false;
    const a = el.firstElementChild;
    if (a.tagName !== "A" || a.getAttribute("href") !== CREDIT_URL || a.textContent !== "JR Design") return false;
    if (el.hasAttribute("style") || a.hasAttribute("style") || el.hidden) return false;
    const cs = getComputedStyle(el);
    const ca = getComputedStyle(a);
    return cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity) > 0.2 &&
           ca.display !== "none" && ca.visibility !== "hidden" && parseFloat(cs.fontSize) >= 10 &&
           ca.pointerEvents !== "none";
  };

  const getHost = () => {
    let footer = document.querySelector(".site-footer");
    if (!footer) {
      footer = document.createElement("footer");
      footer.className = "site-footer";
      document.body.append(footer);
    }
    let inner = footer.querySelector(".footer-bottom-inner");
    if (!inner) {
      const bottom = document.createElement("div");
      bottom.className = "footer-bottom";
      inner = document.createElement("div");
      inner.className = "container footer-bottom-inner";
      bottom.append(inner);
      footer.append(bottom);
    }
    return inner;
  };

  const enforce = () => {
    if (unlocked) return;
    const current = document.querySelectorAll("#jr-credit");
    if (current.length === 1 && isIntact(current[0]) && current[0].closest(".site-footer")) return;

    observer?.disconnect();
    current.forEach((el) => el.remove());
    const host = getHost();
    host.append(buildCredit());
    // Se algum CSS externo esconder o crédito, força a exibição
    const el = document.querySelector("#jr-credit");
    if (el && !isIntact(el)) {
      ["display:inline", "visibility:visible", "opacity:1", "font-size:12px", "pointer-events:auto"].forEach((rule) => {
        const [prop, val] = rule.split(":");
        el.style.setProperty(prop, val, "important");
      });
    }
    observe();
  };

  const observe = () => {
    if (!observer) observer = new MutationObserver(enforce);
    observer.observe(document.documentElement, {
      childList: true, subtree: true, attributes: true, characterData: true
    });
  };

  window.JRCredit = Object.freeze({
    unlock(password) {
      if (sha256(SALT + String(password)) === PASS_HASH) {
        unlocked = true;
        observer?.disconnect();
        console.info("Crédito liberado para edição nesta aba.");
        return true;
      }
      console.warn("Senha incorreta.");
      return false;
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    enforce();
    observe();
    setInterval(enforce, 2000);
  });
})();
