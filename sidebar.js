// sidebar.js - Only sidebar features (no rewriter popup)
console.log('✅ Sidebar.js loaded');

let sidebarOpen = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📩 Sidebar received message:', request);
  
  if (request.action === "toggleSidebar") {
    console.log('🎯 Toggle sidebar triggered');
    toggleSidebar();
  }
  
  if (request.action === "summarizePage") {
    console.log('📝 Summarize page triggered');
    handleSummarizeShortcut();
  }
});

async function handleSummarizeShortcut() {
  const existingSidebar = document.getElementById('ai-assistant-sidebar');
  
  // If sidebar doesn't exist, create it first
  if (!existingSidebar) {
    createSidebar();
    // Wait a bit for sidebar to initialize
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Open sidebar if closed
  const sidebar = document.getElementById('ai-assistant-sidebar');
  if (sidebar && !sidebarOpen) {
    sidebar.style.transform = 'translateX(0)';
    sidebarOpen = true;
  }
  
  // Trigger summarize button click
  const summarizeBtn = document.getElementById('ai-summarize-btn');
  if (summarizeBtn) {
    summarizeBtn.click();
  }
}

function toggleSidebar() {
  const existingSidebar = document.getElementById('ai-assistant-sidebar');
  
  if (existingSidebar) {
    sidebarOpen = !sidebarOpen;
    existingSidebar.style.transform = sidebarOpen ? 'translateX(0)' : 'translateX(100%)';
    return;
  }
  
  createSidebar();
}

function createSidebar() {
  // Create sidebar container
  const sidebar = document.createElement('div');
  sidebar.id = 'ai-assistant-sidebar';
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    height: 100vh;
    background: rgba(15, 15, 35, 0.7);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    z-index: 999999;
    box-shadow: -12px 0 48px rgba(0, 0, 0, 0.6), 
                -2px 0 8px rgba(0, 0, 0, 0.3),
                inset 1px 0 2px rgba(255, 255, 255, 0.15),
                inset -1px 0 2px rgba(0, 0, 0, 0.2);
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    border-left: 1px solid rgba(255, 255, 255, 0.15);
  `;
  
  sidebar.innerHTML = `
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      #ai-assistant-sidebar * {
        box-sizing: border-box;
      }
      
      #ai-sidebar-header {
        padding: 16px 20px;
        background: linear-gradient(135deg, 
          rgba(10, 10, 25, 0.95) 0%, 
          rgba(20, 20, 40, 0.9) 100%);
        backdrop-filter: blur(30px) saturate(180%);
        -webkit-backdrop-filter: blur(30px) saturate(180%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
      }
      
      #ai-sidebar-header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(138, 43, 226, 0.4), 
          transparent);
      }
      
      #ai-sidebar-header h1 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      #ai-sidebar-header h1::before {
        content: '✦';
        font-size: 14px;
        background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      #ai-sidebar-close {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.7);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
      }
      
      #ai-sidebar-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        transform: scale(1.05);
      }
      
      #ai-chat {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        scrollbar-width: thin;
        scrollbar-color: rgba(138, 43, 226, 0.3) transparent;
      }
      
      #ai-chat::-webkit-scrollbar {
        width: 6px;
      }
      
      #ai-chat::-webkit-scrollbar-track {
        background: transparent;
      }
      
      #ai-chat::-webkit-scrollbar-thumb {
        background: rgba(138, 43, 226, 0.3);
        border-radius: 3px;
      }
      
      #ai-chat::-webkit-scrollbar-thumb:hover {
        background: rgba(138, 43, 226, 0.5);
      }
      
      .ai-message {
        padding: 12px 16px;
        border-radius: 14px;
        max-width: 88%;
        line-height: 1.5;
        word-wrap: break-word;
        font-size: 14px;
        animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
      }
      
      .ai-message.user {
        align-self: flex-end;
        background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
        color: white;
        box-shadow: 0 2px 12px rgba(124, 58, 237, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .ai-message.ai {
        align-self: flex-start;
        background: rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        color: #e8eaed;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
      .ai-message.ai strong {
        color: #ffffff;
      }
      
      .ai-message.ai em {
        color: #d1d5db;
      }
      
      .ai-message.thinking {
        background: rgba(124, 58, 237, 0.08);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(124, 58, 237, 0.2);
        animation: pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        color: #e0d4ff;
      }
      
      #ai-input-container {
        padding: 16px 20px 20px 20px;
        background: linear-gradient(135deg, rgba(10, 10, 25, 0.95) 0%, rgba(20, 20, 40, 0.9) 100%);
        backdrop-filter: blur(30px);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        position: relative;
      }
      
      #ai-input-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, 
          transparent, 
          rgba(138, 43, 226, 0.4), 
          transparent);
      }
      
      #ai-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      
      #ai-query {
        flex: 1;
        padding: 12px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        color: #fff;
        font-size: 14px;
        outline: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      #ai-query::placeholder {
        color: rgba(255, 255, 255, 0.35);
      }
      
      #ai-query:focus {
        border-color: rgba(124, 58, 237, 0.5);
        background: rgba(255, 255, 255, 0.08);
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
      }
      
      .ai-action-btn {
        padding: 0;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
      }
      
      .ai-action-btn:hover {
        background: rgba(124, 58, 237, 0.15);
        border-color: rgba(124, 58, 237, 0.3);
        color: #c4b5fd;
      }
      
      .ai-action-btn:active {
        transform: scale(0.95);
      }
      
      #ai-summarize-btn {
        width: 40px;
        font-size: 16px;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        white-space: nowrap;
        padding: 0;
      }
      
      #ai-summarize-btn .sum-text {
        opacity: 0;
        width: 0;
        display: inline-block;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 13px;
        font-weight: 500;
      }
      
      #ai-summarize-btn .sum-icon {
        display: inline-block;
      }
      
      #ai-summarize-btn:hover {
        width: 120px;
        padding: 0 12px;
        background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
        border-color: rgba(124, 58, 237, 0.5);
        color: #fff;
        box-shadow: 0 2px 12px rgba(124, 58, 237, 0.3);
      }
      
      #ai-summarize-btn:hover .sum-text {
        opacity: 1;
        width: auto;
        margin-left: 4px;
      }
      
      #ai-send-btn {
        background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
        box-shadow: 0 2px 12px rgba(124, 58, 237, 0.3);
      }
      
      #ai-send-btn:hover {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        box-shadow: 0 4px 16px rgba(124, 58, 237, 0.4);
      }
    </style>
    
    <div id="ai-sidebar-header">
      <h1>Gemini Atlas</h1>
      <button id="ai-sidebar-close">×</button>
    </div>
    
    <div id="ai-chat"></div>
    
    <div id="ai-input-container">
      <div id="ai-input-wrapper">
        <button id="ai-summarize-btn" class="ai-action-btn"><span class="sum-icon">✨</span><span class="sum-text">Summarize</span></button>
        <input id="ai-query" type="text" placeholder="Ask anything...">
        <button id="ai-send-btn" class="ai-action-btn">→</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(sidebar);
  
  // Animate in
  setTimeout(() => {
    sidebar.style.transform = 'translateX(0)';
    sidebarOpen = true;
  }, 10);
  
  // Initialize AI functionality
  initializeSidebar(sidebar);
}

async function initializeSidebar(sidebar) {
  const chat = sidebar.querySelector('#ai-chat');
  const queryInput = sidebar.querySelector('#ai-query');
  const sendBtn = sidebar.querySelector('#ai-send-btn');
  const summarizeBtn = sidebar.querySelector('#ai-summarize-btn');
  const closeBtn = sidebar.querySelector('#ai-sidebar-close');
  
  let summarizer;
  let promptSession;
  
  function addMessage(text, sender, isThinking = false) {
    const msg = document.createElement('div');
    msg.className = 'ai-message ' + sender + (isThinking ? ' thinking' : '');
    
    // Only convert markdown for regular AI responses (not thinking or error messages)
    if (sender === 'ai' && !isThinking && typeof text === 'string' && text.includes('*')) {
      // Convert **bold** to <strong>
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Convert *italic* to <em>
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      // Convert line breaks
      text = text.replace(/\n/g, '<br>');
      msg.innerHTML = text;
    } else {
      msg.textContent = text;
    }
    
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
    return msg;
  }
  
  async function getSummarizer() {
    if (!('Summarizer' in self)) throw new Error('❌ Gemini Nano Summarizer not available.');
    return await Summarizer.create({
      type: 'tldr',
      length: 'medium',
      format: 'plain-text',
      outputLanguage: 'en',
    });
  }
  
  async function getPromptSession() {
    if (!('LanguageModel' in self)) throw new Error('❌ Prompt API not available.');
    
    const availability = await LanguageModel.availability();
    if (availability === 'unavailable') {
      throw new Error('❌ Language model is not available on this device.');
    }
    
    return await LanguageModel.create({
      systemPrompt: 'You are a helpful assistant that answers questions based on webpage content. Answer directly and concisely. If you find the answer in the content, state it clearly. If you cannot find specific information, say "I cannot find that information on this page." Never contradict yourself or provide conflicting statements.'
    });
  }
  
  async function getPageText() {
    // Special case: YouTube video pages
    if (window.location.hostname.includes('youtube.com') && window.location.pathname.includes('/watch')) {
      const transcript = await getYouTubeTranscript();
      if (transcript) {
        console.log('📺 Using YouTube transcript as page context');
        return `YouTube Video Transcript:\n\n${transcript}`;
      } else {
        console.log('⚠️ No YouTube transcript found, falling back to page content');
      }
    }
    
    // Use Readability.js-like approach to extract main content intelligently
    // This is fast and gets only the meaningful content like Firefox Reader View
    
    const clone = document.cloneNode(true);
    
    // Remove non-content elements (ads, nav, scripts, etc.)
    const selectorsToRemove = [
      'script',
      'style',
      'noscript',
      'iframe',
      'svg',
      '[class*="ad-"]',
      '[class*="advertisement"]',
      '[id*="ad-"]',
      '[id*="advertisement"]',
      '[class*="banner"]',
      '[class*="popup"]',
      '[class*="modal"]',
      'nav',
      'header',
      'footer',
      '[role="banner"]',
      '[role="navigation"]',
      '[role="complementary"]',
      '.sidebar',
      '#sidebar',
      '[class*="sponsor"]',
      '[class*="promo"]',
    ];
    
    selectorsToRemove.forEach(selector => {
      clone.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    // Get all meaningful content - paragraphs, headings, lists, and links with their hrefs
    const contentElements = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, article, section, a[href]');
    
    let contentText = '';
    contentElements.forEach(el => {
      const text = el.innerText?.trim();
      if (text) {
        contentText += text + '\n';
        
        // If it's a link, also include the href attribute
        if (el.tagName === 'A' && el.href) {
          contentText += `Link URL: ${el.href}\n`;
        }
      }
    });
    
    return contentText.trim();
  }
  
  async function getYouTubeTranscript() {
    try {
      // Method 1: Check if transcript panel is already open
      let transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
      
      if (transcriptSegments.length > 0) {
        console.log('✅ Found open transcript with', transcriptSegments.length, 'segments');
        let transcript = '';
        transcriptSegments.forEach(segment => {
          const textElement = segment.querySelector('yt-formatted-string.segment-text');
          if (textElement) {
            transcript += textElement.textContent.trim() + ' ';
          }
        });
        if (transcript.trim()) {
          console.log('✅ Extracted transcript length:', transcript.length);
          return transcript.trim();
        }
      }
      
      // Method 2: Try to open the transcript panel
      console.log('📂 Attempting to open transcript panel...');
      
      // Look for the "Show transcript" button - try multiple selectors
      const possibleButtons = [
        ...document.querySelectorAll('button[aria-label*="transcript" i]'),
        ...document.querySelectorAll('button[aria-label*="Show transcript" i]'),
        ...document.querySelectorAll('[id*="transcript"]'),
        ...document.querySelectorAll('.yt-spec-button-shape-next--call-to-action')
      ];
      
      let transcriptButton = null;
      for (const btn of possibleButtons) {
        const label = btn.getAttribute('aria-label') || btn.textContent || '';
        if (label.toLowerCase().includes('transcript')) {
          transcriptButton = btn;
          break;
        }
      }
      
      if (transcriptButton) {
        console.log('🖱️ Found transcript button, clicking...', transcriptButton.getAttribute('aria-label'));
        transcriptButton.click();
        
        // Wait for transcript to load
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Try to get segments again
        transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
        
        if (transcriptSegments.length > 0) {
          console.log('✅ Transcript loaded with', transcriptSegments.length, 'segments');
          let transcript = '';
          transcriptSegments.forEach(segment => {
            const textElement = segment.querySelector('yt-formatted-string.segment-text');
            if (textElement) {
              transcript += textElement.textContent.trim() + ' ';
            }
          });
          if (transcript.trim()) {
            console.log('✅ Extracted transcript length:', transcript.length);
            return transcript.trim();
          }
        } else {
          console.log('⚠️ No segments found after clicking button');
        }
      } else {
        console.log('⚠️ Transcript button not found');
      }
      
      // Method 3: Extract from video title and description as fallback
      console.log('ℹ️ Falling back to video metadata...');
      const videoTitle = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')?.textContent || 
                        document.querySelector('h1.title yt-formatted-string')?.textContent || '';
      const videoDescription = document.querySelector('#description-inline-expander yt-formatted-string')?.textContent || 
                              document.querySelector('#description yt-formatted-string')?.textContent || '';
      
      if (videoTitle || videoDescription) {
        console.log('✅ Using video title and description as fallback');
        return `Video Title: ${videoTitle}\n\nVideo Description: ${videoDescription}`;
      }
      
      console.log('❌ Could not find any transcript or video info');
      return null;
    } catch (error) {
      console.error('❌ Error extracting YouTube transcript:', error);
      return null;
    }
  }
  
  // Initialize
  try {
    summarizer = await getSummarizer();
    promptSession = await getPromptSession();
    
    // Check if on YouTube and show appropriate message
    const isYouTube = window.location.hostname.includes('youtube.com') && window.location.pathname.includes('/watch');
    if (isYouTube) {
      addMessage('📺 YouTube mode! Using video transcript for Q&A and summaries.', 'ai');
    } else {
      addMessage('Gemini Atlas ready! Ask questions about this page.', 'ai');
    }
  } catch (err) {
    addMessage(err.message, 'ai');
  }
  
  // Close sidebar
  function closeSidebar() {
    sidebar.style.transform = 'translateX(100%)';
    sidebarOpen = false;
  }
  
  closeBtn.onclick = closeSidebar;
  
  // Send message
  async function sendMessage() {
    const question = queryInput.value.trim();
    if (!question) return;
    
    addMessage(question, 'user');
    queryInput.value = '';
    
    // Page Context mode - Q&A about current page
    const thinkingMsg = addMessage('Thinking...', 'ai', true);
    
    try {
      const pageContent = await getPageText();
      const prompt = `Based on the following webpage content, answer this question: "${question}"\n\nWebpage content:\n${pageContent.substring(0, 12000)}`;
      
      const answer = await promptSession.prompt(prompt);
      thinkingMsg.className = 'ai-message ai';
      
      // Convert markdown to HTML for proper formatting
      let formattedAnswer = answer
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
      thinkingMsg.innerHTML = formattedAnswer;
    } catch (err) {
      thinkingMsg.className = 'ai-message ai';
      thinkingMsg.textContent = `Error: ${err.message}`;
    }
  }
  
  sendBtn.onclick = sendMessage;
  queryInput.onkeypress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };
  
  // Summarize page
  summarizeBtn.onclick = async () => {
    const summaryMsg = addMessage('Analyzing page...', 'ai', true);
    try {
      const text = await getPageText();
      const summary = await summarizer.summarize(text);
      summaryMsg.className = 'ai-message ai';
      summaryMsg.textContent = summary;
    } catch (err) {
      summaryMsg.className = 'ai-message ai';
      summaryMsg.textContent = `Error: ${err.message}`;
    }
  };
}