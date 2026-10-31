document.addEventListener("DOMContentLoaded", () => {
  // Menu mobile
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

  // Botão voltar ao topo
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

  // Carrossel de projetos (três slides)
  const slides = Array.from(document.querySelectorAll(".project-slide"));
  const dots = Array.from(document.querySelectorAll(".carousel-dot"));
  const previousButton = document.querySelector("#project-prev");
  const nextButton = document.querySelector("#project-next");
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
    previousButton?.addEventListener("click", () => showSlide(currentSlide - 1));
    nextButton?.addEventListener("click", () => showSlide(currentSlide + 1));

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset.slideTo);
        if (Number.isInteger(index)) showSlide(index);
      });
    });

    // Permite navegar pelo carrossel com as setas do teclado quando ele está em foco.
    const carousel = document.querySelector(".project-carousel");
    carousel?.setAttribute("tabindex", "0");
    carousel?.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") showSlide(currentSlide - 1);
      if (event.key === "ArrowRight") showSlide(currentSlide + 1);
    });

    showSlide(0);
  }
});
