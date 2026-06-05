/* ==========================================================================
   Portfolio – Main Script
   Single-page vintage-editorial portfolio interactions & animations.
   Vanilla ES6+ · No external dependencies.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------------------------------------------------------
     UTILITY: Debounce
     Limits how often a function fires (used for scroll handlers).
     ----------------------------------------------------------------------- */
  const debounce = (fn, delay = 15) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  /* -----------------------------------------------------------------------
     UTILITY: Clamp
     Keeps a value between min and max.
     ----------------------------------------------------------------------- */
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  /* -----------------------------------------------------------------------
     1. INTERSECTION OBSERVER – Scroll Animations
     Adds .animate to .animate-on-scroll elements when they enter the
     viewport. Stagger children (.stagger-item) receive a --delay custom
     property based on their index.
     ----------------------------------------------------------------------- */
  const initScrollAnimations = () => {
    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    if (!animatedElements.length) return;

    const scrollObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Set stagger delays on children before triggering animation
            const staggerItems = entry.target.querySelectorAll(".stagger-item");
            staggerItems.forEach((child, index) => {
              child.style.setProperty("--delay", `${index * 0.15}s`);
            });

            entry.target.classList.add("animate");
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -80px 0px" },
    );

    animatedElements.forEach((el) => scrollObserver.observe(el));
  };

  /* -----------------------------------------------------------------------
     2. NAVBAR
     – Adds .scrolled when page is scrolled past 50 px.
     – Highlights the active nav link based on the visible section.
     – Smooth-scrolls to section on nav link click.
     – Mobile hamburger menu toggle.
     ----------------------------------------------------------------------- */
  const initNavbar = () => {
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelectorAll(".nav-links a");
    const hamburger = document.querySelector(".hamburger");
    const sections = document.querySelectorAll(
      "#landing, #about, #experience, #education, #projects, #skills, #certifications, #achievements, #contact",
    );

    if (!navbar) return;

    /* --- Scroll class --------------------------------------------------- */
    const handleNavbarScroll = () => {
      if (window.scrollY > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", debounce(handleNavbarScroll, 10), {
      passive: true,
    });
    handleNavbarScroll(); // set initial state

    /* --- Active link highlighting via IntersectionObserver --------------- */
    const activateLink = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activateLink(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px", // fires when a section is roughly in the upper‐middle of the viewport
        threshold: 0,
      },
    );

    sections.forEach((section) => sectionObserver.observe(section));

    /* --- Smooth scroll on nav link click -------------------------------- */
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }

          // Close mobile nav after clicking a link
          const navLinksEl = document.querySelector(".nav-links");
          if (navLinksEl) navLinksEl.classList.remove("open");
          if (hamburger) hamburger.classList.remove("active");
        }
      });
    });

    /* --- Hamburger toggle ----------------------------------------------- */
    if (hamburger) {
      const navLinksEl = document.querySelector(".nav-links");
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        if (navLinksEl) navLinksEl.classList.toggle("open");
      });
    }
  };

  /* -----------------------------------------------------------------------
     3. SKILLS PROGRESS BARS
     Animates bar width from 0 → data-progress % and counts up the
     percentage label using requestAnimationFrame (~1 500 ms duration).
     ----------------------------------------------------------------------- */
  const initSkillBars = () => {
    const skillsSection = document.querySelector("#skills");
    if (!skillsSection) return;

    let triggered = false;

    const animateBar = (bar) => {
      const target = parseInt(bar.dataset.progress, 10) || 0;
      const duration = 1500; // ms
      const start = performance.now();

      // Find the associated percentage text (sibling or child of parent)
      const parentRow =
        bar.closest(".skill-item") || bar.parentElement.parentElement;
      const percentLabel = parentRow
        ? parentRow.querySelector(".skill-percent")
        : null;

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.round(eased * target);

        bar.style.width = `${current}%`;
        if (percentLabel) percentLabel.textContent = `${current}%`;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            triggered = true;
            const bars = skillsSection.querySelectorAll(
              ".progress-fill[data-progress]",
            );
            bars.forEach(animateBar);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(skillsSection);
  };

  /* -----------------------------------------------------------------------
     4. ACHIEVEMENT STAT COUNTERS
     Counts from 0 → data-count over ~2 000 ms with ease-out.
     ----------------------------------------------------------------------- */
  const initStatCounters = () => {
    const achievementsSection = document.querySelector("#achievements");
    if (!achievementsSection) return;

    let triggered = false;

    const animateCounter = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || "";
      const duration = 2000;
      const start = performance.now();

      const step = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic for natural deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        el.textContent = `${current}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggered) {
            triggered = true;
            const stats = achievementsSection.querySelectorAll(
              ".stat-number[data-count]",
            );
            stats.forEach(animateCounter);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(achievementsSection);
  };

  /* -----------------------------------------------------------------------
     5. CERTIFICATION CARD TILT (Mouse-follow)
     Applies a perspective tilt that follows the cursor, with a max
     rotation of ±4 degrees. Resets smoothly on mouseleave.
     ----------------------------------------------------------------------- */
  const initTiltCards = () => {
    const tiltCards = document.querySelectorAll(".tilt-card");
    if (!tiltCards.length) return;

    const MAX_TILT = 4; // degrees

    tiltCards.forEach((card) => {
      let rafId = null;

      card.addEventListener("mousemove", (e) => {
        if (rafId) cancelAnimationFrame(rafId);

        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Normalise mouse position to -1 … 1 range relative to card center
          const normalX = (e.clientX - centerX) / (rect.width / 2);
          const normalY = (e.clientY - centerY) / (rect.height / 2);

          // rotateY follows X-axis movement; rotateX follows Y-axis (inverted)
          const tiltX = clamp(normalX * MAX_TILT, -MAX_TILT, MAX_TILT);
          const tiltY = clamp(-normalY * MAX_TILT, -MAX_TILT, MAX_TILT);

          card.style.transform = `perspective(1000px) rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
          rafId = null;
        });
      });

      card.addEventListener("mouseleave", () => {
        if (rafId) cancelAnimationFrame(rafId);
        // Smooth reset via CSS transition (ensure transition is set in CSS)
        card.style.transition = "transform 0.45s cubic-bezier(.25,.8,.25,1)";
        card.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg)";

        // Remove inline transition after it completes so mousemove isn't eased
        const onTransitionEnd = () => {
          card.style.transition = "";
          card.removeEventListener("transitionend", onTransitionEnd);
        };
        card.addEventListener("transitionend", onTransitionEnd, { once: true });
      });
    });
  };

  /* -----------------------------------------------------------------------
     6. CONTACT FORM
     – Validates required fields + email format.
     – Opens a mailto: link on valid submit.
     – Manages floating-label helper classes (.has-value, .focused).
     ----------------------------------------------------------------------- */
  const initContactForm = () => {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    /* --- Floating labels ------------------------------------------------ */
    const inputGroups = form.querySelectorAll(".input-group");

    inputGroups.forEach((group) => {
      const input = group.querySelector("input, textarea");
      if (!input) return;

      // Set initial state (e.g. if browser autofills)
      if (input.value.trim() !== "") {
        group.classList.add("has-value");
      }

      input.addEventListener("focus", () => {
        group.classList.add("focused");
      });

      input.addEventListener("blur", () => {
        group.classList.remove("focused");
        group.classList.toggle("has-value", input.value.trim() !== "");
      });

      input.addEventListener("input", () => {
        group.classList.toggle("has-value", input.value.trim() !== "");
      });
    });

    /* --- Validation & submission ---------------------------------------- */
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (form.querySelector('[name="name"]') || {}).value?.trim();
      const email = (form.querySelector('[name="email"]') || {}).value?.trim();
      const subject = (
        form.querySelector('[name="subject"]') || {}
      ).value?.trim();
      const message = (
        form.querySelector('[name="message"]') || {}
      ).value?.trim();

      // Basic validation
      if (!name || !email || !subject || !message) {
        showFormMessage("Please fill in all fields.", "error");
        return;
      }

      if (!isValidEmail(email)) {
        showFormMessage("Please enter a valid email address.", "error");
        return;
      }

      // Build mailto link
      const mailtoSubject = encodeURIComponent(subject);
      const mailtoBody = encodeURIComponent(
        `${message}\n\nFrom: ${name} (${email})`,
      );
      const mailtoLink = `mailto:guptarishiiitjee@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

      window.open(mailtoLink, "_self");

      showFormMessage(
        "Message ready to send! Your email client should open shortly.",
        "success",
      );
      form.reset();

      // Reset floating-label classes
      inputGroups.forEach((group) => {
        group.classList.remove("has-value", "focused");
      });
    });

    /**
     * Displays a temporary message below the form.
     * @param {string} text  – The message to display.
     * @param {string} type  – 'success' or 'error'.
     */
    const showFormMessage = (text, type = "success") => {
      // Remove any existing message
      const existing = form.parentElement.querySelector(".form-message");
      if (existing) existing.remove();

      const msg = document.createElement("p");
      msg.className = `form-message form-message--${type}`;
      msg.textContent = text;
      form.parentElement.appendChild(msg);

      // Auto-remove after 4 seconds
      setTimeout(() => {
        msg.style.opacity = "0";
        msg.style.transition = "opacity 0.4s ease";
        setTimeout(() => msg.remove(), 400);
      }, 4000);
    };
  };

  /* -----------------------------------------------------------------------
     7. BACK TO TOP BUTTON
     Shows the button when scrolled past 500 px, smooth-scrolls on click.
     ----------------------------------------------------------------------- */
  const initBackToTop = () => {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;

    const toggleVisibility = () => {
      if (window.scrollY > 500) {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
      } else {
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";
      }
    };

    window.addEventListener("scroll", debounce(toggleVisibility, 10), {
      passive: true,
    });
    toggleVisibility(); // initial state

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  /* -----------------------------------------------------------------------
     8. TYPING EFFECT – Landing Designation
     Types out designation strings separated by ' · ' with a blinking
     cursor, then replaces itself with static text.
     ----------------------------------------------------------------------- */
  const initTypingEffect = () => {
    const el = document.querySelector(".typing-text");
    if (!el) return;

    const designations = el.dataset.designations
      ? el.dataset.designations.split("|")
      : el.textContent.split(" · ");

    // Preserve the full static text for when the animation finishes
    const fullText = designations.join(" · ");
    el.textContent = "";

    const SPEED = 50; // ms per character
    const CURSOR = "▎"; // blinking cursor character
    let charIndex = 0;
    let buffer = "";

    const typeNext = () => {
      if (charIndex < fullText.length) {
        buffer += fullText.charAt(charIndex);
        el.textContent = buffer + CURSOR;
        charIndex++;
        setTimeout(typeNext, SPEED);
      } else {
        // Finished – show static text without cursor
        el.textContent = fullText;
      }
    };

    // Small delay before starting to let the page settle
    setTimeout(typeNext, 600);
  };

  /* -----------------------------------------------------------------------
     9. SECTION DIVIDER PARALLAX
     Translates decorative dividers at 0.3× scroll speed for a subtle
     depth effect.
     ----------------------------------------------------------------------- */
  const initDividerParallax = () => {
    const dividers = document.querySelectorAll(
      ".section-divider, .divider-ornament",
    );
    if (!dividers.length) return;

    const handleParallax = () => {
      const scrollY = window.scrollY;
      dividers.forEach((div) => {
        const rect = div.getBoundingClientRect();
        const offset = (rect.top + scrollY - window.innerHeight / 2) * 0.3;
        div.style.transform = `translateY(${offset * 0.05}px)`;
      });
    };

    window.addEventListener("scroll", debounce(handleParallax, 10), {
      passive: true,
    });
    handleParallax(); // initial
  };

  /* -----------------------------------------------------------------------
     10. PARTICLE CANVAS – Landing Section
     Fine gold particles that drift and react to cursor movement.
     ----------------------------------------------------------------------- */
  const initParticles = () => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const landing = document.getElementById("landing");

    let width, height;
    let mouseX = -9999,
      mouseY = -9999;
    const PARTICLE_COUNT = 250;
    const CONNECTION_DIST = 250;
    const MOUSE_RADIUS = 150;
    const particles = [];

    const resize = () => {
      width = landing.offsetWidth;
      height = landing.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", debounce(resize, 100));

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r = Math.random() * 1.8 + 0.6;
        this.alpha = Math.random() * 0.4 + 0.15;
      }
      update() {
        // Mouse repulsion
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * 0.8;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
        // Damping
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.x += this.vx;
        this.y += this.vy;
        // Wrap
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 169, 110, ${this.alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(200, 169, 110, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      drawConnections();
      requestAnimationFrame(animate);
    };
    animate();

    // Track mouse relative to landing section
    landing.addEventListener("mousemove", (e) => {
      const rect = landing.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    });
    landing.addEventListener("mouseleave", () => {
      mouseX = -9999;
      mouseY = -9999;
    });
  };

  /* -----------------------------------------------------------------------
     11. CUSTOM CURSOR
     A small dot + outer ring that follows the mouse with trailing lag.
     Expands on interactive element hover.
     ----------------------------------------------------------------------- */
  const initCustomCursor = () => {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring || window.matchMedia("(max-width: 768px)").matches)
      return;

    let mx = 0,
      my = 0; // actual mouse
    let rx = 0,
      ry = 0; // ring position (lagged)

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    });

    const lagRing = () => {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      requestAnimationFrame(lagRing);
    };
    lagRing();

    // Hover detection
    const interactiveSelector =
      "a, button, .btn-cta, .btn-send, .proj-link, .tech-pill, .nav-links a, .hamburger, input, textarea, .cert-card, .social-icons a";
    document.querySelectorAll(interactiveSelector).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        dot.classList.add("hovering");
        ring.classList.add("hovering");
      });
      el.addEventListener("mouseleave", () => {
        dot.classList.remove("hovering");
        ring.classList.remove("hovering");
      });
    });
  };

  /* -----------------------------------------------------------------------
     12. INITIALISE EVERYTHING
     ----------------------------------------------------------------------- */
  initScrollAnimations();
  initNavbar();
  initSkillBars();
  initStatCounters();
  initTiltCards();
  initContactForm();
  initBackToTop();
  initTypingEffect();
  initDividerParallax();
  initParticles();
  initCustomCursor();
});
