// Simple auto-dismiss and close behavior for alert banners
(function () {
  const container = document;
  function wire() {
    const alerts = container.querySelectorAll('.alert-close');
    alerts.forEach(btn => {
      btn.addEventListener('click', () => {
        const wrapper = btn.closest('div');
        if (wrapper) wrapper.remove();
      });
    });
    // auto-dismiss after 6s
    container.querySelectorAll('[class*=bg-green-50], [class*=bg-red-50]')
      .forEach(el => setTimeout(() => el.remove(), 6000));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();