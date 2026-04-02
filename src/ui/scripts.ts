export const JS_SCRIPTS = `
  (function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  })();

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function getCurrentTheme() {
    const attr = document.documentElement.getAttribute('data-theme');
    return attr || getSystemTheme();
  }

  function setTheme(theme) {
    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
    updateThemeIcon();
  }

  function toggleTheme() {
    const current = getCurrentTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  function updateThemeIcon() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    const isDark = getCurrentTheme() === 'dark';
    btn.innerHTML = isDark
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  document.addEventListener('DOMContentLoaded', updateThemeIcon);

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      const notification = document.getElementById('notification');
      notification.classList.remove('notification-hidden');
      notification.classList.add('notification-visible');
      setTimeout(() => {
        notification.classList.remove('notification-visible');
        notification.classList.add('notification-hidden');
      }, 2200);
    }).catch(err => console.error('复制失败:', err));
  }

  function toggleGroup(groupName) {
    const content = document.getElementById('content-' + groupName);
    const icon = document.getElementById('icon-' + groupName);
    content.classList.toggle('collapsed');
    icon.classList.toggle('icon-rotated');
  }

  let siteSelectorOpen = false;

  function toggleSiteSelector() {
    const dropdown = document.getElementById('siteSelectorDropdown');
    siteSelectorOpen = !siteSelectorOpen;
    dropdown.classList.toggle('opacity-0', !siteSelectorOpen);
    dropdown.classList.toggle('invisible', !siteSelectorOpen);
    dropdown.classList.toggle('opacity-100', siteSelectorOpen);
    dropdown.classList.toggle('visible', siteSelectorOpen);
  }

  function switchSite(siteName) {
    fetch('/switch-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site: siteName })
    }).then(() => window.location.reload())
      .catch(err => console.error('切换站点失败:', err));
  }

  document.addEventListener('click', (e) => {
    const selector = document.getElementById('siteSelectorBtn');
    const dropdown = document.getElementById('siteSelectorDropdown');
    if (siteSelectorOpen && selector && dropdown && 
        !selector.contains(e.target) && !dropdown.contains(e.target)) {
      toggleSiteSelector();
    }
  });
`;
