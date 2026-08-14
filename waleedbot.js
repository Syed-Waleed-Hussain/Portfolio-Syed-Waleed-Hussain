/**
 * WALEEDBOT — AI SALES & CAREER ASSISTANT
 * Official AI Representative for Syed Waleed Hussain
 * 
 * Features:
 * - Dual Engine: Cloud Serverless API (/api/chat) + Embedded Semantic AI Engine
 * - Sales-First Categorization & Lead Generation CTA
 * - Project & Upwork Track Record Showcase (59+ Jobs, 100% 5-Star)
 * - Built-in Audio Chime (Web Audio API)
 * - Lead Capture Drawer with direct email submission
 */

(function () {
  'use strict';

  // Config & State
  const WB_CONFIG = {
    botName: 'WaleedBot',
    title: 'Syed Waleed Hussain (AI)',
    subtitle: '● Online — Sales & Career Assistant',
    apiEndpoint: '/api/chat',
    leadEndpoint: '/api/lead',
    soundEnabled: true,
    initialGreeting: `Hi! I'm **WaleedBot**, the official AI representative of **Syed Waleed Hussain**.

I help businesses and founders accelerate growth through:
• 📈 **SEO & Authority Link Building** (59+ Upwork contracts, 100% 5-star ratings)
• 💻 **Full-Stack Web Development** (React, Python, Next.js, WordPress)
• 🤖 **AI Automation & Custom RAG Systems** (LangChain, Vector Databases, n8n)

What type of project or growth goal are you looking to achieve?`,
    quickChips: [
      { label: "📈 Scale My SEO & Backlinks", query: "How can you help scale my SEO and domain authority?" },
      { label: "💻 Build a Web App / WordPress", query: "Tell me about your full-stack web development services." },
      { label: "🤖 Build Custom AI / RAG Chatbot", query: "Can you build a custom RAG system or AI automation for my business?" },
      { label: "⭐ Review Upwork Proof (59+ Jobs)", query: "What is your track record on Upwork and client results?" },
      { label: "📅 Book a 15-Min Discovery Call", query: "I would like to schedule a discovery call to discuss my project." }
    ]
  };

  let messages = [];
  let isOpen = false;
  let hasUserInteracted = false;

  // 1. Audio Synthesis using Web Audio API (Zero external mp3 dependencies)
  function playChime(type) {
    if (!WB_CONFIG.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'receive') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  // 2. Simple Markdown & Link Formatter
  function formatMarkdown(text) {
    if (!text) return '';
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Inline Code
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:0.1rem 0.35rem;border-radius:4px;font-family:monospace;font-size:0.85em;">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    // Convert bullet lists
    if (formatted.includes('• ') || formatted.includes('- ')) {
      const lines = formatted.split('<br/>');
      let inList = false;
      let result = [];

      for (let line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
          if (!inList) {
            result.push('<ul style="margin:0.4rem 0 0.4rem 1.2rem;padding:0;">');
            inList = true;
          }
          result.push(`<li style="margin-bottom:0.25rem;">${trimmed.substring(2)}</li>`);
        } else {
          if (inList) {
            result.push('</ul>');
            inList = false;
          }
          result.push(line);
        }
      }
      if (inList) result.push('</ul>');
      formatted = result.join('');
    }

    return `<p>${formatted}</p>`;
  }

  // 3. Embedded Semantic AI Reasoning Engine (Fallback / Zero-Key Mode)
  function getSmartAIResponse(userText) {
    const q = userText.toLowerCase();

    // A. SEO & Link Building
    if (q.includes('seo') || q.includes('backlink') || q.includes('traffic') || q.includes('ranking') || q.includes('link building') || q.includes('domain rating') || q.includes('dr')) {
      return {
        reply: `As an SEO & Link Building Strategist with **59+ completed contracts on Upwork**, I help SaaS and E-commerce brands acquire high-intent organic traffic that drives revenue:

• **High-DR Editorial Links**: Contextual guest posting and niche link placements on authority domains (DR 50–85+).
• **Technical SEO & Architecture**: Full Core Web Vitals audits, crawl budget optimization, and structured schema implementation.
• **Proven SaaS Case Study**: Generated 120+ high-authority backlinks for a B2B SaaS platform, growing monthly organic visits from **4,000 to 65,000+** within 6 months.

Would you like to discuss how we can implement these solutions for your business? I’d be happy to hop on a quick 15-minute discovery call.`,
        cta: [
          { text: "📅 Book Discovery Call", action: "openLeadForm", param: "SEO & Link Building" },
          { text: "📂 View Projects", action: "scrollToSection", param: "works" }
        ]
      };
    }

    // B. Web Development & Tech Stack
    if (q.includes('web') || q.includes('react') || q.includes('wordpress') || q.includes('developer') || q.includes('frontend') || q.includes('backend') || q.includes('full-stack') || q.includes('build a site') || q.includes('app')) {
      return {
        reply: `I build fast, responsive, and conversion-optimized web applications tailored to your business needs:

• **Modern Frontend**: React, Next.js, Tailwind CSS, JavaScript (ES6+), GSAP animations, and mobile-first architecture.
• **Robust Backend**: Python (Flask, FastAPI), Node.js, RESTful APIs, and relational/vector databases.
• **Custom CMS**: WordPress theme architecture, speed optimization, and e-commerce integrations.
• **Featured Client Project**: Built & deployed **[Jynko Tech (jynkotech.com)](https://jynkotech.com)** with sub-second TTFB and production Vercel infrastructure.

Are you looking to build a new product from scratch or upgrade an existing web platform? I'd be glad to discuss your project scope.`,
        cta: [
          { text: "📅 Discuss Web Project", action: "openLeadForm", param: "Web Development" },
          { text: "💻 View GitHub Code", action: "openUrl", param: "https://github.com/Syed-Waleed-Hussain" }
        ]
      };
    }

    // C. AI, RAG Systems & Automations
    if (q.includes('ai') || q.includes('rag') || q.includes('llm') || q.includes('agent') || q.includes('automation') || q.includes('langchain') || q.includes('n8n') || q.includes('bot') || q.includes('machine learning')) {
      return {
        reply: `I specialize in engineering custom **Generative AI, RAG systems, and Workflow Automations**:

• **Production RAG Systems**: Zero-hallucination document intelligence over proprietary business knowledge using Vector Embeddings (ChromaDB, Pinecone) and LangChain.
• **Autonomous AI Agents**: Multi-step reasoning workflows, intelligent tool-calling, and custom LangGraph pipelines.
• **Automations & Low-Code**: n8n, Make, and Zapier automated workflows to save hundreds of operational hours.
• **Flagship Project**: Built **[UniSense AI](https://github.com/Syed-Waleed-Hussain/Unisence-AI)**, an institutional RAG chatbot providing verifiable source citations.

Would you like to explore how custom AI automation can eliminate manual tasks in your business? Let’s connect on a quick call!`,
        cta: [
          { text: "🤖 Explore AI Automation", action: "openLeadForm", param: "AI & RAG Systems" },
          { text: "📂 View UniSense AI Repo", action: "openUrl", param: "https://github.com/Syed-Waleed-Hussain/Unisence-AI" }
        ]
      };
    }

    // D. Proof & Upwork Track Record
    if (q.includes('proof') || q.includes('upwork') || q.includes('experience') || q.includes('track record') || q.includes('rating') || q.includes('review') || q.includes('results') || q.includes('testimonial')) {
      return {
        reply: `Here is a summary of my proven track record:

• **59+ Completed Client Contracts** on Upwork and global platforms with **100% 5-Star Feedback**.
• **SaaS Authority Growth**: 120+ DR60+ editorial backlinks acquired, driving a 16x traffic increase.
• **Outdoor E-Commerce**: +240% organic visibility boost and 18 high-intent commercial keywords in Google Top 3.
• **Academic & Technical Caliber**: Computer Science at FAST NUCES (Dean's List Honoree) with 15+ live GitHub repositories.

Would you like to discuss how we can achieve similar results for your business? I’d be happy to hop on a quick call.`,
        cta: [
          { text: "📅 Schedule Strategy Call", action: "openLeadForm", param: "General Discovery Call" },
          { text: "📄 View Resume", action: "openUrl", param: "https://docs.google.com/document/d/1T4-qvndB1U3vKGb4L9Bkmn4wjTSP2GNX/edit?usp=sharing&ouid=114806084618813262088&rtpof=true&sd=true" }
        ]
      };
    }

    // E. Discovery Call / Contact / Hire
    if (q.includes('hire') || q.includes('call') || q.includes('contact') || q.includes('schedule') || q.includes('email') || q.includes('cost') || q.includes('rate') || q.includes('price') || q.includes('meeting')) {
      return {
        reply: `I'd love to collaborate with you! Here is how we can connect immediately:

• ✉️ **Email**: [syedwaleedhussain11@gmail.com](mailto:syedwaleedhussain11@gmail.com)
• 📞 **WhatsApp / Direct**: **+92 315 2593961**
• 💼 **LinkedIn**: [linkedin.com/in/syed-waleed-hussain](https://www.linkedin.com/in/syed-waleed-hussain-65a4452b1/)

Click below to fill out your details directly, and I'll get back to you within 24 hours!`,
        cta: [
          { text: "📝 Open Direct Contact Form", action: "openLeadForm", param: "General Inquiry" },
          { text: "💬 WhatsApp Me", action: "openUrl", param: "https://wa.me/923152593961" }
        ]
      };
    }

    // F. Default response
    return {
      reply: `I am Syed Waleed Hussain's AI representative. My core focus is delivering measurable business results in **SEO & Link Building**, **Full-Stack Web Development**, and **AI Automation**.

• Have a specific website or SaaS you'd like to scale?
• Looking to build a modern web application or custom RAG assistant?

Tell me a bit about your project, and I'll outline the exact technical roadmap!`,
      cta: [
        { text: "📈 Discuss SEO", action: "sendChip", param: "How can you help scale my SEO and domain authority?" },
        { text: "💻 Discuss Web Dev", action: "sendChip", param: "Tell me about your full-stack web development services." },
        { text: "🤖 Discuss AI", action: "sendChip", param: "Can you build a custom RAG system or AI automation for my business?" }
      ]
    };
  }

  // 4. Inject DOM Elements for WaleedBot
  function initDOM() {
    // Check if elements already exist
    if (document.getElementById('waleedbot-launcher')) return;

    // A. Floating Launcher
    const launcher = document.createElement('div');
    launcher.id = 'waleedbot-launcher';
    launcher.innerHTML = `
      <div class="wb-popover-bubble" id="wb-popover" onclick="WaleedBot.openChat()">
        <span>👋 Hi! Need SEO, Web Dev, or an AI system? Talk to WaleedBot!</span>
        <button class="wb-popover-close" onclick="event.stopPropagation(); WaleedBot.closePopover()">✕</button>
      </div>
      <button class="wb-trigger-btn" id="wb-trigger-btn" onclick="WaleedBot.toggleChat()" aria-label="Open WaleedBot Chat">
        <div class="wb-pulse-ring"></div>
        <div class="wb-unread-badge" id="wb-badge">1</div>
        <svg class="wb-trigger-icon" id="wb-open-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="wb-trigger-icon" id="wb-close-icon" style="display:none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    document.body.appendChild(launcher);

    // B. Chat Window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'waleedbot-window';
    chatWindow.innerHTML = `
      <!-- Header -->
      <div class="wb-header">
        <div class="wb-header-left">
          <div class="wb-header-avatar">
            SW
            <span class="wb-online-dot"></span>
          </div>
          <div>
            <h3 class="wb-header-title">${WB_CONFIG.title}</h3>
            <span class="wb-header-subtitle">${WB_CONFIG.subtitle}</span>
          </div>
        </div>
        <div class="wb-header-actions">
          <button class="wb-icon-btn" id="wb-sound-btn" onclick="WaleedBot.toggleSound()" title="Toggle Sound" aria-label="Toggle Sound">
            🔊
          </button>
          <button class="wb-icon-btn" onclick="WaleedBot.clearChat()" title="Reset Conversation" aria-label="Reset Conversation">
            🔄
          </button>
          <button class="wb-icon-btn" onclick="WaleedBot.closeChat()" title="Close" aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="wb-messages-container" id="wb-messages"></div>

      <!-- Quick Action Chips -->
      <div class="wb-chips-scroll" id="wb-chips">
        ${WB_CONFIG.quickChips.map(c => `
          <button class="wb-chip-btn" onclick="WaleedBot.handleQuickChip('${c.query.replace(/'/g, "\\'")}')">
            ${c.label}
          </button>
        `).join('')}
      </div>

      <!-- Lead Capture Drawer -->
      <div class="wb-lead-drawer" id="wb-lead-drawer">
        <div class="wb-lead-drawer-title">
          <span id="wb-lead-topic">📅 Book a 15-Minute Discovery Call</span>
          <button class="wb-popover-close" onclick="WaleedBot.closeLeadForm()">✕</button>
        </div>
        <input type="text" id="wb-lead-name" class="wb-lead-input" placeholder="Your Name or Company" />
        <input type="email" id="wb-lead-email" class="wb-lead-input" placeholder="Your Email Address" required />
        <input type="text" id="wb-lead-msg" class="wb-lead-input" placeholder="Project Summary (optional)" />
        <button class="wb-lead-submit" onclick="WaleedBot.submitLead()">Confirm &amp; Send Inquiry 🚀</button>
      </div>

      <!-- Input Footer -->
      <form class="wb-footer" id="wb-chat-form" onsubmit="WaleedBot.handleSubmit(event)">
        <input type="text" id="wb-user-input" class="wb-input-box" placeholder="Ask about SEO, Web Dev, AI, or Upwork..." autocomplete="off" />
        <button type="submit" id="wb-submit-btn" class="wb-send-btn" aria-label="Send Message">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    `;
    document.body.appendChild(chatWindow);

    // Initial greeting
    appendBotMessage(WB_CONFIG.initialGreeting, [
      { text: "📈 Scale My SEO", action: "sendChip", param: "How can you help scale my SEO and domain authority?" },
      { text: "💻 Build a Web App", action: "sendChip", param: "Tell me about your full-stack web development services." },
      { text: "🤖 AI & Automations", action: "sendChip", param: "Can you build a custom RAG system or AI automation for my business?" }
    ]);
  }

  // 5. Append Messages
  function appendUserMessage(text) {
    const container = document.getElementById('wb-messages');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'wb-message-row wb-user';
    row.innerHTML = `
      <div class="wb-bubble">
        ${formatMarkdown(text)}
        <div class="wb-time">${getCurrentTime()}</div>
      </div>
    `;
    container.appendChild(row);
    scrollToBottom();
    messages.push({ role: 'user', content: text });
    playChime('send');
  }

  function appendBotMessage(text, ctaList = null) {
    const container = document.getElementById('wb-messages');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'wb-message-row wb-bot';
    
    let ctaHtml = '';
    if (Array.isArray(ctaList) && ctaList.length > 0) {
      ctaHtml = `
        <div class="wb-cta-actions">
          ${ctaList.map(item => `
            <button class="wb-cta-btn" onclick="WaleedBot.handleCtaAction('${item.action}', '${(item.param || '').replace(/'/g, "\\'")}')">
              ${item.text}
            </button>
          `).join('')}
        </div>
      `;
    }

    row.innerHTML = `
      <div class="wb-bot-avatar-small">WB</div>
      <div class="wb-bubble">
        ${formatMarkdown(text)}
        ${ctaHtml}
        <div class="wb-time">${getCurrentTime()}</div>
      </div>
    `;
    container.appendChild(row);
    scrollToBottom();
    messages.push({ role: 'assistant', content: text });
    playChime('receive');
  }

  function showTypingIndicator() {
    const container = document.getElementById('wb-messages');
    if (!container) return null;

    const ind = document.createElement('div');
    ind.id = 'wb-typing-ind';
    ind.className = 'wb-message-row wb-bot';
    ind.innerHTML = `
      <div class="wb-bot-avatar-small">WB</div>
      <div class="wb-typing-indicator">
        <div class="wb-dot"></div>
        <div class="wb-dot"></div>
        <div class="wb-dot"></div>
      </div>
    `;
    container.appendChild(ind);
    scrollToBottom();
    return ind;
  }

  function removeTypingIndicator() {
    const ind = document.getElementById('wb-typing-ind');
    if (ind) ind.remove();
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    const container = document.getElementById('wb-messages');
    if (container) {
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 50);
    }
  }

  // 6. Handle User Message Submission
  async function processUserMessage(userText) {
    if (!userText || !userText.trim()) return;
    const cleanText = userText.trim();

    appendUserMessage(cleanText);
    const input = document.getElementById('wb-user-input');
    if (input) input.value = '';

    const typingEl = showTypingIndicator();
    const btn = document.getElementById('wb-submit-btn');
    if (btn) btn.disabled = true;

    try {
      // Try Serverless API first
      let data = null;
      try {
        const res = await fetch(WB_CONFIG.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messages.slice(-8), // Send last 8 turns for context
            userMessage: cleanText
          })
        });

        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        // API offline or static local environment
      }

      removeTypingIndicator();

      if (data && data.reply) {
        appendBotMessage(data.reply, [
          { text: "📅 Book a Quick Call", action: "openLeadForm", param: cleanText },
          { text: "✉️ Email Waleed", action: "openUrl", param: "mailto:syedwaleedhussain11@gmail.com" }
        ]);
      } else {
        // Fallback to Smart AI Engine
        const smartRes = getSmartAIResponse(cleanText);
        // Add a slight realistic delay
        setTimeout(() => {
          appendBotMessage(smartRes.reply, smartRes.cta);
        }, 300);
      }
    } catch (e) {
      removeTypingIndicator();
      const fallback = getSmartAIResponse(cleanText);
      appendBotMessage(fallback.reply, fallback.cta);
    } finally {
      if (btn) btn.disabled = false;
      if (input) input.focus();
    }
  }

  // Public API exposed via window.WaleedBot
  window.WaleedBot = {
    init: function () {
      initDOM();
      // Show greeting popover after 3.5s if not opened
      setTimeout(() => {
        const popover = document.getElementById('wb-popover');
        if (popover && !isOpen && !hasUserInteracted) {
          popover.style.display = 'flex';
        }
      }, 3500);
    },

    openChat: function () {
      isOpen = true;
      hasUserInteracted = true;
      const win = document.getElementById('waleedbot-window');
      const openIcon = document.getElementById('wb-open-icon');
      const closeIcon = document.getElementById('wb-close-icon');
      const badge = document.getElementById('wb-badge');
      const popover = document.getElementById('wb-popover');

      if (win) win.classList.add('wb-active');
      if (openIcon) openIcon.style.display = 'none';
      if (closeIcon) closeIcon.style.display = 'block';
      if (badge) badge.style.display = 'none';
      if (popover) popover.style.display = 'none';

      const input = document.getElementById('wb-user-input');
      if (input) setTimeout(() => input.focus(), 250);
    },

    closeChat: function () {
      isOpen = false;
      const win = document.getElementById('waleedbot-window');
      const openIcon = document.getElementById('wb-open-icon');
      const closeIcon = document.getElementById('wb-close-icon');

      if (win) win.classList.remove('wb-active');
      if (openIcon) openIcon.style.display = 'block';
      if (closeIcon) closeIcon.style.display = 'none';
    },

    toggleChat: function () {
      if (isOpen) {
        this.closeChat();
      } else {
        this.openChat();
      }
    },

    closePopover: function () {
      const popover = document.getElementById('wb-popover');
      if (popover) popover.style.display = 'none';
    },

    clearChat: function () {
      messages = [];
      const container = document.getElementById('wb-messages');
      if (container) container.innerHTML = '';
      appendBotMessage(WB_CONFIG.initialGreeting, [
        { text: "📈 Scale My SEO", action: "sendChip", param: "How can you help scale my SEO and domain authority?" },
        { text: "💻 Build a Web App", action: "sendChip", param: "Tell me about your full-stack web development services." },
        { text: "🤖 AI & Automations", action: "sendChip", param: "Can you build a custom RAG system or AI automation for my business?" }
      ]);
    },

    toggleSound: function () {
      WB_CONFIG.soundEnabled = !WB_CONFIG.soundEnabled;
      const btn = document.getElementById('wb-sound-btn');
      if (btn) btn.textContent = WB_CONFIG.soundEnabled ? '🔊' : '🔇';
    },

    handleQuickChip: function (query) {
      this.openChat();
      processUserMessage(query);
    },

    handleSubmit: function (e) {
      if (e) e.preventDefault();
      const input = document.getElementById('wb-user-input');
      if (input) {
        processUserMessage(input.value);
      }
    },

    handleCtaAction: function (action, param) {
      if (action === 'openLeadForm') {
        this.openLeadForm(param);
      } else if (action === 'sendChip') {
        processUserMessage(param);
      } else if (action === 'scrollToSection') {
        if (typeof window.scrollToId === 'function') {
          window.scrollToId(param);
        } else {
          const el = document.getElementById(param);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (action === 'openUrl') {
        window.open(param, '_blank');
      }
    },

    openLeadForm: function (topic = '') {
      const drawer = document.getElementById('wb-lead-drawer');
      const topicEl = document.getElementById('wb-lead-topic');
      const msgInput = document.getElementById('wb-lead-msg');
      if (drawer) drawer.classList.add('open');
      if (topicEl && topic) topicEl.textContent = `📅 Connect regarding: ${topic}`;
      if (msgInput && topic) msgInput.value = `Inquiring about ${topic}`;
      const emailInput = document.getElementById('wb-lead-email');
      if (emailInput) emailInput.focus();
    },

    closeLeadForm: function () {
      const drawer = document.getElementById('wb-lead-drawer');
      if (drawer) drawer.classList.remove('open');
    },

    submitLead: async function () {
      const nameEl = document.getElementById('wb-lead-name');
      const emailEl = document.getElementById('wb-lead-email');
      const msgEl = document.getElementById('wb-lead-msg');

      const email = emailEl ? emailEl.value.trim() : '';
      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        if (emailEl) emailEl.focus();
        return;
      }

      const name = nameEl ? nameEl.value.trim() : '';
      const message = msgEl ? msgEl.value.trim() : '';

      try {
        await fetch(WB_CONFIG.leadEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            message,
            source: 'WaleedBot Chat'
          })
        });
      } catch (err) {
        // Continue gracefully
      }

      this.closeLeadForm();
      if (nameEl) nameEl.value = '';
      if (emailEl) emailEl.value = '';
      if (msgEl) msgEl.value = '';

      appendBotMessage(`🎉 Thank you, **${name || 'there'}**! Your inquiry has been received. I will personally reach out to you at **${email}** within 24 hours to schedule our discovery call.`);
    }
  };

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.WaleedBot.init());
  } else {
    window.WaleedBot.init();
  }
})();
