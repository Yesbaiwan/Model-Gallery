export const CSS_STYLES = `
  :root {
    --bg-gradient-start: #f5f5f7;
    --bg-gradient-end: #fafafa;
    --text-primary: #1d1d1f;
    --text-secondary: #86868b;
    --bg-card: rgba(255, 255, 255, 0.7);
    --bg-card-hover: rgba(255, 255, 255, 0.95);
    --bg-card-solid: #ffffff;
    --bg-input: #f5f5f7;
    --bg-input-hover: #e8e8ed;
    --border-light: rgba(0, 0, 0, 0.04);
    --border-medium: rgba(0, 0, 0, 0.06);
    --border-strong: rgba(0, 0, 0, 0.12);
    --border-white: rgba(255, 255, 255, 0.5);
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.02);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 4px 24px rgba(0, 0, 0, 0.04);
    --shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.2);
    --notification-bg: rgba(29, 29, 31, 0.92);
    --divider: #d2d2d7;
    --logo-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    --hover-bg: rgba(0, 0, 0, 0.02);
    --accent-glow: rgba(0, 122, 255, 0.15);
  }

  [data-theme="dark"] {
    --bg-gradient-start: #0d0d0d;
    --bg-gradient-end: #1d1d1f;
    --text-primary: #f5f5f7;
    --text-secondary: #98989d;
    --bg-card: rgba(44, 44, 46, 0.7);
    --bg-card-hover: rgba(58, 58, 60, 0.95);
    --bg-card-solid: #2c2c2e;
    --bg-input: #3a3a3c;
    --bg-input-hover: #48484a;
    --border-light: rgba(255, 255, 255, 0.08);
    --border-medium: rgba(255, 255, 255, 0.12);
    --border-strong: rgba(255, 255, 255, 0.2);
    --border-white: rgba(255, 255, 255, 0.1);
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 4px 24px rgba(0, 0, 0, 0.2);
    --shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.4);
    --notification-bg: rgba(255, 255, 255, 0.92);
    --divider: #48484a;
    --logo-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    --hover-bg: rgba(255, 255, 255, 0.05);
    --accent-glow: rgba(100, 180, 255, 0.2);
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      --bg-gradient-start: #0d0d0d;
      --bg-gradient-end: #1d1d1f;
      --text-primary: #f5f5f7;
      --text-secondary: #98989d;
      --bg-card: rgba(44, 44, 46, 0.7);
      --bg-card-hover: rgba(58, 58, 60, 0.95);
      --bg-card-solid: #2c2c2e;
      --bg-input: #3a3a3c;
      --bg-input-hover: #48484a;
      --border-light: rgba(255, 255, 255, 0.08);
      --border-medium: rgba(255, 255, 255, 0.12);
      --border-strong: rgba(255, 255, 255, 0.2);
      --border-white: rgba(255, 255, 255, 0.1);
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
      --shadow-lg: 0 4px 24px rgba(0, 0, 0, 0.2);
      --shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.4);
      --notification-bg: rgba(255, 255, 255, 0.92);
      --divider: #48484a;
      --logo-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      --hover-bg: rgba(255, 255, 255, 0.05);
      --accent-glow: rgba(100, 180, 255, 0.2);
    }
  }

  * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif;
    background: linear-gradient(180deg, var(--bg-gradient-start) 0%, var(--bg-gradient-end) 100%);
    min-height: 100vh;
    color: var(--text-primary);
    position: relative;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .animate-in {
    animation: fadeInUp 0.5s ease-out forwards;
    opacity: 0;
  }

  .delay-1 { animation-delay: 0.05s; }
  .delay-2 { animation-delay: 0.1s; }
  .delay-3 { animation-delay: 0.15s; }
  .delay-4 { animation-delay: 0.2s; }
  .delay-5 { animation-delay: 0.25s; }

  .logo-container { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .logo-container::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .group:hover .logo-container {
    transform: scale(1.08) rotate(-2deg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
  }
  .group:hover .logo-container::before { opacity: 1; }
  .group:active .logo-container { transform: scale(0.95) rotate(0deg); transition: transform 0.1s ease; }
  .notification {
    background: var(--notification-bg);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
  }
  .notification-hidden { transform: translateX(calc(100% + 2rem)) translateY(-50%); opacity: 0; }
  .notification-visible { transform: translateX(0) translateY(0); opacity: 1; }
  .collapsed { max-height: 0 !important; opacity: 0 !important; }
  .icon-rotated { transform: rotate(-180deg); }

  .theme-toggle {
    position: relative;
    overflow: hidden;
  }
  .theme-toggle::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .theme-toggle:hover::before { opacity: 1; }
`;
