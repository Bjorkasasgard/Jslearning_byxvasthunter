(() => {
  const track = document.querySelector(".banner-track");
  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".banner-card"));
  const dots = Array.from(document.querySelectorAll(".banner-dot"));
  if (!cards.length || !dots.length) return;

  const setActive = (index) => {
    dots.forEach((dot, i) => {
      const isActive = i === index;
      dot.classList.toggle("is-active", isActive);
      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  };

  const scrollToIndex = (index) => {
    const card = cards[index];
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActive(index);
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", (e) => {
      e.preventDefault();
      const index = Number(dot.dataset.index || 0);
      scrollToIndex(index);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number(visible.target.dataset.index || 0);
      setActive(index);
    },
    {
      root: track,
      threshold: [0.6],
    }
  );

  cards.forEach((card) => observer.observe(card));
  setActive(0);
})();
