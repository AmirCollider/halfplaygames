// addEventListener منتظر رویداد fetch می‌ماند و درخواست را به تابع handleRequest ارسال می‌کند
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

// [R2] نام تصاویری که در ریشه باکت halfplaygamesr2 آپلود شده‌اند
// فقط همین فایل‌ها از طریق Worker سرو می‌شوند (binding با نام HALFPLAYGAMES_R2 در wrangler.jsonc تعریف شده)
const R2_IMAGES = [
    'HalfPlayGamesLogo.png',
    'GameMoreSpendLess.png',
    'LanguageFlagEnglish.png',
    'LanguageFlagIran.jpg',
    'LanguageFlagJapanese.png',
    'HalfPlayGamesGitHubScreenShot.png'
];

/**
 * [R2] یک تصویر را از باکت R2 خوانده و برمی‌گرداند
 * @param {string} key - نام فایل در ریشه باکت
 * @returns {Response} - پاسخ تصویر
 */
async function serveR2Image(key) {
    const object = await HALFPLAYGAMES_R2.get(key);
    if (object === null) {
        return new Response('Image not found', { status: 404 });
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    if (!headers.has('content-type')) {
        headers.set('content-type', key.endsWith('.jpg') ? 'image/jpeg' : 'image/png');
    }
    headers.set('cache-control', 'public, max-age=86400'); // کش کردن برای یک روز
    return new Response(object.body, { headers });
}

/**
 * این تابع درخواست را دریافت کرده و یک پاسخ HTML کامل و بهینه‌سازی شده برای SEO تولید می‌کند
 * @param {Request} request - درخواست ورودی
 * @returns {Response} - پاسخ HTML
 */
async function handleRequest(request) {
    const url = new URL(request.url);

    // [R2] اگر درخواست برای یکی از تصاویر بود، آن را از R2 برگردان
    const imageKey = url.pathname.slice(1);
    if (R2_IMAGES.includes(imageKey)) {
        return serveR2Image(imageKey);
    }

    // آدرس‌های تصاویر از Cloudflare R2 (باکت halfplaygamesr2 که از طریق همین Worker سرو می‌شود)
    const logoURL = `${url.origin}/HalfPlayGamesLogo.png`;
    const promoURL = `${url.origin}/GameMoreSpendLess.png`;
    const flagEN = `${url.origin}/LanguageFlagEnglish.png`;
    const flagFA = `${url.origin}/LanguageFlagIran.jpg`;
    const flagJA = `${url.origin}/LanguageFlagJapanese.png`;
    const githubScreenshotURL = `${url.origin}/HalfPlayGamesGitHubScreenShot.png`;

    // [SEO-ENHANCEMENT] آدرس اصلی سایت برای تگ‌های کانونیکال و فراداده‌ها
    // لطفاً این آدرس را به دامنه اصلی سایت خود تغییر دهید
    const siteURL = 'https://halfplay.games';

    // [SEO-ENHANCEMENT] تعریف داده‌های ساختاریافته (Structured Data) با فرمت JSON-LD
    // این بخش به گوگل کمک می‌کند تا محتوای سایت شما را عمیقاً درک کند
    const structuredData = `
    <script type="application/ld+json">
    [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "HalfPlay Games",
        "url": "${siteURL}",
        "logo": "${logoURL}",
        "description": "Get PC Steam games at 50% off while supporting charity. We pay half, you pay half. Over 3785+ titles available. Every purchase contributes $5 to our charity fund for building schools and hospitals.",
        "sameAs": [
          "https://www.instagram.com/halfplaygames/"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "Customer Service",
          "url": "https://www.instagram.com/halfplaygames/",
          "availableLanguage": ["en", "fa", "ja"]
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "${siteURL}",
        "name": "HalfPlay Games",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "${siteURL}/#games?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is this transaction legal?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, absolutely! Our service is 100% legal and safe. We purchase games directly through Steam's official platform using legal payment methods."
            }
          },
          {
            "@type": "Question",
            "name": "Will games be added to my personal Steam account?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. We create a new random Gmail and Steam account for your games. This method significantly reduces the risk of account suspension and ensures the safety of the process."
            }
          },
          {
            "@type": "Question",
            "name": "How can we reduce the ban risk to nearly zero?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "To minimize risk, we recommend you: 1. Connect your phone number to both Gmail and Steam accounts. 2. Add the same profile picture to both accounts. 3. Never change your Steam username; provide us with your desired username before purchase."
            }
          },
          {
            "@type": "Question",
            "name": "Can I play online multiplayer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! All purchased games come with full functionality including online multiplayer. You can play with your friends and the community without any restrictions."
            }
          },
          {
            "@type": "Question",
            "name": "Is there a refund policy?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! If your account gets banned within 48 hours after purchase, we provide a 100% refund and apologize for the inconvenience."
            }
          }
        ]
      }
    ]
    </script>`;

    // تعریف کل محتوای HTML در یک template literal
    const html = `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta name="google-site-verification" content="qhDb3f-aAwGhcY1KJO36Da257deNaeN6CDqJPBjurkk" />

    <!-- [SEO-ENHANCEMENT] تگ‌های اصلی و حیاتی برای سئو -->
    <title>HalfPlay Games - 50% Off Steam Games | PC Game Deals & Charity</title>
    <meta name="description" content="Get the best deals on PC games! HalfPlay Games offers over 3785 Steam games at 50% off. We pay half, you pay half, and $5 from every purchase goes to charity. Legal, safe, and instant delivery.">
    <meta name="keywords" content="steam games, pc games, cheap games, game deals, 50% off games, steam sale, halfplay games, gaming for charity, buy steam games, تخفیف بازی, بازی استیم, خرید بازی ارزان, halfplaygames, スチームゲーム, PCゲーム, ゲーム割引">
    <meta name="author" content="HalfPlay Games">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="${siteURL}">

    <!-- [SEO-ENHANCEMENT] تگ‌های Hreflang برای سئو بین‌المللی -->
    <link rel="alternate" hreflang="en" href="${siteURL}">
    <link rel="alternate" hreflang="fa" href="${siteURL}?lang=fa">
    <link rel="alternate" hreflang="ja" href="${siteURL}?lang=ja">
    <link rel="alternate" hreflang="x-default" href="${siteURL}">

    <!-- [SEO-ENHANCEMENT] تگ‌های OpenGraph برای اشتراک‌گذاری در شبکه‌های اجتماعی (فیسبوک، واتس‌اپ و...) -->
    <meta property="og:title" content="HalfPlay Games - 50% Off PC Steam Games & Support Charity">
    <meta property="og:description" content="3785+ Steam games at half price. We pay 50%, you pay 50%. $5 from every purchase goes to building a better world!">
    <meta property="og:type" content="website">
    <meta property="og:image" content="${logoURL}">
    <meta property="og:image:alt" content="HalfPlay Games Logo">
    <meta property="og:url" content="${siteURL}">
    <meta property="og:site_name" content="HalfPlay Games">

    <!-- [SEO-ENHANCEMENT] تگ‌های Twitter Card برای اشتراک‌گذاری در توییتر -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="HalfPlay Games - 50% Off PC Steam Games & Support Charity">
    <meta name="twitter:description" content="Get incredible deals on Steam games and make a difference. 50% off on 3785+ titles, with $5 from each sale donated to charity.">
    <meta name="twitter:image" content="${promoURL}">
    <meta name="twitter:image:alt" content="A promotional image showing popular games available at HalfPlay Games">

    <link rel="icon" type="image/x-icon" href="${logoURL}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    
    <!-- [SEO-ENHANCEMENT] تزریق داده‌های ساختاریافته به صفحه -->
    ${structuredData}

    <style>
        /* CSS Variables for theming */
        :root {
            /* Dark Theme (Default) */
            --bg-primary: #0a0e17;
            --bg-secondary: #141922;
            --bg-card: rgba(30, 35, 48, 0.7);
            --accent-cyan: #00D4FF;
            --accent-coral: #FF6A6A;
            --accent-purple: #9B59B6;
            --accent-green: #4CAF50;
            --accent-gold: #FFD700;
            --text-primary: #FFFFFF;
            --text-secondary: #C5CED6;
            --text-muted: #8B95A2;
            --border-color: rgba(42, 48, 56, 0.8);
            --shadow-color: rgba(0, 212, 255, 0.2);
            --shadow-color-hover: rgba(0, 212, 255, 0.4);
            --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-2: linear-gradient(135deg, #00D4FF 0%, #FF6A6A 100%);
            --gradient-charity: linear-gradient(135deg, #FFD700 0%, #FF6A6A 50%, #9B59B6 100%);
        }

        html[data-theme='light'] {
            --bg-primary: #f0f4f8;
            --bg-secondary: #ffffff;
            --bg-card: rgba(255, 255, 255, 0.8);
            --text-primary: #1c2a38;
            --text-secondary: #4a5568;
            --text-muted: #718096;
            --border-color: rgba(200, 210, 220, 0.8);
            --shadow-color: rgba(0, 0, 0, 0.1);
            --shadow-color-hover: rgba(0, 0, 0, 0.15);
        }

        /* General Resets */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
            position: relative;
            transition: background-color 0.4s ease, color 0.4s ease;
        }

        /* --- ENHANCED BACKGROUND --- */
        .particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        }
        .particle {
            position: absolute;
            border-radius: 50%;
            opacity: 0; /* Start invisible */
            animation: float-particle 20s infinite linear;
        }
        html[data-theme='light'] .particle {
           opacity: 0.2;
        }
        @keyframes float-particle {
            0% { transform: translateY(110vh) translateX(0) scale(0.5); opacity: 0; }
            10%, 90% { opacity: 0.7; }
            100% { transform: translateY(-10vh) translateX(20vw) scale(1); opacity: 0; }
        }

        /* Shooting Stars */
        .shooting-star {
            position: fixed;
            top: -10%;
            width: 2px;
            height: 150px;
            background: linear-gradient(to bottom, rgba(0, 212, 255, 0.5), transparent);
            filter: blur(1px);
            animation: shooting-star-anim linear infinite;
            z-index: -1;
            opacity: 0; /* Start hidden */
        }
        @keyframes shooting-star-anim {
            0% { transform: translateY(0) rotate(45deg); opacity: 0; }
            10%, 90% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(45deg); opacity: 0; }
        }


        /* [START] UNIFIED ANIMATED BACKGROUND FOR SECTIONS */
        .unified-animated-background {
            position: relative;
            overflow: hidden;
        }
        .unified-animated-background::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, hsla(190, 100%, 50%, 0.03), hsla(0, 100%, 71%, 0.03), hsla(283, 39%, 53%, 0.03));
            background-size: 400% 400%;
            animation: gradient-flow 20s ease infinite;
            z-index: 0; 
        }
        @keyframes gradient-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .unified-animated-background > * {
            position: relative;
            z-index: 1;
        }
        /* [END] UNIFIED ANIMATED BACKGROUND */


        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: var(--bg-secondary); border-radius: 5px; }
        ::-webkit-scrollbar-thumb { background: var(--gradient-2); border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--gradient-charity); }

        /* Navigation Bar */
        nav {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(10, 14, 23, 0.7);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            z-index: 1000;
            padding: 1rem 0;
            transition: all 0.3s ease;
            border-bottom: 1px solid var(--border-color);
        }
        
        html[data-theme='light'] nav {
            background: rgba(255, 255, 255, 0.6);
        }

        nav.scrolled {
            padding: 0.7rem 0;
            box-shadow: 0 4px 30px var(--shadow-color);
            background: rgba(10, 14, 23, 0.85);
        }
        
        html[data-theme='light'] nav.scrolled {
            background: rgba(255, 255, 255, 0.8);
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            font-size: 1.8rem;
            font-weight: 900;
            background: var(--gradient-2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-family: 'Orbitron', sans-serif;
            transition: transform 0.3s ease;
        }

        .logo:hover { transform: scale(1.05); }
        .logo img {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            animation: logo-pulse 2s infinite;
        }

        @keyframes logo-pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); }
            50% { transform: scale(1.05); box-shadow: 0 0 20px 5px rgba(0, 212, 255, 0.4); }
        }

        .nav-links { list-style: none; display: flex; gap: 2rem; align-items: center; }
        .nav-links a {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            position: relative;
            font-size: 0.95rem;
        }
        .nav-links a:hover { color: var(--accent-cyan); transform: translateY(-2px); }
        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--gradient-2);
            transition: width 0.3s ease;
        }
        [dir="rtl"] .nav-links a::after { left: auto; right: 0; }
        .nav-links a:hover::after { width: 100%; }

        /* UI Controls Container */
        .ui-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        /* Language Dropdown */
        .language-dropdown { position: relative; }
        .language-dropdown-toggle {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 2px solid var(--accent-cyan);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-card);
            box-shadow: 0 10px 30px var(--shadow-color);
        }
        .language-dropdown-toggle:hover { transform: scale(1.1) rotate(15deg); }
        .language-dropdown-toggle img { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
        .language-dropdown-menu {
            position: absolute;
            bottom: 65px;
            right: 0;
            background: var(--bg-card);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 0.5rem;
            border: 1px solid var(--border-color);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: none;
            flex-direction: column;
            gap: 0.5rem;
            animation: fadeIn 0.3s ease;
        }
        .language-dropdown.active .language-dropdown-menu { display: flex; }
        .lang-option {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; cursor: pointer;
            border-radius: 10px; transition: background 0.2s ease; background: none; border: none;
            color: var(--text-secondary); width: 100%; text-align: left;
        }
        [dir="rtl"] .lang-option { text-align: right; }
        .lang-option:hover, .lang-option.active { background: rgba(0, 212, 255, 0.1); color: var(--accent-cyan); }
        .lang-option img { width: 25px; height: 25px; border-radius: 50%; }

        /* Theme Switcher */
        .theme-switcher { position: relative; }
        .theme-toggle-btn {
            width: 50px; height: 50px; border-radius: 50%; border: 2px solid var(--accent-purple);
            cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center;
            justify-content: center; background: var(--bg-card);
            box-shadow: 0 10px 30px rgba(155, 89, 182, 0.3);
            position: relative;
            overflow: hidden;
        }
        .theme-toggle-btn:hover { transform: scale(1.1) rotate(-15deg); }
        .theme-toggle-btn span {
            font-size: 24px;
            position: absolute;
            transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.3s ease;
        }
        html[data-theme='dark'] .sun-icon { transform: translateY(100%); opacity: 0; }
        html[data-theme='dark'] .moon-icon { transform: translateY(0); opacity: 1; }
        html[data-theme='light'] .sun-icon { transform: translateY(0); opacity: 1; }
        html[data-theme='light'] .moon-icon { transform: translateY(-100%); opacity: 0; }

        .mobile-menu { display: none; flex-direction: column; gap: 4px; cursor: pointer; }
        .mobile-menu span {
            width: 25px; height: 3px; background: var(--accent-cyan);
            transition: all 0.3s ease; border-radius: 2px;
        }
        .mobile-menu.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .mobile-menu.active span:nth-child(2) { opacity: 0; }
        .mobile-menu.active span:nth-child(3) { transform: rotate(-45deg) translate(7px, -6px); }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8rem 2rem 2rem;
            position: relative;
        }
        
        .hero-content { max-width: 1200px; text-align: center; z-index: 1; }
        .hero-badge {
            display: inline-block; padding: 0.8rem 2rem; background: rgba(0, 212, 255, 0.1);
            border: 2px solid var(--accent-cyan); border-radius: 50px; margin-bottom: 2rem;
            font-weight: 700; color: var(--accent-cyan); font-size: 1.1rem;
            animation: soft-glow 2.5s infinite;
        }
        @keyframes soft-glow {
            0%, 100% { box-shadow: 0 0 15px var(--shadow-color); }
            50% { box-shadow: 0 0 30px var(--shadow-color-hover); }
        }
        .hero h1 {
            font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 900; margin-bottom: 1.5rem;
            background: var(--gradient-2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            font-family: 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: 2px;
            animation: text-glow 3s ease-in-out infinite;
        }
        @keyframes text-glow {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 15px hsla(190, 100%, 50%, 0.3)); }
            50% { filter: brightness(1.2) drop-shadow(0 0 30px hsla(0, 100%, 71%, 0.5)); }
        }
        .tagline { font-size: clamp(1.2rem, 3vw, 1.8rem); color: var(--text-secondary); margin-bottom: 3rem; }
        .hero-buttons { display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 3rem; }

        .cta-button {
            display: inline-flex; align-items: center; gap: 0.5rem; padding: 1.2rem 3rem;
            background: var(--gradient-2); color: var(--text-primary); text-decoration: none;
            font-weight: 700; font-size: 1.1rem; border-radius: 50px;
            transition: all 0.3s ease; box-shadow: 0 4px 20px var(--shadow-color);
            position: relative; overflow: hidden;
        }
        html[data-theme='light'] .cta-button { color: #fff; }

        .cta-button::before {
            content: ''; position: absolute; top: 50%; left: 50%;
            width: 0; height: 0; background: rgba(255, 255, 255, 0.3); border-radius: 50%;
            transform: translate(-50%, -50%); transition: width 0.6s, height 0.6s;
        }
        .cta-button:hover::before { width: 300px; height: 300px; }
        .cta-button:hover { transform: translateY(-3px) scale(1.05); box-shadow: 0 8px 30px var(--shadow-color-hover); }
        .secondary-button {
            display: inline-flex; align-items: center; gap: 0.5rem; padding: 1.2rem 3rem;
            background: transparent; color: var(--accent-cyan); text-decoration: none;
            font-weight: 700; font-size: 1.1rem; border: 2px solid var(--accent-cyan);
            border-radius: 50px; transition: all 0.3s ease; position: relative; overflow: hidden;
        }
        .secondary-button::before {
            content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
            background: rgba(0, 212, 255, 0.1); transition: left 0.3s ease;
        }
        [dir="rtl"] .secondary-button::before { left: auto; right: -100%; }
        .secondary-button:hover::before { left: 0; right: 0; }
        .secondary-button:hover { transform: translateY(-3px); box-shadow: 0 5px 20px var(--shadow-color); }
        .trust-badges { display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; }
        .badge {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem 1.5rem;
            background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 25px; font-size: 0.9rem; color: var(--text-secondary);
            transition: all 0.3s ease; animation: subtle-float 4s ease-in-out infinite;
            animation-delay: calc(var(--i) * 0.2s);
        }
        @keyframes subtle-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .badge:hover {
            background: rgba(0, 212, 255, 0.2); transform: translateY(-5px) scale(1.05);
            box-shadow: 0 10px 20px var(--shadow-color);
        }

        /* 3D Tilt Effect for Cards */
        .tilt-card {
            transition: transform 0.1s ease;
            transform-style: preserve-3d;
        }
        

        /* How It Works Section */
        .how-it-works { padding: 5rem 2rem; }
        .steps-container {
            max-width: 1200px; margin: 0 auto; display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 3rem;
        }
        .step {
            text-align: center; padding: 2rem; background: var(--bg-card);
            backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-radius: 20px;
            border: 1px solid var(--border-color);
        }
        .step:hover {
            border-color: var(--accent-cyan);
            box-shadow: 0 20px 40px var(--shadow-color);
        }
        .step-number {
            position: absolute; top: -20px; left: 50%; transform: translateX(-50%);
            width: 40px; height: 40px; background: var(--gradient-2); color: white;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-weight: 700; font-size: 1.2rem; animation: number-pulse 2s infinite;
        }
        @keyframes number-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); }
            50% { box-shadow: 0 0 0 15px rgba(0, 212, 255, 0); }
        }
        .step-icon { font-size: 3rem; margin-bottom: 1rem; transition: transform 0.3s ease; }
        .step:hover .step-icon { transform: scale(1.2) rotate(10deg); animation: icon-jiggle 0.5s; }
        @keyframes icon-jiggle {
            0%, 100% { transform: scale(1.2) rotate(10deg); }
            25% { transform: scale(1.25) rotate(5deg); }
            75% { transform: scale(1.15) rotate(15deg); }
        }
        .step h3 {
            font-size: 1.3rem; margin-bottom: 1rem; color: var(--accent-cyan);
            text-transform: uppercase; letter-spacing: 1px;
        }
        .step p { color: var(--text-secondary); line-height: 1.6; }

        /* Featured Games Section */
        .featured-games { padding: 5rem 2rem; position: relative; overflow: hidden; }
        .section-title {
            text-align: center; font-size: 2.5rem; font-weight: 900; margin-bottom: 3rem;
            background: var(--gradient-2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            font-family: 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: 2px;
            position: relative; z-index: 1;
        }
        .games-slider {
            max-width: 1200px; margin: 0 auto; position: relative;
            border-radius: 20px; z-index: 1; overflow: hidden;
        }
        .games-container { display: flex; transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55); }
        .game-slide { min-width: 100%; flex-shrink: 0; padding: 2rem; background: var(--bg-card); backdrop-filter: blur(10px); }
        .game-slide h3 {
            color: var(--accent-cyan); font-size: 1.8rem; margin-bottom: 2rem; text-align: center;
            text-transform: uppercase; letter-spacing: 1px;
        }
        .games-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; }
        .game-card {
            background: var(--bg-primary); border-radius: 15px;
            border: 1px solid var(--border-color); cursor: pointer;
            overflow: hidden; 
        }
        .game-card:hover {
            box-shadow: 0 20px 40px var(--shadow-color);
            border-color: var(--accent-cyan);
        }
        .game-discount {
            position: absolute; top: 10px; right: 10px; background: var(--accent-coral);
            color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem; z-index: 1;
        }
        [dir="rtl"] .game-discount { right: auto; left: 10px; }
        .game-cover {
            width: 100%; height: 250px; background-size: cover; background-position: center;
            position: relative; transition: transform 0.4s ease;
        }
        .game-card:hover .game-cover { transform: scale(1.1); }
        .game-info { padding: 1.5rem; }
        .game-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem; color: var(--text-primary); }
        .price-container { display: flex; align-items: center; gap: 1rem; }
        .original-price { text-decoration: line-through; color: var(--text-muted); font-size: 0.9rem; }
        .discount-price { font-size: 1.5rem; font-weight: 700; color: var(--accent-cyan); }
        .slider-nav { display: flex; justify-content: center; gap: 1rem; margin-top: 2rem; position: relative; z-index: 5; }
        .slider-btn {
            padding: 0.8rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border-color);
            color: var(--text-secondary); border-radius: 25px; cursor: pointer;
            transition: all 0.3s ease; font-weight: 600;
        }
        .slider-btn:hover, .slider-btn.active {
            background: var(--gradient-2); color: white; border-color: transparent; transform: scale(1.1);
        }

        /* Discount Section */
        .discount-section { padding: 5rem 2rem; position: relative; }
        .discount-container { max-width: 1200px; margin: 0 auto; }
        .discount-note {
            text-align: center; background: rgba(255, 106, 106, 0.1); border: 2px solid var(--accent-coral);
            border-radius: 20px; padding: 1.5rem; margin-bottom: 3rem;
        }
        .discount-note p { color: var(--accent-coral); font-size: 1.2rem; font-weight: 700; margin: 0; }
        .discount-methods { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 3rem; margin-bottom: 3rem; }
        .discount-method {
            background: var(--bg-card); backdrop-filter: blur(10px); border-radius: 20px;
            padding: 2.5rem; border: 2px solid transparent; position: relative; transition: all 0.3s ease;
        }
        .discount-method::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 20px; padding: 2px;
            background: var(--gradient-2); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0.3; transition: opacity 0.3s ease;
        }
        .discount-method:hover { transform: translateY(-10px); box-shadow: 0 20px 40px var(--shadow-color); }
        .discount-method:hover::before { opacity: 1; }
        .method-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .method-icon { font-size: 3rem; }
        .method-title {
            font-size: 1.8rem; color: var(--accent-cyan); font-weight: 700;
            text-transform: uppercase; letter-spacing: 1px;
        }
        .discount-amount {
            background: var(--gradient-2); color: white; font-size: 1.5rem; font-weight: 900;
            padding: 1rem; border-radius: 15px; text-align: center; margin-bottom: 2rem;
            text-transform: uppercase; letter-spacing: 2px;
        }
        .method-steps { list-style: none; padding: 0; margin: 0; }
        .method-steps li {
            color: var(--text-secondary); padding: 0.8rem 0; padding-left: 2rem;
            position: relative; border-bottom: 1px solid var(--border-color); transition: all 0.3s ease;
        }
        .method-steps li:last-child { border-bottom: none; }
        .method-steps li::before {
            content: '✓'; position: absolute; left: 0; color: var(--accent-green);
            font-weight: 700; font-size: 1.2rem;
        }
        [dir="rtl"] .method-steps li { padding-left: 0; padding-right: 2rem; }
        [dir="rtl"] .method-steps li::before { left: auto; right: 0; }
        .method-steps li:hover { color: var(--text-primary); padding-left: 2.5rem; background: rgba(0, 212, 255, 0.05); }
        [dir="rtl"] .method-steps li:hover { padding-left: 0; padding-right: 2.5rem; }
        .promo-image {
            width: 100%; max-width: 300px; margin: 2rem auto 0; display: block;
            border-radius: 15px; border: 3px solid var(--accent-cyan); transition: all 0.3s ease;
        }
        .promo-image:hover { transform: scale(1.05) rotate(2deg); box-shadow: 0 10px 30px var(--shadow-color-hover); }

        /* Redesigned Charity Section */
        .charity-section { padding: 5rem 2rem; position: relative; overflow: hidden; }
        .charity-container { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        .charity-header { text-align: center; margin-bottom: 4rem; }
        .charity-title {
            font-size: 3rem; font-weight: 900; background: var(--gradient-charity);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            font-family: 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: 2px;
            margin-bottom: 1rem; animation: title-shimmer 3s infinite;
        }
        @keyframes title-shimmer {
            0%, 100% { filter: brightness(1) drop-shadow(0 0 15px rgba(255, 215, 0, 0.3)); }
            50% { filter: brightness(1.3) drop-shadow(0 0 30px rgba(255, 215, 0, 0.6)); }
        }
        .charity-subtitle { font-size: 1.5rem; color: var(--accent-gold); margin-bottom: 1rem; }
        .charity-description {
            color: var(--text-secondary); font-size: 1.1rem; line-height: 1.8;
            max-width: 800px; margin: 0 auto;
        }
        .charity-main { display: grid; grid-template-columns: 1fr 2fr; gap: 3rem; align-items: center; }
        .charity-stat-main {
            background: var(--bg-card); backdrop-filter: blur(10px); border-radius: 30px;
            padding: 3rem; text-align: center; border: 3px solid var(--accent-gold);
            position: relative; transition: all 0.3s ease; animation: main-stat-glow 2.5s infinite;
            grid-column: 1 / -1; 
        }
        .charity-main > .charity-stat-main { grid-column: auto; }
        @keyframes main-stat-glow {
             0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.4), 0 0 30px rgba(255, 106, 106, 0.2); transform: scale(1); }
            50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.7), 0 0 60px rgba(255, 106, 106, 0.4); transform: scale(1.05); }
        }
        .charity-stat-main .charity-icon { font-size: 4rem; margin-bottom: 1rem; }
        .charity-stat-main .charity-number { font-size: 5rem; line-height: 1; }
        .charity-stat-main .charity-label { font-size: 1.2rem; }
        .charity-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
        .charity-stat {
            background: var(--bg-card); backdrop-filter: blur(10px); border-radius: 20px;
            padding: 1.5rem; text-align: center; border: 1px solid var(--border-color);
        }
        .charity-stat:hover {
            border-color: var(--accent-cyan); 
        }
        .charity-icon { font-size: 2.5rem; margin-bottom: 1rem; }
        .charity-number {
            font-size: 2.5rem; font-weight: 900; background: var(--gradient-charity);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem; font-family: 'Orbitron', sans-serif;
        }
        .charity-label { color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }

        /* Donation Section */
        .donation-section { padding: 5rem 2rem; position: relative; }
        .donation-container { max-width: 1200px; margin: 0 auto; text-align: center; }
        .donation-card {
            background: var(--bg-card); backdrop-filter: blur(10px); border-radius: 30px;
            padding: 3rem; margin-bottom: 3rem; border: 3px solid var(--accent-gold);
            position: relative; overflow: hidden; animation: donation-glow 3s infinite;
        }
        @keyframes donation-glow {
            0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.3); }
            50% { box-shadow: 0 0 60px rgba(255, 215, 0, 0.6); }
        }
        .donation-card::before {
            content: '💝'; position: absolute; top: -50px; right: -50px;
            font-size: 10rem; opacity: 0.1; animation: donation-heart 5s infinite;
        }
        [dir="rtl"] .donation-card::before { right: auto; left: -50px; }
        @keyframes donation-heart {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.2) rotate(10deg); }
        }
        .donation-title {
            font-size: 2.5rem; color: var(--accent-gold); margin-bottom: 1.5rem;
            font-weight: 900; text-transform: uppercase; letter-spacing: 2px;
        }
        .donation-text { color: var(--text-primary); font-size: 1.3rem; line-height: 1.8; margin-bottom: 2rem; }
        .donation-link {
            display: inline-block; padding: 1.5rem 3rem; background: var(--gradient-charity);
            color: white; text-decoration: none; border-radius: 50px; font-weight: 700;
            font-size: 1.3rem; transition: all 0.3s ease; animation: donation-pulse 2s infinite;
        }
        @keyframes donation-pulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
            50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
        }
        .donation-link:hover { transform: translateY(-5px) scale(1.1); }
        .donation-info {
            background: rgba(255, 215, 0, 0.1); border: 2px solid var(--accent-gold);
            border-radius: 20px; padding: 2rem; margin-top: 3rem;
        }
        .donation-info p { color: var(--text-secondary); font-size: 1.1rem; line-height: 1.8; margin-bottom: 1rem; }
        .donation-info strong { color: var(--accent-gold); }

        /* Donors Section */
        .donors-section { padding: 5rem 2rem; }
        .donors-container { max-width: 1200px; margin: 0 auto; }
        .donors-header { text-align: center; margin-bottom: 3rem; }
        .donors-title {
            font-size: 2.5rem; font-weight: 900; background: var(--gradient-charity);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            font-family: 'Orbitron', sans-serif; text-transform: uppercase; letter-spacing: 2px;
            margin-bottom: 1rem;
        }
        .donors-subtitle { color: var(--text-secondary); font-size: 1.2rem; margin-bottom: 1rem; }
        .donors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
        .donor-card {
            background: var(--bg-card); backdrop-filter: blur(10px); border-radius: 20px;
            padding: 2rem; text-align: center; border: 2px solid var(--accent-gold);
        }
        .donor-card:hover { transform: translateY(-10px) scale(1.05); box-shadow: 0 20px 40px rgba(255, 215, 0, 0.3); }
        .donor-card.anonymous { border-color: var(--accent-purple); }
        .donor-icon { font-size: 3rem; margin-bottom: 1rem; }
        .donor-name { font-size: 1.3rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 0.5rem; }
        .donor-amount {
            font-size: 1.5rem; font-weight: 900; background: var(--gradient-charity);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem;
        }
        .donor-date { color: var(--text-muted); font-size: 0.9rem; }
        .donor-impact {
            margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);
            color: var(--accent-green); font-size: 0.95rem;
        }
        .no-donors {
            text-align: center; padding: 4rem; background: var(--bg-card);
            backdrop-filter: blur(10px); border-radius: 20px; border: 2px dashed var(--border-color);
        }
        .no-donors-icon { font-size: 5rem; opacity: 0.3; margin-bottom: 1rem; }
        .no-donors-title { font-size: 1.8rem; color: var(--text-secondary); margin-bottom: 1rem; }
        .no-donors-message { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; }

        /* Customer Satisfaction Section */
        .customer-satisfaction { padding: 5rem 2rem; }
        .satisfaction-container { max-width: 1200px; margin: 0 auto; text-align: center; }
        .satisfaction-number {
            font-size: 8rem; font-weight: 900; background: var(--gradient-2);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            font-family: 'Orbitron', sans-serif; margin-bottom: 1rem; line-height: 1;
        }
        .satisfaction-text { font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 2rem; }
        .satisfaction-message {
            background: rgba(0, 212, 255, 0.1); border: 2px solid var(--accent-cyan);
            border-radius: 20px; padding: 2rem; max-width: 600px; margin: 0 auto;
        }

        /* Top Buyers Section */
        .top-buyers { padding: 5rem 2rem; }
        .buyers-container { max-width: 1200px; margin: 0 auto; }
        .leaderboard { display: grid; gap: 2rem; margin-bottom: 3rem; }
        .buyer-card {
            background: var(--bg-card); backdrop-filter: blur(10px); border-radius: 20px;
            padding: 2rem; display: flex; align-items: center; justify-content: space-between;
            border: 2px solid var(--border-color);
            position: relative; overflow: hidden;
        }
        .buyer-card.gold {
            border-color: var(--accent-gold);
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
            animation: gold-shimmer 3s infinite;
        }
        @keyframes gold-shimmer {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
            50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); }
        }
        .buyer-card.silver { border-color: #C0C0C0; background: linear-gradient(135deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%); }
        .buyer-card.bronze { border-color: #CD7F32; background: linear-gradient(135deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%); }
        .buyer-card:hover { transform: translateX(10px); box-shadow: 0 10px 30px var(--shadow-color); }
        [dir="rtl"] .buyer-card:hover { transform: translateX(-10px); }
        .buyer-rank { display: flex; align-items: center; gap: 1.5rem; }
        .rank-medal { font-size: 3rem; animation: medal-spin 3s ease infinite; }
        @keyframes medal-spin {
            0%, 100% { transform: rotateY(0deg); }
            50% { transform: rotateY(180deg); }
        }
        .rank-number { font-size: 2rem; font-weight: 900; color: var(--text-muted); font-family: 'Orbitron', sans-serif; }
        .buyer-info { flex: 1; margin-left: 2rem; }
        [dir="rtl"] .buyer-info { margin-left: 0; margin-right: 2rem; }
        .buyer-name { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
        .buyer-username { color: var(--accent-cyan); font-size: 1rem; }
        .buyer-stats { display: flex; gap: 3rem; align-items: center; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 1.8rem; font-weight: 900; color: var(--accent-gold); font-family: 'Orbitron', sans-serif; }
        .stat-label { font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 0.3rem; }
        .empty-leaderboard {
            text-align: center; padding: 4rem; background: var(--bg-card);
            backdrop-filter: blur(10px); border-radius: 20px; border: 2px dashed var(--border-color);
        }
        .empty-icon { font-size: 5rem; opacity: 0.3; margin-bottom: 1rem; }
        .empty-title { font-size: 1.8rem; color: var(--text-secondary); margin-bottom: 1rem; }
        .empty-message { color: var(--text-muted); font-size: 1.1rem; line-height: 1.6; }

        /* About Section Frame */
        .about { padding: 5rem 2rem; }
        .about-container { max-width: 1000px; margin: 0 auto; text-align: center; }
        .about-story {
            padding: 3rem;
            margin-bottom: 3rem;
            position: relative;
            overflow: hidden;
            background: var(--bg-card);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 20px;
            border: 1px solid var(--border-color);
        }
        .about-story::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            border-radius: 20px;
            padding: 2px;
            background: linear-gradient(135deg, var(--accent-cyan), var(--accent-coral));
            -webkit-mask: 
                linear-gradient(#fff 0 0) content-box,
                linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.5;
            transition: opacity 0.4s ease;
            animation: border-glow 4s linear infinite;
        }
        @keyframes border-glow {
            0% { background: linear-gradient(135deg, var(--accent-cyan), var(--accent-coral)); }
            50% { background: linear-gradient(135deg, var(--accent-coral), var(--accent-cyan)); }
            100% { background: linear-gradient(135deg, var(--accent-cyan), var(--accent-coral)); }
        }
        .about-story:hover {
            box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }
        .about-story:hover::before {
            opacity: 1;
        }
        .about-story > * {
            position: relative;
            z-index: 2;
        }
        .about-story-icons {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            z-index: 1;
        }
        .about-story-icons::before {
            content: '🎮'; position: absolute; top: -20px; right: 20px;
            font-size: 8rem; opacity: 0.05; transform: rotate(-15deg);
        }
        .about-story-icons::after {
            content: '❤️'; position: absolute; bottom: -20px; left: 20px;
            font-size: 8rem; opacity: 0.05; transform: rotate(15deg);
        }
        [dir="rtl"] .about-story-icons::before { right: auto; left: 20px; }
        [dir="rtl"] .about-story-icons::after { left: auto; right: 20px; }
        .about-story h3 {
            font-size: 2.5rem; background: var(--gradient-2); -webkit-background-clip: text;
            -webkit-text-fill-color: transparent; margin-bottom: 2rem; text-transform: uppercase;
            letter-spacing: 2px; font-family: 'Orbitron', sans-serif;
        }
        .about-story p { color: var(--text-secondary); line-height: 1.8; margin-bottom: 1.5rem; font-size: 1.1rem; }
        .about-highlight {
            font-size: 1.3rem; color: var(--accent-cyan); font-weight: 700; margin: 2rem 0;
            padding: 1.5rem; background: rgba(0, 212, 255, 0.1); border-radius: 15px;
            border: 2px solid var(--accent-cyan);
        }
        .signature { font-family: 'Brush Script MT', cursive; font-size: 2rem; color: var(--accent-gold); margin-top: 2rem; }


        /* FAQ Section */
        .faq-section { padding: 5rem 2rem; }
        .faq-container { max-width: 1000px; margin: 0 auto; }
        .faq-item {
            background: var(--bg-card); backdrop-filter: blur(10px); border-radius: 15px;
            padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color);
        }
        .faq-item:hover { border-color: var(--accent-cyan); box-shadow: 0 10px 30px var(--shadow-color); }
        .faq-question { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .faq-number {
            background: var(--gradient-2); color: white; width: 30px; height: 30px;
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-weight: 700; flex-shrink: 0;
        }
        .faq-question h3 { color: var(--text-primary); font-size: 1.2rem; flex: 1; }
        .faq-answer { color: var(--text-secondary); line-height: 1.8; padding-left: 2.5rem; }
        [dir="rtl"] .faq-answer { padding-left: 0; padding-right: 2.5rem; }
        .faq-answer strong { color: var(--accent-cyan); }
        .faq-answer .important-tip {
            background: rgba(0, 212, 255, 0.1); border-left: 3px solid var(--accent-cyan);
            padding: 1rem; margin-top: 1rem; border-radius: 5px;
        }
        [dir="rtl"] .faq-answer .important-tip { border-left: none; border-right: 3px solid var(--accent-cyan); }

        /* Contact Section */
        .contact { padding: 5rem 2rem; }
        .contact-container {
            max-width: 1200px; margin: 0 auto; display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 3rem;
        }
        .payment-info {
            background: var(--bg-card); backdrop-filter: blur(10px); padding: 2.5rem;
            border-radius: 20px; border: 1px solid var(--border-color);
        }
        .instagram-button {
            display: inline-flex; align-items: center; justify-content: center; padding: 1.2rem 2.5rem;
            background: linear-gradient(135deg, #833AB4, #FD1D1D, #FCB045); color: white;
            text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 1.2rem;
            transition: all 0.3s ease; margin-bottom: 2rem; animation: insta-shine 3s infinite;
        }
        @keyframes insta-shine {
            0%, 100% { box-shadow: 0 0 20px rgba(131, 58, 180, 0.5); }
            50% { box-shadow: 0 0 40px rgba(252, 176, 69, 0.8); }
        }
        .instagram-button:hover { transform: translateY(-3px) scale(1.05); }
        .payment-methods { margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color); }
        .payment-method {
            background: var(--bg-primary); padding: 1.5rem; border-radius: 15px;
            margin-bottom: 1.5rem; border: 1px solid var(--border-color); transition: all 0.3s ease;
        }
        .payment-method:hover { border-color: var(--accent-cyan); transform: translateX(5px); background: rgba(0, 212, 255, 0.05); }
        [dir="rtl"] .payment-method:hover { transform: translateX(-5px); }
        .payment-method h4 { color: var(--accent-cyan); margin-bottom: 0.5rem; font-size: 1.1rem; }
        .payment-link {
            display: inline-block; color: var(--accent-gold); text-decoration: none;
            font-weight: 600; transition: all 0.3s ease; word-break: break-all;
        }
        .payment-link:hover { color: var(--accent-cyan); transform: translateX(5px); }
        [dir="rtl"] .payment-link:hover { transform: translateX(-5px); }
        .crypto-address {
            font-family: 'Courier New', monospace; background: rgba(0, 212, 255, 0.1);
            padding: 1rem; border-radius: 10px; font-size: 0.9rem;
            color: var(--text-secondary); word-break: break-all; margin-top: 0.5rem;
        }

        /* [WARNING] Test Site Warning Popup */
        .test-warning-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000;
            background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
            display: flex; justify-content: center; align-items: flex-start; padding: 1.5rem 1rem;
            animation: test-warning-fade 0.3s ease;
        }
        .test-warning-overlay.hidden { display: none; }
        @keyframes test-warning-fade { from { opacity: 0; } to { opacity: 1; } }
        .test-warning-popup {
            position: relative; width: 100%; max-width: 560px; text-align: center;
            background: var(--bg-secondary); border: 2px solid var(--accent-coral);
            border-radius: 20px; padding: 2rem 1.5rem 1.5rem;
            box-shadow: 0 20px 50px rgba(255, 106, 106, 0.35);
            animation: test-warning-slide 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        }
        @keyframes test-warning-slide {
            from { transform: translateY(-120%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .test-warning-icon { font-size: 3rem; margin-bottom: 0.5rem; }
        .test-warning-text { color: var(--accent-coral); font-size: 1.3rem; font-weight: 700; line-height: 1.6; margin-bottom: 1.5rem; }
        .test-warning-btn {
            padding: 0.8rem 2.5rem; border: none; border-radius: 50px; cursor: pointer;
            background: var(--gradient-2); color: #fff; font-weight: 700; font-size: 1rem;
            font-family: inherit; transition: transform 0.3s ease;
        }
        .test-warning-btn:hover { transform: scale(1.05); }
        .test-warning-close {
            position: absolute; top: 0.75rem; right: 1rem; background: none; border: none;
            color: var(--text-muted); font-size: 1.8rem; line-height: 1; cursor: pointer;
        }
        [dir="rtl"] .test-warning-close { right: auto; left: 1rem; }
        .test-warning-close:hover { color: var(--accent-coral); }

        /* [WARNING] Site Story Notice (after the Order section) */
        .site-notice { padding: 5rem 2rem; }
        .site-notice-container { max-width: 1000px; margin: 0 auto; }
        .site-notice-card {
            background: var(--bg-card); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
            border-radius: 20px; padding: 3rem; border: 2px solid var(--accent-coral);
            box-shadow: 0 0 30px rgba(255, 106, 106, 0.2);
        }
        .site-notice-card p { color: var(--text-secondary); line-height: 1.9; margin-bottom: 1.2rem; font-size: 1.1rem; }
        .site-notice-card p strong { color: var(--accent-coral); font-size: 1.3rem; }
        .site-notice-card h3 { color: var(--accent-cyan); font-size: 1.5rem; margin: 2rem 0 1rem; }
        .site-notice-list { list-style: none; margin: 0 0 1.5rem; padding: 0; }
        .site-notice-list li {
            color: var(--text-secondary); line-height: 1.9; font-size: 1.05rem;
            padding: 0.6rem 0; border-bottom: 1px solid var(--border-color);
        }
        .site-notice-list li:last-child { border-bottom: none; }
        .site-notice-card a { color: var(--accent-gold); text-decoration: none; font-weight: 600; overflow-wrap: anywhere; direction: ltr; unicode-bidi: isolate; }
        .site-notice-card a:hover { color: var(--accent-cyan); text-decoration: underline; }
        .site-notice-screenshot {
            display: block; width: 100%; max-width: 900px; margin: 1rem auto 2rem;
            border-radius: 15px; border: 2px solid var(--border-color);
        }
        @media (max-width: 768px) {
            .site-notice-card { padding: 1.5rem; }
            .test-warning-text { font-size: 1.1rem; }
        }

        /* Footer */
        footer {
            background: var(--bg-primary); padding: 3rem 2rem 2rem;
            border-top: 1px solid var(--border-color); text-align: center;
        }
        .footer-content { max-width: 1200px; margin: 0 auto; }
        .footer-logo {
            width: 60px; height: 60px; margin: 0 auto 1rem; border-radius: 15px;
            animation: footer-logo-spin 5s ease infinite;
        }
        @keyframes footer-logo-spin {
            0%, 100% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.1); }
        }
        .social-links { display: flex; justify-content: center; gap: 1rem; margin: 2rem 0; }
        .social-links a {
            width: 50px; height: 50px; background: var(--bg-card); border: 1px solid var(--border-color);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); text-decoration: none; transition: all 0.3s ease; font-size: 1.5rem;
        }
        .social-links a:hover {
            background: var(--gradient-2); border-color: transparent; color: white;
            transform: translateY(-5px) rotate(360deg);
        }
        .disclaimer {
            color: var(--text-muted); font-size: 0.9rem; margin-top: 2rem;
            padding-top: 2rem; border-top: 1px solid var(--border-color);
        }

        /* Responsive Design */
        @media (max-width: 992px) {
             .charity-main {
                grid-template-columns: 1fr;
             }
             .charity-main > .charity-stat-main {
                grid-column: 1 / -1; 
             }
        }
        
        @media (max-width: 768px) {
            .nav-links {
                display: none; position: absolute; top: 100%; left: 0; width: 100%;
                background: var(--bg-primary); flex-direction: column; padding: 2rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
            }
            .nav-links.active { display: flex; }
            .mobile-menu { display: flex; }
            .hero h1 { font-size: 2.5rem; }
            .charity-stats-grid { grid-template-columns: repeat(2, 1fr); }
            .games-grid, .steps-container, .discount-methods, .donors-grid, .contact-container { grid-template-columns: 1fr; }
            .method-title { font-size: 1.5rem; }
            .discount-amount { font-size: 1.3rem; }
            .buyer-card { flex-direction: column; text-align: center; gap: 1.5rem; }
            .buyer-info { margin-left: 0; }
            .buyer-stats { justify-content: center; }
            .satisfaction-number { font-size: 6rem; }
            .charity-title { font-size: 2.5rem; }
            .section-title { font-size: 2.2rem; }
            .ui-controls { bottom: 15px; right: 15px; }
            .language-dropdown-toggle, .theme-toggle-btn { width: 48px; height: 48px; }
        }

        @media (max-width: 480px) {
            .hero h1 { font-size: 2rem; }
            .tagline { font-size: 1.1rem; }
            .hero-buttons { flex-direction: column; width: 100%; gap: 1rem; }
            .cta-button, .secondary-button { width: 100%; padding: 1rem 2rem; font-size: 1rem; }
            .trust-badges { flex-direction: column; gap: 1rem; }
            .badge { width: 100%; }
            .charity-stats-grid { grid-template-columns: 1fr; }
            section { padding: 4rem 1.5rem; }
        }

        /* Loading Animation */
        .loader {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: var(--bg-primary); display: flex; align-items: center;
            justify-content: center; z-index: 9999; transition: opacity 0.5s ease, visibility 0.5s;
        }
        .loader.hidden { opacity: 0; visibility: hidden; }
        .loader-spinner {
            width: 60px; height: 60px; border: 3px solid var(--border-color);
            border-top-color: var(--accent-cyan); border-right-color: var(--accent-coral);
            border-radius: 50%; animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Performance Optimizations */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }
        
        /* Animation Classes */
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }
        .animate-on-scroll.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <!-- Background Elements -->
    <div class="particles" id="particles"></div>

    <!-- Loader -->
    <div class="loader" id="loader">
        <div class="loader-spinner"></div>
    </div>

    <!-- [WARNING] Test Site Warning Popup -->
    <div class="test-warning-overlay" id="testWarning" role="alertdialog" aria-modal="true" aria-labelledby="testWarningText">
        <div class="test-warning-popup">
            <button class="test-warning-close" id="testWarningClose" aria-label="Close warning">&times;</button>
            <div class="test-warning-icon">⚠️</div>
            <p class="test-warning-text" id="testWarningText" data-i18n="warning.text">This website is purely a test idea and is not real!</p>
            <button class="test-warning-btn" id="testWarningOk" data-i18n="warning.button">Got it</button>
        </div>
    </div>

    <!-- UI Controls -->
    <div class="ui-controls">
        <!-- Theme Switcher -->
        <div class="theme-switcher">
            <button class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Toggle light and dark theme">
                <span class="sun-icon">☀️</span>
                <span class="moon-icon">🌙</span>
            </button>
        </div>
        <!-- Language Dropdown -->
        <div class="language-dropdown" id="language-dropdown">
            <button class="language-dropdown-toggle" id="language-dropdown-toggle" aria-label="Select website language">
                <img src="${flagEN}" alt="English Language">
            </button>
            <div class="language-dropdown-menu">
                <button class="lang-option active" data-lang="en">
                    <img src="${flagEN}" alt="USA Flag">
                    <span>English</span>
                </button>
                <button class="lang-option" data-lang="fa">
                    <img src="${flagFA}" alt="Iran Flag">
                    <span>فارسی</span>
                </button>
                <button class="lang-option" data-lang="ja">
                    <img src="${flagJA}" alt="Japan Flag">
                    <span>日本語</span>
                </button>
            </div>
        </div>
    </div>


    <!-- Navigation -->
    <nav id="navbar">
        <div class="nav-container">
            <a href="#home" class="logo">
                <img src="${logoURL}" alt="HalfPlay Games Logo">
                <span>HalfPlay</span>
            </a>
            <ul class="nav-links" id="navLinks">
                <li><a href="#home" data-i18n="nav.home">Home</a></li>
                <li><a href="#how" data-i18n="nav.how">How It Works</a></li>
                <li><a href="#games" data-i18n="nav.games">Games</a></li>
                <li><a href="#discount" data-i18n="nav.discounts">Discounts</a></li>
                <li><a href="#charity" data-i18n="nav.charity">Charity</a></li>
                <li><a href="#donation" data-i18n="nav.donation">Donate</a></li>
                <li><a href="#about" data-i18n="nav.about">About</a></li>
                <li><a href="#faq" data-i18n="nav.faq">FAQ</a></li>
                <li><a href="#contact" data-i18n="nav.order">Order Now</a></li>
            </ul>
            <div class="mobile-menu" id="mobileMenu" aria-label="Toggle mobile menu">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero unified-animated-background" id="home">
        <div class="hero-content animate-on-scroll">
            <div class="hero-badge">
                <span data-i18n="hero.badge">🎮 3785+ Games | 💝 Gaming for Good</span>
            </div>
            <h1 data-i18n="hero.title">Half the Price<br>Double the Impact</h1>
            <p class="tagline" data-i18n="hero.tagline">Get your favorite Steam games at 50% off while supporting charity!</p>
            <div class="hero-buttons">
                <a href="#" class="cta-button instagram-link" target="_blank" rel="noopener noreferrer">
                    <span>📱</span> <span data-i18n="hero.orderBtn">Order on Instagram</span>
                </a>
                <a href="#charity" class="secondary-button">
                    <span>❤️</span> <span data-i18n="hero.impactBtn">Our Impact</span>
                </a>
            </div>
            <div class="trust-badges">
                <div class="badge" style="--i: 0;"><span data-i18n="hero.badge1">✓ 100% Legal</span></div>
                <div class="badge" style="--i: 1;"><span data-i18n="hero.badge2">✓ $5 to Charity per Purchase</span></div>
                <div class="badge" style="--i: 2;"><span data-i18n="hero.badge3">✓ Instant Delivery</span></div>
                <div class="badge" style="--i: 3;"><span data-i18n="hero.badge4">✓ Building a Better World</span></div>
            </div>
        </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works unified-animated-background" id="how">
        <h2 class="section-title animate-on-scroll" data-i18n="how.title">How It Works</h2>
        <div class="steps-container">
            <div class="step tilt-card animate-on-scroll" style="transition-delay: 100ms;">
                <div class="step-number">1</div>
                <div class="step-icon">📱</div>
                <h3 data-i18n="how.step1Title">Message Us</h3>
                <p data-i18n="how.step1Desc">Send us your wishlist on Instagram <span class="insta-user-handle">@halfplaygames</span>. We cover 3785+ Steam games!</p>
            </div>
            <div class="step tilt-card animate-on-scroll" style="transition-delay: 200ms;">
                <div class="step-number">2</div>
                <div class="step-icon">🎮</div>
                <h3 data-i18n="how.step2Title">Account Creation</h3>
                <p data-i18n="how.step2Desc">We create a new Gmail & Steam account with your chosen username and purchase your games.</p>
            </div>
            <div class="step tilt-card animate-on-scroll" style="transition-delay: 300ms;">
                <div class="step-number">3</div>
                <div class="step-icon">💳</div>
                <h3 data-i18n="how.step3Title">Secure Payment</h3>
                <p data-i18n="how.step3Desc">Pay 50% of the game price through our secure payment gateway or USDT crypto.</p>
            </div>
            <div class="step tilt-card animate-on-scroll" style="transition-delay: 400ms;">
                <div class="step-number">4</div>
                <div class="step-icon">❤️</div>
                <h3 data-i18n="how.step4Title">Making Impact</h3>
                <p data-i18n="how.step4Desc">$5 from your purchase goes to charity, and you get instant access to your games!</p>
            </div>
        </div>
    </section>

    <!-- Featured Games Section -->
    <section class="featured-games unified-animated-background" id="games">
        <h2 class="section-title animate-on-scroll" data-i18n="games.title">Featured Collections</h2>
        <div class="games-slider animate-on-scroll">
            <div class="games-container" id="gamesContainer">
                <!-- Souls Series -->
                <div class="game-slide">
                    <h3 data-i18n="games.souls">⚔️ Souls Series Collection</h3>
                    <div class="games-grid">
                        <div class="game-card tilt-card" role="img" aria-label="DARK SOULS III PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">DARK SOULS III</h4>
                                <div class="price-container">
                                    <span class="original-price">$59.99</span>
                                    <span class="discount-price">$29.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="ELDEN RING PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">ELDEN RING</h4>
                                <div class="price-container">
                                    <span class="original-price">$59.99</span>
                                    <span class="discount-price">$29.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="Sekiro: Shadows Die Twice PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Sekiro: Shadows Die Twice</h4>
                                <div class="price-container">
                                    <span class="original-price">$59.99</span>
                                    <span class="discount-price">$29.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="DARK SOULS II PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/236430/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">DARK SOULS II</h4>
                                <div class="price-container">
                                    <span class="original-price">$39.99</span>
                                    <span class="discount-price">$19.99</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Call of Duty Series -->
                <div class="game-slide">
                    <h3 data-i18n="games.cod">🔫 Call of Duty Collection</h3>
                    <div class="games-grid">
                        <div class="game-card tilt-card" role="img" aria-label="Call of Duty: Modern Warfare III PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/1962663/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Call of Duty: MW III</h4>
                                <div class="price-container">
                                    <span class="original-price">$69.99</span>
                                    <span class="discount-price">$34.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="Call of Duty: Modern Warfare II PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/1938090/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Call of Duty: MW II</h4>
                                <div class="price-container">
                                    <span class="original-price">$69.99</span>
                                    <span class="discount-price">$34.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="Call of Duty: Black Ops 6 PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/1985810/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Call of Duty: Black Ops 6</h4>
                                <div class="price-container">
                                    <span class="original-price">$69.99</span>
                                    <span class="discount-price">$34.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="Call of Duty: Modern Warfare Remastered PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/393080/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Call of Duty: MW Remastered</h4>
                                <div class="price-container">
                                    <span class="original-price">$39.99</span>
                                    <span class="discount-price">$19.99</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resident Evil Series -->
                <div class="game-slide">
                    <h3 data-i18n="games.re">🧟 Resident Evil Collection</h3>
                    <div class="games-grid">
                        <div class="game-card tilt-card" role="img" aria-label="Resident Evil 4 PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Resident Evil 4</h4>
                                <div class="price-container">
                                    <span class="original-price">$59.99</span>
                                    <span class="discount-price">$29.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="Resident Evil 2 PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/883710/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Resident Evil 2</h4>
                                <div class="price-container">
                                    <span class="original-price">$39.99</span>
                                    <span class="discount-price">$19.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="Resident Evil 3 PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/952060/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Resident Evil 3</h4>
                                <div class="price-container">
                                    <span class="original-price">$39.99</span>
                                    <span class="discount-price">$19.99</span>
                                </div>
                            </div>
                        </div>
                        <div class="game-card tilt-card" role="img" aria-label="Resident Evil Village PC game at 50% off">
                            <div class="game-discount">-50%</div>
                            <div class="game-cover" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url('https://cdn.cloudflare.steamstatic.com/steam/apps/1196590/header.jpg');"></div>
                            <div class="game-info">
                                <h4 class="game-title">Resident Evil Village</h4>
                                <div class="price-container">
                                    <span class="original-price">$39.99</span>
                                    <span class="discount-price">$19.99</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="slider-nav">
            <button class="slider-btn active" data-slide="0" data-i18n="games.btn1">Souls Series</button>
            <button class="slider-btn" data-slide="1" data-i18n="games.btn2">Call of Duty</button>
            <button class="slider-btn" data-slide="2" data-i18n="games.btn3">Resident Evil</button>
        </div>
        <p style="text-align: center; margin-top: 3rem; color: var(--text-secondary); font-size: 1.2rem;">
            <strong style="color: var(--accent-cyan);">+ 3782</strong> <span data-i18n="games.more">more games available!</span>
        </p>
        <div style="text-align: center; margin-top: 2rem;">
            <a href="#" class="cta-button instagram-link" target="_blank" rel="noopener noreferrer">
                📱 <span data-i18n="games.orderBtn">Order Now & Support Charity</span>
            </a>
        </div>
    </section>

    <!-- Discount Section -->
    <section class="discount-section unified-animated-background" id="discount">
        <div class="discount-container">
            <h2 class="section-title animate-on-scroll" data-i18n="discount.title">How to Get Extra Discounts?</h2>
            <div class="discount-note animate-on-scroll">
                <p data-i18n="discount.note1">⚠️ Important: Discounts apply to your TOTAL purchase when buying 2+ games!</p>
                <p style="font-size: 1rem; margin-top: 0.5rem;" data-i18n="discount.note2">Minimum purchase: 2 games to unlock discount offers</p>
            </div>
            
            <div class="discount-methods">
                <div class="discount-method animate-on-scroll" style="transition-delay: 100ms;">
                    <div class="method-header">
                        <span class="method-icon">🎁</span>
                        <h3 class="method-title" data-i18n="discount.firstTime">First-Time Buyers</h3>
                    </div>
                    <div class="discount-amount" data-i18n="discount.firstDiscount">$5 OFF Total Purchase (2+ Games)</div>
                    <ul class="method-steps">
                        <li style="--i: 0;" data-i18n="discount.step1">Purchase 2 or more games to qualify</li>
                        <li style="--i: 1;" data-i18n="discount.step2">Upload our promo image to your Instagram Story</li>
                        <li style="--i: 2;" data-i18n="discount.step3">Tag <span class="insta-user-handle">@halfplaygames</span> in the story</li>
                        <li style="--i: 3;" data-i18n="discount.step4">Add the story to a Highlight named "HalfPlay Games"</li>
                        <li style="--i: 4;" data-i18n="discount.step5">Never delete it from your Instagram</li>
                        <li style="--i: 5;" data-i18n="discount.step6">Get $5 off your total order!</li>
                    </ul>
                    <img src="${promoURL}" alt="HalfPlay Games Promotional Image for Instagram Story" class="promo-image">
                </div>
                
                <div class="discount-method animate-on-scroll" style="transition-delay: 200ms;">
                    <div class="method-header">
                        <span class="method-icon">⭐</span>
                        <h3 class="method-title" data-i18n="discount.returning">Returning Customers</h3>
                    </div>
                    <div class="discount-amount" data-i18n="discount.returningDiscount">$10 OFF Total Purchase (2+ Games)</div>
                    <ul class="method-steps">
                        <li style="--i: 0;" data-i18n="discount.rstep1">Purchase 2 or more games to qualify</li>
                        <li style="--i: 1;" data-i18n="discount.rstep2">Take a screenshot of your Steam library</li>
                        <li style="--i: 2;" data-i18n="discount.rstep3">Share your satisfaction in an Instagram Story</li>
                        <li style="--i: 3;" data-i18n="discount.rstep4">Tag <span class="insta-user-handle">@halfplaygames</span> in the story</li>
                        <li style="--i: 4;" data-i18n="discount.rstep5">Add to a Highlight named "HalfPlay Games"</li>
                        <li style="--i: 5;" data-i18n="discount.rstep6">Keep it on your profile permanently</li>
                        <li style="--i: 6;" data-i18n="discount.rstep7">Enjoy $10 off your total order!</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <!-- Charity Section -->
    <section class="charity-section unified-animated-background" id="charity">
        <div class="charity-container">
            <div class="charity-header animate-on-scroll">
                <h2 class="charity-title" data-i18n="charity.title">Gaming for Good</h2>
                <p class="charity-subtitle" data-i18n="charity.subtitle">Every Purchase Makes a Difference</p>
                <p class="charity-description" data-i18n="charity.description">
                    At HalfPlay Games, we believe in the power of gaming to change lives. That's why <strong>$5 from every purchase</strong> goes directly to charity. 
                    We support food banks, homeless shelters, and those in need. As we grow, our vision expands to building schools, hospitals, nursing homes, and orphanages in underserved communities worldwide.
                </p>
            </div>

            <div class="charity-main">
                <div class="charity-stat-main animate-on-scroll" style="transition-delay: 100ms;">
                    <div class="charity-icon">💰</div>
                    <div class="charity-number" data-target="0">$0</div>
                    <div class="charity-label" data-i18n="charity.stat1">Total Donated to Charity</div>
                </div>
                <div class="charity-stats-grid">
                    <div class="charity-stat tilt-card animate-on-scroll" style="transition-delay: 200ms;">
                        <div class="charity-icon">🏫</div>
                        <div class="charity-number" data-target="0">0</div>
                        <div class="charity-label" data-i18n="charity.stat2">Schools Built</div>
                    </div>
                    <div class="charity-stat tilt-card animate-on-scroll" style="transition-delay: 300ms;">
                        <div class="charity-icon">🏥</div>
                        <div class="charity-number" data-target="0">0</div>
                        <div class="charity-label" data-i18n="charity.stat3">Hospitals Built</div>
                    </div>
                    <div class="charity-stat tilt-card animate-on-scroll" style="transition-delay: 400ms;">
                        <div class="charity-icon">🏠</div>
                        <div class="charity-number" data-target="0">0</div>
                        <div class="charity-label" data-i18n="charity.stat4">Nursing Homes Built</div>
                    </div>
                    <div class="charity-stat tilt-card animate-on-scroll" style="transition-delay: 500ms;">
                        <div class="charity-icon">👶</div>
                        <div class="charity-number" data-target="0">0</div>
                        <div class="charity-label" data-i18n="charity.stat5">Orphanages Built</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Donation Section -->
    <section class="donation-section unified-animated-background" id="donation">
        <div class="donation-container">
            <h2 class="section-title animate-on-scroll" data-i18n="donation.title">Support Our Mission</h2>
            <div class="donation-card animate-on-scroll">
                <h3 class="donation-title" data-i18n="donation.cardTitle">💝 Donate to HalfPlay Games</h3>
                <p class="donation-text" data-i18n="donation.text">
                    Your donations help us expand our charity work and build a better world through gaming. 
                    50% of every donation goes directly to charity initiatives!
                </p>
                <a href="https://amircollider.com/donate" target="_blank" class="donation-link" data-i18n="donation.button">
                    Donate Now via AmirCollider.com 💖
                </a>
            </div>
            <div class="donation-info animate-on-scroll">
                <p data-i18n="donation.info1">
                    <strong>How your donation helps:</strong> Half of your donation amount goes directly to charity initiatives including food banks, homeless shelters, and future projects like schools and hospitals.
                </p>
                <p data-i18n="donation.info2">
                    <strong>Recognition:</strong> Your name will be added to our donors list within 48 hours (unless you prefer to remain anonymous).
                </p>
                <p data-i18n="donation.info3">
                    <strong>Privacy:</strong> If you wish to remain anonymous or use a different name, please send us a message on Instagram with your donation details and preference.
                </p>
            </div>
        </div>
    </section>

    <!-- Donors Section -->
    <section class="donors-section unified-animated-background">
        <div class="donors-container">
            <div class="donors-header animate-on-scroll">
                <h2 class="donors-title" data-i18n="donors.title">Our Amazing Donors</h2>
                <p class="donors-subtitle" data-i18n="donors.subtitle">Thank you for making a difference! 50% of donations go to charity.</p>
            </div>
            <div class="donors-grid" id="donorsGrid">
                <div class="no-donors animate-on-scroll">
                    <div class="no-donors-icon">🎁</div>
                    <h3 class="no-donors-title" data-i18n="donors.noTitle">Be Our First Donor!</h3>
                    <p class="no-donors-message" data-i18n="donors.noMessage">
                        Your donation will help us expand our charity work and build a better world. 
                        Be the first to support our mission!
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Customer Satisfaction Section -->
    <section class="customer-satisfaction unified-animated-background">
        <div class="satisfaction-container animate-on-scroll">
            <h2 class="section-title" data-i18n="satisfaction.title">Customer Satisfaction</h2>
            <div class="satisfaction-number" data-target="0">0</div>
            <p class="satisfaction-text" data-i18n="satisfaction.text">Happy Customers</p>
            <div class="satisfaction-message">
                <p data-i18n="satisfaction.message">We're just getting started! Be among the first to join our gaming community and help us make a difference in the world.</p>
            </div>
        </div>
    </section>

    <!-- Top Buyers Section -->
    <section class="top-buyers unified-animated-background">
        <div class="buyers-container">
            <h2 class="section-title animate-on-scroll" data-i18n="buyers.title">Top Buyers Leaderboard</h2>
            <div class="leaderboard">
                <div class="empty-leaderboard animate-on-scroll">
                    <div class="empty-icon">🏆</div>
                    <h3 class="empty-title" data-i18n="buyers.emptyTitle">No Top Buyers Yet</h3>
                    <p class="empty-message" data-i18n="buyers.emptyMessage">
                        Be the first to claim your spot on our leaderboard!<br>
                        Purchase games and support charity to become a top buyer.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="about unified-animated-background" id="about">
        <div class="about-container">
            <h2 class="section-title animate-on-scroll" data-i18n="about.title">Our Story</h2>
            <div class="about-story tilt-card animate-on-scroll">
                <div class="about-story-icons"></div>
                <h3 data-i18n="about.whyTitle">Why HalfPlay Games?</h3>
                <p data-i18n="about.p1">
                    We believe gaming should be accessible to everyone, regardless of their financial situation. 
                    That's why we created HalfPlay Games - a platform where you pay half, we pay half, and together we make gaming affordable.
                </p>
                <p data-i18n="about.p2">
                    But we're more than just discounts. Every purchase you make contributes $5 to charity. 
                    Our dream is to build schools, hospitals, nursing homes, and orphanages around the world.
                </p>
                <div class="about-highlight" data-i18n="about.quote">
                    "Gaming isn't just entertainment - it's a community that can change the world."
                </div>
                <p data-i18n="about.p3">
                    Join us in our mission to make gaming accessible while building a better tomorrow. 
                    Together, we're not just playing games - we're playing for good.
                </p>
                <div class="signature">~ AC, Founder of HalfPlay Games</div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="faq-section unified-animated-background" id="faq">
        <h2 class="section-title animate-on-scroll" data-i18n="faq.title">Frequently Asked Questions</h2>
        <div class="faq-container">
            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 100ms;">
                <div class="faq-question">
                    <span class="faq-number">1</span>
                    <h3 data-i18n="faq.q1">Is this transaction legal?</h3>
                </div>
                <div class="faq-answer" data-i18n="faq.a1">
                    Yes, absolutely! Our service is 100% legal and safe. We purchase games directly through Steam's official platform.
                </div>
            </div>

            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 150ms;">
                <div class="faq-question">
                    <span class="faq-number">2</span>
                    <h3 data-i18n="faq.q2">Will games be added to my personal Steam account?</h3>
                </div>
                <div class="faq-answer" data-i18n="faq.a2">
                    No. We create a new random Gmail and Steam account for your games. This method significantly reduces the risk of account suspension.
                </div>
            </div>

            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 200ms;">
                <div class="faq-question">
                    <span class="faq-number">3</span>
                    <h3 data-i18n="faq.q3">Is there a chance of the purchased account being banned?</h3>
                </div>
                <div class="faq-answer" data-i18n="faq.a3">
                    Yes, but this chance is less than 5%, which is normal and manageable.
                </div>
            </div>

            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 250ms;">
                <div class="faq-question">
                    <span class="faq-number">4</span>
                    <h3 data-i18n="faq.q4">How can we reduce the ban risk to nearly zero?</h3>
                </div>
                <div class="faq-answer">
                    <span data-i18n="faq.a4">Follow these tips to minimize risk:</span>
                    <div class="important-tip">
                        <strong>1.</strong> <span data-i18n="faq.a4tip1">Connect your phone number to both Gmail and Steam accounts (use the same number)</span><br>
                        <strong>2.</strong> <span data-i18n="faq.a4tip2">Add the same profile picture to both Gmail and Steam</span><br>
                        <strong>3.</strong> <span data-i18n="faq.a4tip3">Never change your Steam username - tell us your preferred username before purchase so we can set it during account creation</span>
                    </div>
                </div>
            </div>

            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 300ms;">
                <div class="faq-question">
                    <span class="faq-number">5</span>
                    <h3 data-i18n="faq.q5">Can I play online multiplayer?</h3>
                </div>
                <div class="faq-answer" data-i18n="faq.a5">
                    Yes! All purchased games come with full functionality including online multiplayer. You can play with your friends without any restrictions.
                </div>
            </div>

            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 350ms;">
                <div class="faq-question">
                    <span class="faq-number">6</span>
                    <h3 data-i18n="faq.q6">Why can't you provide certain games?</h3>
                </div>
                <div class="faq-answer" data-i18n="faq.a6">
                    Well, this is a bit personal 😅 But we cover a vast library of games. We apologize that we cannot provide every single game 🙏
                </div>
            </div>

            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 400ms;">
                <div class="faq-question">
                    <span class="faq-number">7</span>
                    <h3 data-i18n="faq.q7">Is there a refund policy?</h3>
                </div>
                <div class="faq-answer" data-i18n="faq.a7">
                    Yes! If your account gets banned within 48 hours after purchase, we provide a 100% refund and apologize for the inconvenience.
                </div>
            </div>

            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 450ms;">
                <div class="faq-question">
                    <span class="faq-number">8</span>
                    <h3 data-i18n="faq.q8">Will I receive a receipt?</h3>
                </div>
                <div class="faq-answer">
                    <span data-i18n="faq.a8">Yes! We'll email you a certificate that includes:</span>
                    <div class="important-tip">
                        <span data-i18n="faq.a8list">
                        • A thank you message<br>
                        • List of purchased games<br>
                        • Your Steam email<br>
                        • Date and purchase price<br>
                        • A personal signature from me!<br><br>
                        You can print and frame this certificate to keep forever!
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 500ms;">
                <div class="faq-question">
                    <span class="faq-number">9</span>
                    <h3 data-i18n="faq.q9">On repurchase, is a new account created or are games added to the previous one?</h3>
                </div>
                <div class="faq-answer" data-i18n="faq.a9">
                   Both are possible. We respect your choice.
                </div>
            </div>
            
            <div class="faq-item tilt-card animate-on-scroll" style="transition-delay: 550ms;">
                <div class="faq-question">
                    <span class="faq-number">10</span>
                    <h3 data-i18n="faq.q10">Is it possible for the site to go down?</h3>
                </div>
                <div class="faq-answer" data-i18n="faq.a10">
                   No, that's impossible. But if it happens, we will be back in less than a month with the domain halfplaygames.com.
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="contact unified-animated-background" id="contact">
        <h2 class="section-title animate-on-scroll" data-i18n="contact.title">Order Now & Make a Difference</h2>
        <div class="contact-container">
            <div class="payment-info animate-on-scroll" style="transition-delay: 100ms;">
                <h3 data-i18n="contact.orderTitle">📱 Order on Instagram</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;" data-i18n="contact.orderText">
                    Send us your wishlist and help change lives!
                </p>
                <a href="#" class="instagram-button instagram-link" target="_blank" rel="noopener noreferrer">
                    <span class="insta-user-handle">@halfplaygames</span>
                </a>
                
                <div class="payment-methods">
                    <h3 data-i18n="contact.paymentTitle">💳 Payment Methods</h3>
                    <div class="payment-method">
                        <h4 data-i18n="contact.onlinePayment">🌐 Online Payment</h4>
                        <a href="https://amircollider.com/donate" target="_blank" class="payment-link">
                            amircollider.com/donate →
                        </a>
                    </div>
                </div>
            </div>
            
            <div class="payment-info animate-on-scroll" style="transition-delay: 200ms;">
                <h3 data-i18n="contact.whyTitle">✨ Why Choose HalfPlay?</h3>
                <ul style="list-style: none; color: var(--text-secondary); line-height: 2.5;" data-i18n="contact.whyList">
                    <li>✅ Save 50% on All Games</li>
                    <li>❤️ $5 to Charity per Purchase</li>
                    <li>✅ 100% Legal and Secure</li>
                    <li>✅ 3785+ Games Available</li>
                    <li>✅ Instant Delivery</li>
                    <li>✅ Full Multiplayer Access</li>
                    <li>🌟 Help Build Schools & Hospitals</li>
                    <li>🌍 Be Part of Something Bigger</li>
                </ul>
            </div>
        </div>
    </section>

    <!-- [WARNING] Site Story Notice -->
    <section class="site-notice unified-animated-background" id="notice">
        <div class="site-notice-container">
            <h2 class="section-title animate-on-scroll" data-i18n="notice.title">Important Notice</h2>
            <div class="site-notice-card animate-on-scroll">
                <div data-i18n="notice.story1">
                    <p><strong>Hi, I'm AmirCollider!</strong></p>
                    <p>I want to tell you the story of this website.</p>
                    <p>This is the first website I ever built, and actually my second attempt at making a website in my life. I built it on a Cloudflare Worker, but not on my main Cloudflare email. I built it on an email called halfplaygamesrc@gmail.com (please don't email it; even though I still have it, I never open it!).</p>
                    <p>It was a single 2,000-line worker.js file, made on August 18, 2025. Today, as I'm writing this, it's September 25, 2026.</p>
                    <p>Honestly, I didn't remember any of this until I was browsing Google and, completely by chance, stumbled onto this site, and everything came back to me!</p>
                    <p>I really don't remember why I built something like this. Maybe just a random idea? I also saw that I had uploaded the site's images, like the logo and the flags, to GitHub instead of Cloudflare R2! And just like the site itself, not on my main GitHub, but on a GitHub account with the email halfplaygamesrc@gmail.com (here's a screenshot of it). I had even verified the site on Google Search Console!</p>
                </div>
                <img src="${githubScreenshotURL}" alt="Screenshot of the old halfplaygames GitHub account" class="site-notice-screenshot" loading="lazy">
                <div data-i18n="notice.story2">
                    <h3>So what did I do with it now?</h3>
                    <p>I didn't update the code structure. I left the same old messy code as it was, because this was the first website I ever built and published!</p>
                    <p>I only made a few changes:</p>
                    <ul class="site-notice-list">
                        <li>1 - I added warnings saying the site isn't real and is just an interactive idea!</li>
                        <li>2 - I added this very text you're reading!</li>
                        <li>3 - The payment section of this site used a crypto link and a Reymit link. I changed it to point to my main website: <a href="https://amircollider.com/donate" target="_blank" rel="noopener">https://amircollider.com/donate</a>!</li>
                        <li>4 - I moved the worker from the halfplaygamesrc@gmail.com email to my own email.</li>
                        <li>5 - The site's code used to live on Cloudflare itself. Now I've moved it to my personal GitHub: <a href="https://github.com/AmirCollider" target="_blank" rel="noopener">https://github.com/AmirCollider</a><br>Of course, I made the code private, so you can't see it on my account!</li>
                        <li>6 - I changed how the images are loaded, from GitHub to Cloudflare R2, because the site can't read images from a private GitHub repository!</li>
                        <li>7 - I moved Google Search Console from the halfplaygamesrc@gmail.com email to my main email and verified it again.</li>
                    </ul>
                    <p>In short: this is the same simple old 2,000-line code, just moved from the halfplaygamesrc@gmail.com email (which has no use anymore) to my personal email, so I never forget this thing existed!</p>
                    <p>Oh, and in case you were wondering what my first website was: a domain called giftcollider.com, which no longer exists.</p>
                    <p>It was an attempt to build a gift card store with WordPress. After that I switched to pure coding, and every single one of my websites is just code. No plugins, no WordPress, no ready-made themes, nothing else!</p>
                    <p>And this is the link to my current main website: <a href="https://amircollider.com/" target="_blank" rel="noopener">https://amircollider.com/</a></p>
                    <p><strong>Thank you for your attention, I love you all!</strong></p>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="footer-content">
            <img src="${logoURL}" alt="HalfPlay Games Logo Footer" class="footer-logo">
            <h3 style="color: var(--accent-cyan); margin-bottom: 1rem; font-family: 'Orbitron', sans-serif;">HalfPlay Games</h3>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;" data-i18n="footer.tagline">
                Gaming for Good - Half the Price, Double the Impact
            </p>
            <div class="social-links">
                <a href="#" class="instagram-link" target="_blank" rel="noopener noreferrer" aria-label="Visit our Instagram">📷</a>
                <a href="#" class="instagram-link" target="_blank" rel="noopener noreferrer" aria-label="Message us on Instagram">💬</a>
                <a href="#" class="instagram-link" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">❤️</a>
            </div>
            <p class="disclaimer" data-i18n="footer.disclaimer">
                Not affiliated with Valve Corporation or Steam. All trademarks are property of their respective owners.
            </p>
            <p style="margin-top: 1rem; color: var(--text-muted);" data-i18n="footer.copyright">
                © 2025 HalfPlay Games. Made with ❤️ by AC for gamers and communities worldwide.
            </p>
        </div>
    </footer>

    <script>
        // [SEO-ENHANCEMENT] محتوای ترجمه‌ها غنی‌تر شده و کلمات کلیدی بیشتری در آن گنجانده شده است
        const translations = {
            en: {
                nav: { home: "Home", how: "How It Works", games: "Games", discounts: "Discounts", charity: "Charity", donation: "Donate", about: "About", faq: "FAQ", order: "Order Now" },
                hero: { badge: "🎮 3785+ PC Games | 💝 Gaming for Good", title: "Half the Price<br>Double the Impact", tagline: "Get your favorite Steam PC games at 50% off while supporting our charity mission!", orderBtn: "Order on Instagram", impactBtn: "Our Impact", badge1: "✓ 100% Legal & Safe", badge2: "✓ $5 to Charity per Purchase", badge3: "✓ Instant Game Delivery", badge4: "✓ Building a Better World" },
                how: { title: "How It Works: 4 Simple Steps", step1Title: "Message Us Your Wishlist", step1Desc: "Send us your list of desired PC games on Instagram <span class='insta-user-handle'>@halfplaygames</span>. We cover over 3785 Steam titles!", step2Title: "Safe Account Creation", step2Desc: "We create a new, secure Gmail & Steam account with your chosen username and legally purchase your games.", step3Title: "Secure Payment", step3Desc: "Pay just 50% of the official game price through our secure payment gateway or with USDT crypto.", step4Title: "Make an Impact", step4Desc: "$5 from your purchase goes directly to charity, and you get instant access to your new games!" },
                games: { title: "Featured PC Game Collections", souls: "⚔️ Souls Series Steam Collection", cod: "🔫 Call of Duty Steam Collection", re: "🧟 Resident Evil Steam Collection", btn1: "Souls Series", btn2: "Call of Duty", btn3: "Resident Evil", more: "more amazing PC games available!", orderBtn: "Order Now & Support Charity" },
                discount: { title: "How to Get Extra Game Discounts?", note1: "⚠️ Important: Extra discounts apply to your TOTAL purchase when buying 2 or more games!", note2: "Minimum purchase: 2 games to unlock these special discount offers.", firstTime: "First-Time Buyers Discount", firstDiscount: "$5 OFF Total Purchase (2+ Games)", step1: "Purchase 2 or more PC games to qualify for the discount.", step2: "Upload our promo image to your Instagram Story.", step3: "Tag <span class='insta-user-handle'>@halfplaygames</span> in the story.", step4: "Add the story to a Highlight on your profile named \\"HalfPlay Games\\"", step5: "Never delete the highlight from your Instagram profile.", step6: "Receive an instant $5 off your total order!", returning: "Returning Customers Loyalty", returningDiscount: "$10 OFF Total Purchase (2+ Games)", rstep1: "Purchase 2 or more PC games to qualify for the loyalty discount.", rstep2: "Take a screenshot of your new Steam library from us.", rstep3: "Share your satisfaction and the screenshot in an Instagram Story.", rstep4: "Tag <span class='insta-user-handle'>@halfplaygames</span> in the story.", rstep5: "Add this new story to your \\"HalfPlay Games\\" Highlight.", rstep6: "Keep the highlight on your profile permanently.", rstep7: "Enjoy a huge $10 off your total order as a thank you!" },
                charity: { title: "Gaming for Good", subtitle: "Every PC Game Purchase Makes a Difference", description: "At HalfPlay Games, we believe in the power of the gaming community to change lives. That's why <strong>$5 from every single PC game purchase</strong> goes directly to charity. We currently support food banks, homeless shelters, and people in need. As we grow, our vision is to use these funds to build schools, hospitals, nursing homes, and orphanages in underserved communities worldwide.", stat1: "Total Donated to Charity", stat2: "Schools Built", stat3: "Hospitals Built", stat4: "Nursing Homes Built", stat5: "Orphanages Built" },
                donation: { title: "Support Our Charity Mission", cardTitle: "💝 Donate to HalfPlay Games", text: "Your direct donations amplify our ability to expand our charity work and build a better world through the power of gaming. A full 50% of every donation goes directly to our charity initiatives!", button: "Donate Now via AmirCollider.com 💖", info1: "<strong>How your donation helps:</strong> Half of your donation amount goes directly to charity initiatives including food banks, homeless shelters, and our future projects like building schools and hospitals.", info2: "<strong>Donor Recognition:</strong> Your name will be proudly added to our donors list within 48 hours (unless you prefer to remain anonymous).", info3: "<strong>Privacy:</strong> If you wish to remain anonymous or use a different name, please send us a message on Instagram with your donation details and we will respect your preference." },
                donors: { title: "Our Amazing Donors", subtitle: "Thank you for making a difference! 50% of all donations go directly to charity.", noTitle: "Be Our First Donor!", noMessage: "Your donation will kickstart our charity fund and help us build a better world. Be the first hero to support our mission!" },
                satisfaction: { title: "Customer Satisfaction", text: "Happy PC Gamers", message: "We're just getting started on our mission! Be among the first to join our unique gaming community and help us make a real-world difference." },
                buyers: { title: "Top Buyers Leaderboard", emptyTitle: "The Leaderboard is Empty", emptyMessage: "Be the first to claim your spot on our leaderboard!<br>Purchase PC games and support charity to become a celebrated top buyer." },
                about: { title: "Our Story", whyTitle: "Why HalfPlay Games Exists", p1: "We are gamers who believe that amazing PC gaming experiences should be accessible to everyone, regardless of their financial situation. That's why we created HalfPlay Games - a unique platform where you pay half, we pay half, and together we make PC gaming affordable.", p2: "But we're about more than just game discounts. We are a mission-driven company. Every purchase you make contributes $5 to charity. Our ultimate dream is to build schools, hospitals, nursing homes, and orphanages around the world, funded by our gaming community.", quote: "\\"Gaming isn't just entertainment - it's a powerful community that can genuinely change the world for the better.\\"", p3: "Join us in our mission to make PC gaming accessible while building a better tomorrow. Together, we're not just playing games - we're playing for good." },
                faq: { title: "Frequently Asked Questions (FAQ)", q1: "Is this service for buying cheap games legal?", a1: "Yes, absolutely! Our service is 100% legal and safe. We purchase PC games directly through Steam's official platform using fully legitimate payment methods.", q2: "Will games be added to my personal Steam account?", a2: "No. To ensure maximum safety and to prevent any issues, we create a new random Gmail and Steam account for your games. This method significantly reduces the risk of account suspension.", q3: "Is there a chance of the purchased Steam account being banned?", a3: "Yes, but this chance is extremely low, less than 5%. This is a normal and manageable risk in this process.", q4: "How can we reduce the ban risk to nearly zero?", a4: "Follow these simple tips to minimize all risks:", a4tip1: "Connect your personal phone number to both the new Gmail and Steam accounts (use the same number for both).", a4tip2: "Add the same profile picture to both your new Gmail and Steam accounts.", a4tip3: "Never change your Steam username. Tell us your preferred username before purchase so we can set it for you during account creation.", q5: "Can I play online multiplayer with these games?", a5: "Yes! All purchased games come with full online functionality including multiplayer. You can play with your friends and the entire community without any restrictions.", q6: "Why can't you provide certain specific games?", a6: "Well, this is a bit personal 😅 But we cover a vast library of over 3785 games. We apologize that we cannot provide every single game, but we can get most of them!", q7: "Is there a refund policy for game purchases?", a7: "Yes! We offer a 48-hour guarantee. If your account gets banned within 48 hours after purchase, we provide a 100% refund and sincerely apologize for the inconvenience.", q8: "Will I receive a receipt for my purchase?", a8: "Yes! You will receive much more than a receipt. We'll email you a personalized digital certificate that includes:", a8list: "• A personal thank you message<br>• A list of your new purchased games<br>• Your new Steam email<br>• The date and purchase price<br>• A personal signature from me, the founder!<br><br>You can print and frame this certificate to keep forever!", q9: "On repurchase, is a new account created or are games added to the previous one?", a9: "Both are possible. We respect your choice and can do whichever you prefer.", q10: "Is it possible for the HalfPlay Games site to go down?", a10: "No, that's practically impossible as we are hosted on the Cloudflare global network. But in the extremely unlikely event that it happens, we will be back in less than a month with our primary domain halfplaygames.com." },
                contact: { title: "Order Your Games Now & Make a Difference", orderTitle: "📱 Order via Instagram", orderText: "Send us your game wishlist and help change the world, one game at a time!", paymentTitle: "💳 Secure Payment Methods", onlinePayment: "🌐 Online Payment (AmirCollider.com)", whyTitle: "✨ Why Choose HalfPlay Games?", whyList: '<li>✅ Save 50% on All PC Games</li><li>❤️ $5 to Charity per Purchase</li><li>✅ 100% Legal and Secure Process</li><li>✅ 3785+ Steam Games Available</li><li>✅ Instant Delivery After Payment</li><li>✅ Full Online Multiplayer Access</li><li>🌟 Help Fund Schools & Hospitals</li><li>🌍 Be Part of Something Bigger</li>' },
                footer: { tagline: "Gaming for Good - Half the Price, Double the Impact", disclaimer: "HalfPlay Games is not affiliated with Valve Corporation or Steam. All trademarks are property of their respective owners in the US and other countries.", copyright: "© 2025 HalfPlay Games. Made with ❤️ by AC for gamers and communities worldwide." },
                warning: { text: "This website is purely a test idea and is not real!", button: "Got it" },
                notice: { title: "Important Notice", story1: "<p><strong>Hi, I'm AmirCollider!</strong></p><p>I want to tell you the story of this website.</p><p>This is the first website I ever built, and actually my second attempt at making a website in my life. I built it on a Cloudflare Worker, but not on my main Cloudflare email. I built it on an email called halfplaygamesrc@gmail.com (please don't email it; even though I still have it, I never open it!).</p><p>It was a single 2,000-line worker.js file, made on August 18, 2025. Today, as I'm writing this, it's September 25, 2026.</p><p>Honestly, I didn't remember any of this until I was browsing Google and, completely by chance, stumbled onto this site, and everything came back to me!</p><p>I really don't remember why I built something like this. Maybe just a random idea? I also saw that I had uploaded the site's images, like the logo and the flags, to GitHub instead of Cloudflare R2! And just like the site itself, not on my main GitHub, but on a GitHub account with the email halfplaygamesrc@gmail.com (here's a screenshot of it). I had even verified the site on Google Search Console!</p>", story2: "<h3>So what did I do with it now?</h3><p>I didn't update the code structure. I left the same old messy code as it was, because this was the first website I ever built and published!</p><p>I only made a few changes:</p><ul class='site-notice-list'><li>1 - I added warnings saying the site isn't real and is just an interactive idea!</li><li>2 - I added this very text you're reading!</li><li>3 - The payment section of this site used a crypto link and a Reymit link. I changed it to point to my main website: <a href='https://amircollider.com/donate' target='_blank' rel='noopener'>https://amircollider.com/donate</a>!</li><li>4 - I moved the worker from the halfplaygamesrc@gmail.com email to my own email.</li><li>5 - The site's code used to live on Cloudflare itself. Now I've moved it to my personal GitHub: <a href='https://github.com/AmirCollider' target='_blank' rel='noopener'>https://github.com/AmirCollider</a><br>Of course, I made the code private, so you can't see it on my account!</li><li>6 - I changed how the images are loaded, from GitHub to Cloudflare R2, because the site can't read images from a private GitHub repository!</li><li>7 - I moved Google Search Console from the halfplaygamesrc@gmail.com email to my main email and verified it again.</li></ul><p>In short: this is the same simple old 2,000-line code, just moved from the halfplaygamesrc@gmail.com email (which has no use anymore) to my personal email, so I never forget this thing existed!</p><p>Oh, and in case you were wondering what my first website was: a domain called giftcollider.com, which no longer exists.</p><p>It was an attempt to build a gift card store with WordPress. After that I switched to pure coding, and every single one of my websites is just code. No plugins, no WordPress, no ready-made themes, nothing else!</p><p>And this is the link to my current main website: <a href='https://amircollider.com/' target='_blank' rel='noopener'>https://amircollider.com/</a></p><p><strong>Thank you for your attention, I love you all!</strong></p>" }
            },
            fa: {
                nav: { home: "خانه", how: "نحوه کار", games: "بازی‌ها", discounts: "تخفیف‌ها", charity: "خیریه", donation: "حمایت مالی", about: "درباره ما", faq: "سوالات متداول", order: "سفارش دهید" },
                hero: { badge: "🎮 +۳۷۸۵ بازی کامپیوتر | 💝 گیمینگ برای خیریه", title: "نصف قیمت<br>دو برابر تأثیر", tagline: "بازی‌های کامپیوتر استیم مورد علاقه خود را با ۵۰٪ تخفیف بخرید و از ماموریت خیریه ما حمایت کنید!", orderBtn: "سفارش در اینستاگرام", impactBtn: "تأثیر ما", badge1: "✓ ۱۰۰٪ قانونی و امن", badge2: "✓ ۵ دلار از هر خرید به خیریه", badge3: "✓ تحویل فوری بازی", badge4: "✓ ساختن دنیایی بهتر" },
                how: { title: "نحوه کار: ۴ مرحله ساده", step1Title: "لیست خود را ارسال کنید", step1Desc: "لیست بازی‌های کامپیوتری مورد نظر خود را در اینستاگرام <span class='insta-user-handle'>@halfplaygamesfr</span> برای ما بفرستید. ما بیش از ۳۷۸۵ عنوان بازی استیم را پوشش می‌دهیم!", step2Title: "ایجاد حساب امن", step2Desc: "ما یک حساب جیمیل و استیم جدید و امن با نام کاربری دلخواه شما ایجاد کرده و بازی‌هایتان را به صورت قانونی خریداری می‌کنیم.", step3Title: "پرداخت امن", step3Desc: "تنها ۵۰٪ از قیمت رسمی بازی را از طریق درگاه پرداخت امن ما یا با رمزارز USDT پرداخت کنید.", step4Title: "تأثیرگذار باشید", step4Desc: "۵ دلار از خرید شما مستقیماً به خیریه می‌رود و شما بلافاصله به بازی‌های جدید خود دسترسی پیدا می‌کنید!" },
                games: { title: "مجموعه بازی‌های کامپیوتر ویژه", souls: "⚔️ مجموعه سری Souls برای استیم", cod: "🔫 مجموعه Call of Duty برای استیم", re: "🧟 مجموعه Resident Evil برای استیم", btn1: "سری Souls", btn2: "Call of Duty", btn3: "Resident Evil", more: "بازی کامپیوتری شگفت‌انگیز دیگر موجود است!", orderBtn: "اکنون سفارش دهید و به خیریه کمک کنید" },
                discount: { title: "چگونه تخفیف بیشتری برای بازی بگیریم؟", note1: "⚠️ مهم: تخفیف‌های اضافی برای خرید کل شما در صورت خرید ۲ بازی یا بیشتر اعمال می‌شود!", note2: "حداقل خرید: ۲ بازی برای فعال‌سازی این تخفیف‌های ویژه.", firstTime: "تخفیف اولین خرید", firstDiscount: "۵ دلار تخفیف کل خرید (۲+ بازی)", step1: "برای دریافت تخفیف، ۲ یا چند بازی کامپیوتر خریداری کنید.", step2: "تصویر تبلیغاتی ما را در استوری اینستاگرام خود آپلود کنید.", step3: "اکانت <span class='insta-user-handle'>@halfplaygamesfr</span> را در استوری تگ کنید.", step4: "استوری را به یک هایلایت در پروفایل خود با نام \\"HalfPlay Games\\" اضافه کنید.", step5: "هرگز هایلایت را از پروفایل اینستاگرام خود حذف نکنید.", step6: "بلافاصله ۵ دلار از کل سفارش خود تخفیف بگیرید!", returning: "وفاداری مشتریان بازگشتی", returningDiscount: "۱۰ دلار تخفیف کل خرید (۲+ بازی)", rstep1: "برای دریافت تخفیف وفاداری، ۲ یا چند بازی کامپیوتر خریداری کنید.", rstep2: "از کتابخانه استیم جدیدی که از ما دریافت کرده‌اید اسکرین‌شات بگیرید.", rstep3: "رضایت خود را به همراه اسکرین‌شات در یک استوری اینستاگرام به اشتراک بگذارید.", rstep4: "اکانت <span class='insta-user-handle'>@halfplaygamesfr</span> را در استوری تگ کنید.", rstep5: "این استوری جدید را به هایلایت \\"HalfPlay Games\\" خود اضافه کنید.", rstep6: "هایلایت را برای همیشه در پروفایل خود نگه دارید.", rstep7: "به عنوان تشکر، از ۱۰ دلار تخفیف بزرگ روی کل سفارش خود لذت ببرید!" },
                charity: { title: "گیمینگ برای نیکی", subtitle: "هر خرید بازی کامپیوتر، تفاوتی بزرگ ایجاد می‌کند", description: "در HalfPlay Games، ما به قدرت جامعه گیمرها برای تغییر زندگی‌ها ایمان داریم. به همین دلیل <strong>۵ دلار از هر خرید بازی کامپیوتر</strong> مستقیماً به خیریه اهدا می‌شود. ما در حال حاضر از بانک‌های غذا، پناهگاه‌های بی‌خانمان‌ها و نیازمندان حمایت می‌کنیم. با رشد ما، چشم‌انداز ما استفاده از این منابع برای ساخت مدارس، بیمارستان‌ها، خانه‌های سالمندان و یتیم‌خانه‌ها در جوامع محروم سراسر جهان است.", stat1: "کل مبلغ اهدا شده به خیریه", stat2: "مدارس ساخته شده", stat3: "بیمارستان‌های ساخته شده", stat4: "خانه‌های سالمندان ساخته شده", stat5: "یتیم‌خانه‌های ساخته شده" },
                donation: { title: "از ماموریت خیریه ما حمایت کنید", cardTitle: "💝 به HalfPlay Games کمک مالی کنید", text: "کمک‌های مستقیم شما توانایی ما را برای گسترش فعالیت‌های خیریه و ساختن دنیایی بهتر از طریق قدرت گیمینگ افزایش می‌دهد. ۵۰٪ کامل از هر کمک مالی مستقیماً به طرح‌های خیریه ما اختصاص می‌یابد!", button: "اکنون از طریق AmirCollider.com کمک کنید 💖", info1: "<strong>کمک شما چگونه مؤثر است:</strong> نیمی از مبلغ اهدایی شما مستقیماً صرف طرح‌های خیریه از جمله بانک‌های غذا، پناهگاه‌های بی‌خانمان‌ها و پروژه‌های آینده ما مانند ساخت مدارس و بیمارستان‌ها می‌شود.", info2: "<strong>قدردانی از اهداکنندگان:</strong> نام شما با افتخار ظرف ۴۸ ساعت به لیست اهداکنندگان ما اضافه خواهد شد (مگر اینکه ترجیح دهید ناشناس بمانید).", info3: "<strong>حریم خصوصی:</strong> اگر مایلید ناشناس بمانید یا از نام دیگری استفاده کنید، لطفاً جزئیات کمک مالی خود را در اینستاگرام برای ما ارسال کنید و ما به انتخاب شما احترام خواهیم گذاشت." },
                donors: { title: "اهداکنندگان شگفت‌انگیز ما", subtitle: "از شما برای ایجاد تفاوت سپاسگزاریم! ۵۰٪ از کل کمک‌های مالی مستقیماً به خیریه می‌رود.", noTitle: "اولین اهداکننده ما باشید!", noMessage: "کمک مالی شما صندوق خیریه ما را راه‌اندازی کرده و به ما در ساختن دنیایی بهتر کمک خواهد کرد. اولین قهرمانی باشید که از ماموریت ما حمایت می‌کند!" },
                satisfaction: { title: "رضایت مشتری", text: "گیمرهای خوشحال کامپیوتر", message: "ما به تازگی ماموریت خود را آغاز کرده‌ایم! جزو اولین کسانی باشید که به جامعه گیمینگ منحصر به فرد ما می‌پیوندند و به ما در ایجاد یک تفاوت واقعی در دنیا کمک می‌کنند." },
                buyers: { title: "جدول رده‌بندی برترین خریداران", emptyTitle: "جدول رده‌بندی خالی است", emptyMessage: "اولین نفری باشید که جایگاه خود را در جدول ما به دست می‌آورد!<br>بازی کامپیوتر بخرید و از خیریه حمایت کنید تا به یک خریدار برتر تبدیل شوید." },
                about: { title: "داستان ما", whyTitle: "چرا HalfPlay Games وجود دارد؟", p1: "ما گیمر هستیم و معتقدیم که تجربیات شگفت‌انگیز بازی‌های کامپیوتری باید برای همه، صرف نظر از وضعیت مالی‌شان، در دسترس باشد. به همین دلیل HalfPlay Games را ایجاد کردیم - یک پلتفرم منحصر به فرد که در آن شما نیمی از هزینه را می‌پردازید، ما نیم دیگر را، و با هم بازی‌های کامپیوتری را مقرون‌به‌صرفه می‌کنیم.", p2: "اما ما فراتر از تخفیف بازی هستیم. ما یک شرکت ماموریت‌محور هستیم. هر خریدی که انجام می‌دهید، ۵ دلار به خیریه کمک می‌کند. رویای نهایی ما ساختن مدارس، بیمارستان‌ها، خانه‌های سالمندان و یتیم‌خانه‌ها در سراسر جهان است که توسط جامعه گیمینگ ما تأمین مالی می‌شود.", quote: "\\"گیمینگ فقط سرگرمی نیست - یک جامعه قدرتمند است که واقعاً می‌تواند دنیا را به جای بهتری تبدیل کند.\\"", p3: "به ما در ماموریت‌مان برای دسترس‌پذیر کردن بازی‌های کامپیوتری و ساختن فردایی بهتر بپیوندید. با هم، ما فقط بازی نمی‌کنیم - ما برای نیکی بازی می‌کنیم." },
                faq: { title: "سوالات متداول (FAQ)", q1: "آیا این سرویس برای خرید ارزان بازی قانونی است؟", a1: "بله، کاملاً! خدمات ما ۱۰۰٪ قانونی و امن است. ما بازی‌های کامپیوتری را مستقیماً از پلتفرم رسمی استیم با روش‌های پرداخت کاملاً قانونی خریداری می‌کنیم.", q2: "آیا بازی‌ها به اکانت استیم شخصی من اضافه می‌شوند؟", a2: "خیر. برای تضمین حداکثر امنیت و جلوگیری از هرگونه مشکل، ما یک اکانت جیمیل و استیم تصادفی جدید برای بازی‌های شما ایجاد می‌کنیم. این روش خطر مسدود شدن اکانت را به طور قابل توجهی کاهش می‌دهد.", q3: "آیا احتمال مسدود شدن اکانت استیم خریداری شده وجود دارد؟", a3: "بله، اما این احتمال بسیار کم و کمتر از ۵٪ است. این یک ریسک طبیعی و قابل مدیریت در این فرآیند است.", q4: "چگونه می‌توانیم خطر مسدود شدن را تقریباً به صفر برسانیم؟", a4: "این نکات ساده را برای به حداقل رساندن تمام خطرات دنبال کنید:", a4tip1: "شماره تلفن شخصی خود را به هر دو اکانت جیمیل و استیم جدید متصل کنید (از یک شماره برای هر دو استفاده کنید).", a4tip2: "یک تصویر پروفایل یکسان برای هر دو اکانت جیمیل و استیم جدید خود قرار دهید.", a4tip3: "هرگز نام کاربری استیم خود را تغییر ندهید. نام کاربری مورد نظر خود را قبل از خرید به ما بگویید تا ما آن را برای شما در هنگام ایجاد اکانت تنظیم کنیم.", q5: "آیا می‌توانم با این بازی‌ها آنلاین مولتی‌پلیر بازی کنم؟", a5: "بله! تمام بازی‌های خریداری شده با قابلیت کامل آنلاین از جمله مولتی‌پلیر ارائه می‌شوند. شما می‌توانید بدون هیچ محدودیتی با دوستان خود و کل جامعه بازی کنید.", q6: "چرا نمی‌توانید برخی بازی‌های خاص را ارائه دهید؟", a6: "خب، این کمی شخصی است 😅 اما ما کتابخانه وسیعی با بیش از ۳۷۸۵ بازی را پوشش می‌دهیم. ما عذرخواهی می‌کنیم که نمی‌توانیم تک تک بازی‌ها را ارائه دهیم، اما می‌توانیم اکثر آنها را تهیه کنیم!", q7: "آیا سیاست بازپرداخت برای خرید بازی وجود دارد؟", a7: "بله! ما یک ضمانت ۴۸ ساعته ارائه می‌دهیم. اگر اکانت شما ظرف ۴۸ ساعت پس از خرید مسدود شود، ما ۱۰۰٪ مبلغ را بازپرداخت می‌کنیم و صمیمانه از این مشکل عذرخواهی می‌کنیم.", q8: "آیا برای خریدم رسیدی دریافت خواهم کرد؟", a8: "بله! شما چیزی بسیار بیشتر از یک رسید دریافت خواهید کرد. ما یک گواهی دیجیتال شخصی‌سازی شده برای شما ایمیل می‌کنیم که شامل:", a8list: "• یک پیام تشکر شخصی<br>• لیست بازی‌های جدید خریداری شده شما<br>• ایمیل استیم جدید شما<br>• تاریخ و قیمت خرید<br>• یک امضای شخصی از من، بنیان‌گذار!<br><br>شما می‌توانید این گواهی را چاپ کرده و برای همیشه قاب کنید!", q9: "در صورت خرید مجدد آیا اکانت جدید برای ما ساخته میشود یا بازی ها به اکانت قبلی اضافه میشود؟", a9: "هر دو حالت امکان‌پذیر است. ما به انتخاب شما احترام می‌گذاریم و هر کدام را که ترجیح دهید انجام می‌دهیم.", q10: "آیا امکان دارد سایت HalfPlay Games از کار بیفتد؟", a10: "خیر، این عملاً غیرممکن است زیرا ما بر روی شبکه جهانی کلودفلر میزبانی می‌شویم. اما در صورت وقوع یک اتفاق بسیار بعید، ما در کمتر از یک ماه با دامنه اصلی خود halfplaygames.com باز خواهیم گشت." },
                contact: { title: "بازی‌های خود را اکنون سفارش دهید و تفاوتی ایجاد کنید", orderTitle: "📱 سفارش از طریق اینستاگرام", orderText: "لیست بازی‌های مورد علاقه خود را برای ما ارسال کنید و به تغییر جهان کمک کنید، هر بار یک بازی!", paymentTitle: "💳 روش‌های پرداخت امن", onlinePayment: "🌐 پرداخت آنلاین (AmirCollider.com)", whyTitle: "✨ چرا HalfPlay Games را انتخاب کنید؟", whyList: '<li>✅ ۵۰٪ تخفیف در تمام بازی‌های کامپیوتر</li><li>❤️ ۵ دلار به خیریه برای هر خرید</li><li>✅ فرآیند ۱۰۰٪ قانونی و امن</li><li>✅ بیش از ۳۷۸۵ بازی استیم موجود</li><li>✅ تحویل فوری پس از پرداخت</li><li>✅ دسترسی کامل به مولتی‌پلیر آنلاین</li><li>🌟 به تأمین مالی مدارس و بیمارستان‌ها کمک کنید</li><li>🌍 بخشی از چیزی بزرگتر باشید</li>' },
                footer: { tagline: "گیمینگ برای نیکی - نصف قیمت، دو برابر تأثیر", disclaimer: "HalfPlay Games به شرکت Valve یا Steam وابسته نیست. تمام علائم تجاری متعلق به صاحبان مربوطه در ایالات متحده و سایر کشورها است.", copyright: "© ۲۰۲۵ HalfPlay Games. ساخته شده با ❤️ توسط AC برای گیمرها و جوامع در سراسر جهان." },
                warning: { text: "این سایت کاملا ایده ی تستی دارد و واقعی نیست!", button: "متوجه شدم" },
                notice: { title: "هشدار مهم", story1: "<p><strong>سلام من AmirCollider هستم!</strong></p><p>میخوام داستان این سایت رو بهتون بگم</p><p>این اولین سایتی هست که من ساختم و البته دومین تلاشم برای ساخت سایت توی زندگیم که این سایت رو روی cloudflare worker ساخته بودم البته نه روی ایمیل cloudflare اصلیم روی یک ایمیل به نشونی halfplaygamesrc@gmail.com که البته بهش ایمیل نزنین با اینکه دارمش اما اصلا بازش نمیکنم!</p><p>یک فایل worker.js 2000 خطی توی سال August 18, 2025 امروز که دارم این رو مینویسم 25 سپتامبر 2026 هست</p><p>و راستش هیچ چیزی از این یادم نبود تا اینکه داشتم توی گوگل میچرخیدم و خیلی شانسی خوردم به این سایت و همه چیز یادم آمد!</p><p>البته اصلا یادم نمیاد چرا همچین چیزی ساخته بودم شاید ی ایده ی رندوم؟ و دیدم عکس های توی سایت مثل لوگو و پرچم ها رو داخل گیت هاب آپلود کردم به جای cloudflare R2 ! تازه اونم مثل خود سایت نه روی گیت هاب اصلی خودم روی یک اکانت گیت هاب با ایمیل halfplaygamesrc@gmail.com که اسکرین شاتش رو واستون گذاشتم و حتی سایت رو روی Google Search Console تاییدش کردم!</p>", story2: "<h3>خلاصه الآن چیکارش کردم؟</h3><p>کد ها رو ساختارشون رو بروزرسانی نکردم گذاشتم همون کد های کثیف قدیمی بمونن چون اولین سایت ساخته شده توسط من بوده که منتشر شده!</p><p>فقط چنتا تغیرات دادم</p><ul class='site-notice-list'><li>1 - هشدار هارو اضافه کردم که سایت واقعی نیست و فقط ی ایده ی تعاملی هست!</li><li>2 - همین متنی که داری میخونی رو اضافه کردم!</li><li>3 - داخل بخش پرداخت این سایت از لینک ارز دیجیتال و لینک ریمیت استفاده شده بود تغیرش دادم و ارجاع دادم به سایت اصلیم یعنی : <a href='https://amircollider.com/donate' target='_blank' rel='noopener'>https://amircollider.com/donate</a> !</li><li>4 - worker رو از ایمیل halfplaygamesrc@gmail.com ورش داشتم و انتقالش دادم به ایمیل خودم</li><li>5 - کد سایت قبلا روی خود cloudflare بود الآن انتقالش دادم به گیت هاب شخصیم : <a href='https://github.com/AmirCollider' target='_blank' rel='noopener'>https://github.com/AmirCollider</a><br>البته که کد رو پرایوت کردم و نمیتونید ببینیدش توی اکانتم!</li><li>6 - روش استفاده از عکس ها از گیت هاب رو تغیر دادم به cloudflare r2 چون عکس ها رو سایت نمیتونه از توی یک ریپازیتوری پرایوت گیت هاب بخونه !</li><li>7 - Google Search Console که روی ایمیل halfplaygamesrc@gmail.com بود رو تغیر دادم به ایمیل اصلیم و دوباره تاییدش کردم</li></ul><p>خلاصه بخوام بگم این همون کد های ساده ی 2 هزار خطی قدیمی هست فقط از روی ایمیل halfplaygamesrc@gmail.com که دیگه هیچ استفاده ای نداره انتقال داده شده به ایمیل شخصی خودم که دیگه یادم نره همچین چیزی وجود داشته!</p><p>و راستی اگه واستون سوال شده بود سایت اولی چی بود؟ یک دامنه به اسم giftcollider.com که دیگه البته وجود نداره</p><p>یک تلاش برای ساخت یک فروشگاه گیفت کارت با وردپرس بود که البته بعد از اون رو اوردم به کد نویسی خالص و تک تک سایتم فقط کد هست نه افزونه ای نه وردپرس یا قالب آماده یا چیز دیگه ای!</p><p>و این لینک سایت اصلی فعلی من هست : <a href='https://amircollider.com/' target='_blank' rel='noopener'>https://amircollider.com/</a></p><p><strong>ممنونم از توجهتون همتون رو دوست دارم!</strong></p>" }
            },
            ja: {
                 nav: { home: "ホーム", how: "使い方", games: "ゲーム", discounts: "割引", charity: "チャリティー", donation: "寄付", about: "私たちについて", faq: "よくある質問", order: "今すぐ注文" },
                hero: { badge: "🎮 3785以上のPCゲーム | 💝 良いことのためのゲーミング", title: "半額<br>倍のインパクト", tagline: "お気に入りのSteam PCゲームを50%オフで手に入れ、私たちのチャリティーミッションをサポートしましょう！", orderBtn: "Instagramで注文", impactBtn: "私たちの影響", badge1: "✓ 100%合法＆安全", badge2: "✓ 購入ごとに$5をチャリティーへ", badge3: "✓ 即時ゲーム配信", badge4: "✓ より良い世界を築く" },
                how: { title: "使い方：4つの簡単なステップ", step1Title: "ウィッシュリストをメッセージ", step1Desc: "Instagramの<span class='insta-user-handle'>@halfplaygamesjp</span>で希望のPCゲームのリストを送ってください。3785以上のSteamタイトルをカバーしています！", step2Title: "安全なアカウント作成", step2Desc: "選択したユーザー名で新しい安全なGmailとSteamアカウントを作成し、ゲームを合法的に購入します。", step3Title: "安全な支払い", step3Desc: "公式ゲーム価格のわずか50%を、安全な支払いゲートウェイまたはUSDT暗号通貨で支払います。", step4Title: "インパクトを与える", step4Desc: "購入から$5が直接チャリティーに寄付され、新しいゲームへの即時アクセスが得られます！" },
                games: { title: "注目のPCゲームコレクション", souls: "⚔️ ソウルシリーズSteamコレクション", cod: "🔫 コール オブ デューティSteamコレクション", re: "🧟 バイオハザードSteamコレクション", btn1: "ソウルシリーズ", btn2: "コール オブ デューティ", btn3: "バイオハザード", more: "他の素晴らしいPCゲームも利用可能！", orderBtn: "今すぐ注文してチャリティーをサポート" },
                discount: { title: "追加のゲーム割引を受ける方法？", note1: "⚠️ 重要：2つ以上のゲームを購入する場合、合計購入に特別割引が適用されます！", note2: "最小購入数：これらの特別割引オファーを解除するには2つのゲーム。", firstTime: "初回購入者割引", firstDiscount: "合計購入から$5オフ（2つ以上のゲーム）", step1: "割引の対象となるには、2つ以上のPCゲームを購入してください。", step2: "私たちのプロモーション画像をInstagramストーリーにアップロードしてください。", step3: "ストーリーで<span class='insta-user-handle'>@halfplaygamesjp</span>をタグ付けしてください。", step4: "ストーリーを「HalfPlay Games」という名前のハイライトにプロフィールに追加してください。", step5: "Instagramプロフィールからハイライトを絶対に削除しないでください。", step6: "合計注文から即座に$5の割引を受け取ります！", returning: "リピーターへの感謝", returningDiscount: "合計購入から$10オフ（2つ以上のゲーム）", rstep1: "感謝割引の対象となるには、2つ以上のPCゲームを購入してください。", rstep2: "私たちから受け取った新しいSteamライブラリのスクリーンショットを撮ってください。", rstep3: "満足度とスクリーンショットをInstagramストーリーで共有してください。", rstep4: "ストーリーで<span class='insta-user-handle'>@halfplaygamesjp</span>をタグ付けしてください。", rstep5: "この新しいストーリーを「HalfPlay Games」ハイライトに追加してください。", rstep6: "ハイライトをプロフィールに永久に保持してください。", rstep7: "感謝のしるしとして、合計注文から$10の大幅割引をお楽しみください！" },
                charity: { title: "良いことのためのゲーミング", subtitle: "すべてのPCゲーム購入が違いを生む", description: "HalfPlay Gamesでは、ゲームコミュニティが人生を変える力を持っていると信じています。そのため、<strong>すべてのPCゲーム購入から$5</strong>が直接チャリティーに寄付されます。現在、私たちはフードバンク、ホームレスシェルター、困っている人々を支援しています。成長するにつれて、私たちのビジョンは、これらの資金を使って世界中の恵まれないコミュニティに学校、病院、老人ホーム、孤児院を建設することです。", stat1: "チャリティーへの総寄付額", stat2: "建設された学校", stat3: "建設された病院", stat4: "建設された老人ホーム", stat5: "建設された孤児院" },
                donation: { title: "私たちのチャリティーミッションを支援", cardTitle: "💝 HalfPlay Gamesに寄付する", text: "あなたの直接の寄付は、私たちのチャリティー活動を拡大し、ゲームの力を通じてより良い世界を築く能力を増幅させます。すべての寄付の50%が私たちのチャリティーイニシアチブに直接寄付されます！", button: "AmirCollider.com経由で今すぐ寄付 💖", info1: "<strong>あなたの寄付がどのように役立つか：</strong>寄付額の半分は、フードバンク、ホームレスシェルター、そして学校や病院の建設といった将来のプロジェクトを含むチャリティーイニシアチブに直接使われます。", info2: "<strong>寄付者の表彰：</strong>あなたの名前は48時間以内に誇りを持って寄付者リストに追加されます（匿名を希望する場合を除く）。", info3: "<strong>プライバシー：</strong>匿名を希望する場合や別の名前を使用したい場合は、寄付の詳細をInstagramでメッセージしてください。私たちはあなたの希望を尊重します。" },
                donors: { title: "私たちの素晴らしい寄付者たち", subtitle: "違いを生んでくださりありがとうございます！すべての寄付の50%が直接チャリティーに寄付されます。", noTitle: "最初の寄付者になろう！", noMessage: "あなたの寄付は私たちのチャリティー基金を始動させ、より良い世界を築くのに役立ちます。私たちのミッションを支援する最初のヒーローになってください！" },
                satisfaction: { title: "顧客満足度", text: "幸せなPCゲーマー", message: "私たちはミッションを始めたばかりです！私たちのユニークなゲームコミュニティに参加し、現実世界で違いを生む手助けをする最初の一人になってください。" },
                buyers: { title: "トップバイヤーリーダーボード", emptyTitle: "リーダーボードは空です", emptyMessage: "リーダーボードであなたの場所を最初に主張してください！<br>PCゲームを購入してチャリティーを支援し、称賛されるトップバイヤーになりましょう。" },
                about: { title: "私たちの物語", whyTitle: "HalfPlay Gamesが存在する理由", p1: "私たちは、経済状況に関係なく、素晴らしいPCゲーム体験は誰もがアクセスできるべきだと信じるゲーマーです。だからこそ、HalfPlay Gamesを設立しました - あなたが半分を支払い、私たちが半分を支払い、一緒にPCゲームを手頃な価格にするユニークなプラットフォームです。", p2: "しかし、私たちは単なるゲーム割引以上の存在です。私たちはミッションドリブンの会社です。あなたが行うすべての購入は、$5をチャリティーに貢献します。私たちの究極の夢は、ゲームコミュニティによって資金提供される学校、病院、老人ホーム、孤児院を世界中に建設することです。", quote: "「ゲームは単なるエンターテインメントではありません - それは世界をより良く変えることができる強力なコミュニティです。」", p3: "PCゲームをアクセス可能にしながら、より良い明日を築くという私たちのミッションに参加してください。一緒に、私たちはただゲームをプレイしているのではなく、良いことのためにプレイしているのです。" },
                faq: { title: "よくある質問（FAQ）", q1: "この格安ゲーム購入サービスは合法ですか？", a1: "はい、もちろんです！私たちのサービスは100%合法で安全です。私たちは完全に正当な支払い方法を使用して、Steamの公式プラットフォームを通じて直接PCゲームを購入します。", q2: "ゲームは私の個人Steamアカウントに追加されますか？", a2: "いいえ。最大限の安全を確保し、問題を避けるため、私たちはあなたのゲーム用に新しいランダムなGmailとSteamアカウントを作成します。この方法はアカウント停止のリスクを大幅に削減します。", q3: "購入したSteamアカウントが禁止される可能性はありますか？", a3: "はい、しかしその可能性は非常に低く、5%未満です。これはこのプロセスにおける正常で管理可能なリスクです。", q4: "禁止リスクをほぼゼロに減らすにはどうすればよいですか？", a4: "すべてのリスクを最小限に抑えるために、これらの簡単なヒントに従ってください：", a4tip1: "あなたの個人電話番号を新しいGmailとSteamの両方のアカウントに接続してください（両方に同じ番号を使用）。", a4tip2: "新しいGmailとSteamの両方のアカウントに同じプロフィール写真を追加してください。", a4tip3: "Steamのユーザー名を決して変更しないでください。購入前に希望のユーザー名を教えていただければ、アカウント作成時に設定します。", q5: "これらのゲームでオンラインマルチプレイヤーをプレイできますか？", a5: "はい！購入したすべてのゲームには、マルチプレイヤーを含む完全なオンライン機能が付属しています。制限なく友達やコミュニティ全体とプレイできます。", q6: "特定のゲームを提供できないのはなぜですか？", a6: "まあ、これは少し個人的なことですが😅、私たちは3785以上のゲームの広大なライブラリをカバーしています。すべてのゲームを提供できないことをお詫びしますが、ほとんどのゲームは入手可能です！", q7: "ゲーム購入に返金ポリシーはありますか？", a7: "はい！48時間保証を提供しています。購入後48時間以内にアカウントが禁止された場合、100%返金し、ご不便をおかけしたことを心からお詫びします。", q8: "購入の領収書はもらえますか？", a8: "はい！領収書以上のものを受け取ります。以下を含むパーソナライズされたデジタル証明書をメールでお送りします：", a8list: "• 個人的な感謝のメッセージ<br>• 新しく購入したゲームのリスト<br>• 新しいSteamのメールアドレス<br>• 購入日と価格<br>• 創設者である私からの個人的な署名！<br><br>この証明書を印刷して永遠に飾ることができます！", q9: "再購入の場合、新しいアカウントが作成されますか、それとも前のものにゲームが追加されますか？", a9: "どちらも可能です。私たちはあなたの選択を尊重し、ご希望に応じてどちらでも対応します。", q10: "HalfPlay Gamesのサイトがダウンする可能性はありますか？", a10: "いいえ、それは事実上不可能です。私たちはCloudflareのグローバルネットワークでホストされていますから。しかし、万が一の事態が発生した場合でも、私たちは主要ドメインhalfplaygames.comで1ヶ月以内に復旧します。" },
                contact: { title: "今すぐゲームを注文して違いを生みましょう", orderTitle: "📱 Instagram経由で注文", orderText: "ゲームのウィッシュリストを送って、一度に一つのゲームで世界を変える手助けをしてください！", paymentTitle: "💳 安全な支払い方法", onlinePayment: "🌐 オンライン決済（AmirCollider.com）", whyTitle: "✨ なぜHalfPlay Gamesを選ぶのか？", whyList: '<li>✅ すべてのPCゲームで50%節約</li><li>❤️ 購入ごとに$5をチャリティーへ</li><li>✅ 100%合法で安全なプロセス</li><li>✅ 3785以上のSteamゲームが利用可能</li><li>✅ 支払い後即時配信</li><li>✅ 完全なオンラインマルチプレイヤーアクセス</li><li>🌟 学校や病院の資金調達を支援</li><li>🌍 より大きな何かの一部になる</li>' },
                footer: { tagline: "良いことのためのゲーミング - 半額、倍のインパクト", disclaimer: "HalfPlay GamesはValve CorporationまたはSteamと提携していません。すべての商標は、米国およびその他の国におけるそれぞれの所有者の財産です。", copyright: "© 2025 HalfPlay Games. 世界中のゲーマーとコミュニティのためにACが❤️を込めて作成しました。" },
                warning: { text: "このサイトは完全にテスト用のアイデアであり、本物ではありません！", button: "わかりました" },
                notice: { title: "重要なお知らせ", story1: "<p><strong>こんにちは、AmirColliderです！</strong></p><p>このサイトの物語をお話ししたいと思います。</p><p>これは私が初めて作ったウェブサイトで、人生で2回目のウェブサイト作りの挑戦でもありました。このサイトはCloudflare Workerで作りましたが、メインのCloudflareのメールではなく、halfplaygamesrc@gmail.com というメールアドレスで作りました（このアドレスにはメールを送らないでください。まだ持ってはいますが、まったく開いていません！）。</p><p>2025年8月18日に作った、2000行の worker.js ファイル1つだけのサイトです。これを書いている今日は2026年9月25日です。</p><p>正直、このことは何も覚えていませんでした。Googleを見ていたら偶然このサイトを見つけて、すべてを思い出したんです！</p><p>なぜこんなものを作ったのかはまったく覚えていません。ただの思いつきだったのかも？ それに、ロゴや国旗などのサイトの画像をCloudflare R2ではなくGitHubにアップロードしていたことにも気づきました！しかもサイトと同じく、メインのGitHubではなく halfplaygamesrc@gmail.com のGitHubアカウントに（そのスクリーンショットを載せておきます）。さらにGoogle Search Consoleでサイトの所有権確認までしていました！</p>", story2: "<h3>それで、今どうしたのか？</h3><p>コードの構造は更新していません。これは私が初めて作って公開したウェブサイトなので、昔の汚いコードのまま残しました！</p><p>変更したのはいくつかだけです：</p><ul class='site-notice-list'><li>1 - このサイトは本物ではなく、ただのインタラクティブなアイデアだという警告を追加しました！</li><li>2 - 今あなたが読んでいるこの文章を追加しました！</li><li>3 - このサイトの支払いセクションでは暗号通貨とReymitのリンクが使われていましたが、私のメインサイト <a href='https://amircollider.com/donate' target='_blank' rel='noopener'>https://amircollider.com/donate</a> へのリンクに変更しました！</li><li>4 - Workerを halfplaygamesrc@gmail.com から自分のメールアドレスに移しました。</li><li>5 - サイトのコードは以前Cloudflare上にありましたが、今は個人のGitHubに移しました：<a href='https://github.com/AmirCollider' target='_blank' rel='noopener'>https://github.com/AmirCollider</a><br>もちろんコードは非公開にしたので、私のアカウントでは見られません！</li><li>6 - 画像の読み込み方法をGitHubからCloudflare R2に変更しました。サイトは非公開のGitHubリポジトリから画像を読み込めないからです！</li><li>7 - halfplaygamesrc@gmail.com にあったGoogle Search Consoleをメインのメールアドレスに移して、もう一度所有権を確認しました。</li></ul><p>まとめると、これは昔と同じシンプルな2000行のコードで、もう使っていない halfplaygamesrc@gmail.com から個人のメールアドレスに移しただけです。こんなものがあったことを二度と忘れないように！</p><p>ちなみに、最初のサイトが何だったか気になった方へ：giftcollider.com というドメインでしたが、もう存在しません。</p><p>WordPressでギフトカードストアを作ろうとしたものでした。その後は純粋なコーディングに移り、今の私のサイトはすべてコードだけでできています。プラグインもWordPressも既製のテーマも、何も使っていません！</p><p>そして、これが現在の私のメインサイトのリンクです：<a href='https://amircollider.com/' target='_blank' rel='noopener'>https://amircollider.com/</a></p><p><strong>読んでくれてありがとう。みんな大好きです！</strong></p>" }
            }
        };

        const flagImages = { en: '${flagEN}', fa: '${flagFA}', ja: '${flagJA}' };
        let currentLang = 'en';
        const instagramLinks = { 
            en: 'https://www.instagram.com/halfplaygames/', 
            fa: 'https://www.instagram.com/halfplaygamesfr/', 
            ja: 'https://www.instagram.com/halfplaygamesjp/' 
        };

        function updateInstagramLinks() {
            const link = instagramLinks[currentLang] || instagramLinks['en'];
            document.querySelectorAll('.instagram-link').forEach(element => { 
                element.href = link; 
            });
            const handle = \`@\${link.split('/').filter(Boolean).pop()}\`;
             document.querySelectorAll('.insta-user-handle').forEach(span => {
                span.textContent = handle;
            });
        }

        function updateTranslations() {
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const keys = element.getAttribute('data-i18n').split('.');
                let translation = translations[currentLang];
                try {
                    for (const key of keys) { 
                        if (translation === undefined) break;
                        translation = translation[key]; 
                    }
                    if (translation) { element.innerHTML = translation; }
                } catch (e) {
                    console.error('Could not find translation for: ' + element.getAttribute('data-i18n'));
                }
            });
            document.documentElement.lang = currentLang; // [SEO-ENHANCEMENT] Set HTML lang attribute
            document.documentElement.setAttribute('dir', currentLang === 'fa' ? 'rtl' : 'ltr');
            document.body.style.fontFamily = currentLang === 'fa' ? "'Vazir', 'Montserrat', sans-serif" : "'Montserrat', sans-serif";
            updateInstagramLinks();
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            const htmlEl = document.documentElement;

            const themeBtn = document.getElementById('theme-toggle-btn');
            function setTheme(theme) {
                htmlEl.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
            }
            themeBtn.addEventListener('click', () => {
                const currentTheme = htmlEl.getAttribute('data-theme');
                setTheme(currentTheme === 'dark' ? 'light' : 'dark');
            });
            const savedTheme = localStorage.getItem('theme');
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (savedTheme) {
                setTheme(savedTheme);
            } else {
                setTheme(systemPrefersDark ? 'dark' : 'light');
            }

            const slider = {
                container: document.getElementById('gamesContainer'),
                navButtons: document.querySelectorAll('.slider-nav .slider-btn'),
                currentIndex: 0,
                intervalId: null,

                init: function() {
                    if (!this.container || this.navButtons.length === 0) return;
                    this.navButtons.forEach(button => {
                        button.addEventListener('click', (e) => {
                            const index = parseInt(e.currentTarget.dataset.slide, 10);
                            this.goTo(index);
                            this.resetInterval();
                        });
                    });
                    this.startInterval();
                },
                goTo: function(index) {
                    if (index < 0) index = this.navButtons.length - 1;
                    else if (index >= this.navButtons.length) index = 0;
                    
                    this.currentIndex = index;
                    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
                    const offset = isRtl ? (index * 100) : (-index * 100);
                    this.container.style.transform = \`translateX(\${offset}%)\`;
                    this.navButtons.forEach((btn, i) => btn.classList.toggle('active', i === this.currentIndex));
                },
                next: function() { this.goTo(this.currentIndex + 1); },
                startInterval: function() {
                    clearInterval(this.intervalId);
                    this.intervalId = setInterval(() => this.next(), 5000);
                },
                resetInterval: function() { this.startInterval(); }
            };
            slider.init();

            const dropdown = document.getElementById('language-dropdown');
            const toggleButton = document.getElementById('language-dropdown-toggle');
            const langOptions = document.querySelectorAll('.lang-option');
            const toggleImg = toggleButton.querySelector('img');

            function setLanguage(lang) {
                currentLang = lang;
                localStorage.setItem('selectedLanguage', lang);
                toggleImg.src = flagImages[lang];
                langOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.lang === lang));
                updateTranslations();
                
                setTimeout(() => {
                    if (slider && typeof slider.goTo === 'function') {
                        slider.goTo(slider.currentIndex);
                    }
                }, 50); 
                
                dropdown.classList.remove('active');
            }
            
            toggleButton.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
            langOptions.forEach(option => option.addEventListener('click', () => setLanguage(option.dataset.lang)));
            document.addEventListener('click', (e) => {
                if (dropdown && !dropdown.contains(e.target)) dropdown.classList.remove('active');
            });

            // [SEO-ENHANCEMENT] Check URL for language parameter
            const urlParams = new URLSearchParams(window.location.search);
            const langParam = urlParams.get('lang');
            const savedLang = langParam || localStorage.getItem('selectedLanguage') || 'en';
            setLanguage(savedLang);
            
            createParticles();
            createShootingStars();
            init3DTilt();

            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
            
            const numberObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const numberEl = entry.target;
                        const target = parseInt(numberEl.dataset.target, 10);
                        if (isNaN(target)) return;
                        
                        let current = 0;
                        const duration = 2000;
                        const stepTime = 20;
                        const steps = duration / stepTime;
                        const increment = target / steps;
                        const isCurrency = numberEl.textContent.includes('$');

                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                clearInterval(timer);
                                numberEl.textContent = isCurrency ? \`$\${target}\` : target;
                            } else {
                                numberEl.textContent = isCurrency ? \`$\${Math.ceil(current)}\` : Math.ceil(current);
                            }
                        }, stepTime);
                        
                        observer.unobserve(numberEl);
                    }
                });
            }, { threshold: 0.8 });

            document.querySelectorAll('.charity-number[data-target], .satisfaction-number[data-target]').forEach(num => {
                numberObserver.observe(num);
            });

            const vazirFont = document.createElement('link');
            vazirFont.href = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazir-font@v30.1.0/dist/font-face.css';
            vazirFont.rel = 'stylesheet';
            document.head.appendChild(vazirFont);
        });
        
        window.addEventListener('load', () => { 
            setTimeout(() => {
                const loader = document.getElementById('loader');
                if(loader) loader.classList.add('hidden');
            }, 500);
        });
        
        window.addEventListener('scroll', () => { 
            const navbar = document.getElementById('navbar');
            if (navbar) navbar.classList.toggle('scrolled', window.pageYOffset > 50);
        }, { passive: true });

        // [WARNING] بستن پاپ‌آپ هشدار «سایت تستی»
        const testWarning = document.getElementById('testWarning');
        if (testWarning) {
            const closeTestWarning = () => testWarning.classList.add('hidden');
            document.getElementById('testWarningClose').addEventListener('click', closeTestWarning);
            document.getElementById('testWarningOk').addEventListener('click', closeTestWarning);
            testWarning.addEventListener('click', (e) => { if (e.target === testWarning) closeTestWarning(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTestWarning(); });
        }

        const mobileMenu = document.getElementById('mobileMenu');
        const navLinks = document.getElementById('navLinks');
        if (mobileMenu && navLinks) {
            mobileMenu.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    if(link.getAttribute('href').startsWith('#')){
                        mobileMenu.classList.remove('active');
                        navLinks.classList.remove('active');
                    }
                });
            });
        }
        
        document.addEventListener('click', function(e) {
            const anchor = e.target.closest('a');
            if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
                if(anchor.classList.contains('instagram-link')) return; 
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });

        function init3DTilt() {
            const cards = document.querySelectorAll('.tilt-card');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const { width, height } = rect;
                    const rotateX = -10 * ((y - height / 2) / height);
                    const rotateY = 10 * ((x - width / 2) / width);
                    card.style.transform = \`perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale3d(1.05, 1.05, 1.05)\`;
                });

                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
                });
            });
        }
        
        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            if (!particlesContainer) return;
            const particleCount = 100;
            const colors = ['var(--accent-cyan)', 'var(--accent-coral)', 'rgba(255, 255, 255, 0.5)'];
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const size = Math.random() * 3 + 1;
                particle.style.width = \`\${size}px\`;
                particle.style.height = \`\${size}px\`;
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                particle.style.left = Math.random() * 100 + 'vw';
                particle.style.animationDelay = Math.random() * 20 + 's';
                particle.style.animationDuration = (15 + Math.random() * 15) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        function createShootingStars() {
            const body = document.body;
            const starCount = 5;
            for (let i = 0; i < starCount; i++) {
                const star = document.createElement('div');
                star.className = 'shooting-star';
                star.style.left = \`\${Math.random() * 150 - 25}vw\`;
                star.style.animationDelay = \`\${Math.random() * 15}s\`;
                star.style.animationDuration = \`\${2 + Math.random() * 3}s\`;
                body.appendChild(star);
            }
        }

    </script>
</body>
</html>`;

  // بازگرداندن پاسخ HTML با هدرهای مناسب
  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=3600', // کش کردن برای یک ساعت
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none'", // [SEO-ENHANCEMENT] هدر امنیتی
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload' // [SEO-ENHANCEMENT] هدر امنیتی
    },
  });
}
