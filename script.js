const body = document.body;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const revealItems = document.querySelectorAll("[data-reveal]");
const contactForm = document.querySelector(".contact-form");
const scrollProgress = document.querySelector(".scroll-progress");
const counters = document.querySelectorAll(".count-up");
const loader = document.querySelector(".page-loader");
const customCursor = document.querySelector(".custom-cursor");
const galleryFigures = document.querySelectorAll(".gallery-grid figure");
const galleryLightbox = document.querySelector("#galleryLightbox");
const lightboxImage = galleryLightbox.querySelector("img");
const lightboxTitle = galleryLightbox.querySelector(".lightbox-title");
const lightboxCount = galleryLightbox.querySelector(".lightbox-count");
const lightboxClose = galleryLightbox.querySelector(".lightbox-close");
const lightboxPrev = galleryLightbox.querySelector(".lightbox-prev");
const lightboxNext = galleryLightbox.querySelector(".lightbox-next");
const shineCards = document.querySelectorAll(
  ".hero-stats article, .service-card, .plan-card, .trainer-card, .facility-list article, .testimonial-grid blockquote"
);
let selectedPlan = "";
let activeGalleryIndex = 0;
let lastFocusedElement = null;

body.classList.add("reveal-ready");

const hideLoader = () => {
  loader.classList.add("is-hidden");
  window.setTimeout(() => loader.remove(), 520);
};

window.addEventListener("load", hideLoader, { once: true });
window.setTimeout(hideLoader, 1800);

navToggle.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const handleHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
};

const updateScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
};

window.addEventListener(
  "scroll",
  () => {
    handleHeader();
    updateScrollProgress();
  },
  { passive: true }
);
handleHeader();
updateScrollProgress();

const animateCounter = (counter) => {
  if (counter.dataset.done) return;
  counter.dataset.done = "true";

  const target = Number(counter.dataset.count || 0);
  const prefix = counter.dataset.prefix || "";
  const suffix = counter.dataset.suffix || "";
  const decimals = Number(counter.dataset.decimals || 0);
  const duration = 1100;
  const startTime = performance.now();

  const tick = (now) => {
    const rawProgress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - rawProgress, 3);
    const rawValue = target * eased;
    const value = decimals ? rawValue.toFixed(decimals) : Math.round(rawValue);
    const displayValue = prefix ? String(value).padStart(prefix.length + 1, prefix) : Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    counter.textContent = `${displayValue}${suffix}`;

    if (rawProgress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.65 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
  counters.forEach(animateCounter);
}

document.querySelectorAll("[data-plan]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedPlan = button.dataset.plan || "";

    window.setTimeout(() => {
      const status = contactForm.querySelector(".form-status");
      status.textContent = `${selectedPlan} plan selected. Complete the form and the team will follow up.`;
    }, 420);
  });
});

document.querySelectorAll(".btn, .socials a, .floating-actions a").forEach((button) => {
  button.addEventListener("click", (event) => {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");

    ripple.className = "ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);

    window.setTimeout(() => ripple.remove(), 650);
  });
});

if (window.matchMedia("(pointer: fine)").matches) {
  body.classList.add("cursor-ready");

  window.addEventListener("pointermove", (event) => {
    customCursor.classList.add("is-visible");
    customCursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  });

  document.addEventListener("pointerleave", () => customCursor.classList.remove("is-visible"));

  document.querySelectorAll("a, button, input, select, textarea, .gallery-grid figure").forEach((element) => {
    element.addEventListener("pointerenter", () => customCursor.classList.add("is-active"));
    element.addEventListener("pointerleave", () => customCursor.classList.remove("is-active"));
  });
}

const galleryItems = Array.from(galleryFigures).map((figure, index) => {
  const image = figure.querySelector("img");
  const caption = figure.querySelector("figcaption")?.textContent.trim() || image.alt || "Gym photo";

  figure.setAttribute("role", "button");
  figure.setAttribute("tabindex", "0");
  figure.setAttribute("aria-label", `Preview ${caption}`);
  figure.dataset.galleryIndex = String(index);

  return {
    alt: image.alt,
    caption,
    src: image.currentSrc || image.src,
  };
});

const updateLightbox = () => {
  const item = galleryItems[activeGalleryIndex];

  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxTitle.textContent = item.caption;
  lightboxCount.textContent = `${activeGalleryIndex + 1} / ${galleryItems.length}`;
};

const openLightbox = (index) => {
  activeGalleryIndex = index;
  lastFocusedElement = document.activeElement;
  updateLightbox();
  galleryLightbox.hidden = false;
  body.classList.add("lightbox-open");
  lightboxClose.focus();
};

const closeLightbox = () => {
  galleryLightbox.hidden = true;
  body.classList.remove("lightbox-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
  }
};

const showLightboxImage = (direction) => {
  activeGalleryIndex = (activeGalleryIndex + direction + galleryItems.length) % galleryItems.length;
  updateLightbox();
};

galleryFigures.forEach((figure, index) => {
  figure.addEventListener("click", () => openLightbox(index));
  figure.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(index);
    }
  });
});

lightboxClose.addEventListener("click", closeLightbox);
lightboxPrev.addEventListener("click", () => showLightboxImage(-1));
lightboxNext.addEventListener("click", () => showLightboxImage(1));

galleryLightbox.addEventListener("click", (event) => {
  if (event.target === galleryLightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (galleryLightbox.hidden) return;

  if (event.key === "Escape") {
    closeLightbox();
  }

  if (event.key === "ArrowLeft") {
    showLightboxImage(-1);
  }

  if (event.key === "ArrowRight") {
    showLightboxImage(1);
  }
});

shineCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    card.style.setProperty("--shine-x", `${x}%`);
  });
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const status = contactForm.querySelector(".form-status");
  const formData = new FormData(contactForm);
  const name = formData.get("name") || "there";
  const planText = selectedPlan ? ` for the ${selectedPlan} plan` : "";

  status.textContent = `Thanks ${name}. Your enquiry${planText} is ready for the Gain's Garage team to follow up.`;
  contactForm.reset();
  selectedPlan = "";
});
