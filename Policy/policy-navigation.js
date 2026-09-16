(() => {
  const contents = document.querySelector('.policy-page .contents');
  const links = Array.from(contents?.querySelectorAll('a[href^="#"]') ?? []);
  if (!links.length) return;

  const entries = links
    .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter(({ section }) => section);
  if (!entries.length) return;

  let observer;
  let activeLink;
  const first = entries[0];

  function setActive(link) {
    if (!link || link === activeLink) return;
    links.forEach((item) => item.classList.toggle('active', item === link));
    activeLink = link;
  }

  function entryFromHash(hash = window.location.hash) {
    return entries.find(({ link }) => link.hash === hash);
  }

  function applyHashFallback() {
    setActive((entryFromHash() ?? first).link);
  }

  function sectionAtScrollPosition() {
    const marker = window.innerHeight * 0.15;
    return (
      [...entries]
        .reverse()
        .find(({ section }) => section.getBoundingClientRect().top <= marker) ?? first
    );
  }

  function observeSections({ resetToHash = false } = {}) {
    observer?.disconnect();
    observer = new IntersectionObserver(
      (observed) => {
        const visible = observed
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(entries.find(({ section }) => section === visible.target)?.link);
      },
      { rootMargin: '-15% 0px -65% 0px', threshold: 0 }
    );
    entries.forEach(({ section }) => observer.observe(section));
    if (resetToHash) {
      applyHashFallback();
    } else {
      setActive(sectionAtScrollPosition().link);
    }
  }

  links.forEach((link) => link.addEventListener('click', () => setActive(link)));
  window.addEventListener('hashchange', applyHashFallback);

  const desktop = window.matchMedia('(min-width: 900px)');
  const handleBreakpointChange = () => observeSections();
  if (desktop.addEventListener) {
    desktop.addEventListener('change', handleBreakpointChange);
  } else {
    desktop.addListener(handleBreakpointChange);
  }
  observeSections({ resetToHash: true });
})();
