const nav = document.querySelector("nav");
  const navToggle = document.getElementById("navToggle");
  const acceptButton = document.getElementById("acceptCookiesBtn");
  const declineButton = document.getElementById("declineCookiesBtn")
  const banner = document.querySelector(".consent-banner");

  /* Burger menu */
  function setNavOpen(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  }

  navToggle.addEventListener("click", () => {
    setNavOpen(!nav.classList.contains("is-open"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setNavOpen(false);
      navToggle.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !nav.contains(e.target)) {
      setNavOpen(false);
    }
  });

  document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Optional: prevent default to implement smooth scrolling later
            //e.preventDefault();

            // Remove active class from all other nav items
            document.querySelectorAll('nav ul li a').forEach(el => el.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Collapse the burger menu after navigating on small screens
            setNavOpen(false);
        });
    });


  /* Cookie consent
   *
   * The banner is fixed to the bottom of the viewport, which puts it directly
   * over the footer links on a phone. Two things keep them reachable:
   *
   *   1. --consent-banner-height reserves the banner's height at the foot of
   *      the page, so the links are never underneath it.
   *   2. The choice is remembered, so the banner does not come back on every
   *      page load and re-cover them.
   */
  const CONSENT_STORAGE_KEY = "theurbannet-cookie-consent";

  function readStoredConsent() {
    try {
      return localStorage.getItem(CONSENT_STORAGE_KEY);
    } catch (error) {
      /* Private browsing and blocked storage both throw here. The banner then
         behaves as it did before: shown every visit, but no longer covering
         anything, because the footer padding is driven by the same variable. */
      return null;
    }
  }

  function storeConsent(choice) {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, choice);
    } catch (error) {
      /* Nothing to do â€” the banner still closes for this session. */
    }
  }

  function updateBannerHeight() {
    const height = banner.classList.contains("is-hidden")
      ? 0
      : banner.offsetHeight + 16; /* 16px == the banner's bottom offset */

    document.documentElement.style.setProperty(
      "--consent-banner-height",
      `${height}px`
    );
  }

  function dismissBanner(choice) {
    storeConsent(choice);
    banner.classList.add("is-hidden");
    banner.setAttribute("aria-hidden", "true");
    updateBannerHeight();
  }

  if (readStoredConsent()) {
    /* Already answered: hide it without playing the slide-out */
    banner.classList.add("is-static", "is-hidden");
    banner.setAttribute("aria-hidden", "true");
  }

  updateBannerHeight();

  /* Re-measure once webfonts land and whenever the banner rewraps */
  window.addEventListener("load", updateBannerHeight);
  window.addEventListener("resize", updateBannerHeight);

  if (typeof ResizeObserver === "function") {
    new ResizeObserver(updateBannerHeight).observe(banner);
  }

  acceptButton.addEventListener("click", () => {
    dismissBanner("accepted");
  });

  declineButton.addEventListener("click", () => {
    dismissBanner("declined");
  });

  document.addEventListener("DOMContentLoaded", function () {
  const uvpSection = document.querySelector("#UVP");
  const chatMessages = document.querySelectorAll(
    ".chatConversation .chat-message"
  );

  if (!uvpSection || chatMessages.length === 0) {
    return;
  }

  const messageDelay = 1000;
  const replayDelay = 6000;

  let messageTimers = [];
  let replayTimer = null;
  let conversationIsPlaying = false;
  let sectionIsVisible = false;

  function clearMessageTimers() {
    messageTimers.forEach((timer) => clearTimeout(timer));
    messageTimers = [];
  }

  function hideAllMessages() {
    chatMessages.forEach((message) => {
      message.classList.remove("show");
    });
  }

  function playChatConversation() {
    if (conversationIsPlaying || !sectionIsVisible) {
      return;
    }

    conversationIsPlaying = true;
    hideAllMessages();
    clearMessageTimers();

    chatMessages.forEach((message, index) => {
      const timer = setTimeout(() => {
        if (sectionIsVisible) {
          message.classList.add("show");
        }
      }, index * messageDelay);

      messageTimers.push(timer);
    });

    const conversationDuration =
      (chatMessages.length - 1) * messageDelay + 350;

    const finishTimer = setTimeout(() => {
      conversationIsPlaying = false;

      replayTimer = setTimeout(() => {
        if (sectionIsVisible) {
          playChatConversation();
        }
      }, replayDelay);
    }, conversationDuration);

    messageTimers.push(finishTimer);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      sectionIsVisible = entry.isIntersecting;

      if (sectionIsVisible) {
        playChatConversation();
      } else {
        clearMessageTimers();
        clearTimeout(replayTimer);
        conversationIsPlaying = false;
        hideAllMessages();
      }
    },
    {
      threshold: 0.25
    }
  );

  observer.observe(uvpSection);
});

/* FAQ exclusive accordion â€” opening one panel collapses any other open
   panel so that only a single FAQ item is ever visible at a time. */
document.querySelectorAll(".faq-list .faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      document
        .querySelectorAll(".faq-list .faq-item")
        .forEach((other) => {
          if (other !== item) {
            other.open = false;
          }
        });
    }
  });
});
