// background.js - Handles keyboard shortcuts and background tasks

console.log('✅ Background script loaded');

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('⌨️ Command received:', command);
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      const message = command === 'toggleSidebar' 
        ? { action: 'toggleSidebar' } 
        : { action: 'summarizePage' };
      
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        // Silently catch errors (e.g., on chrome:// pages or before content script loads)
        if (chrome.runtime.lastError) {
          console.log('Could not send message:', chrome.runtime.lastError.message);
        }
      });
    }
  });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' }, (response) => {
    // Silently catch errors (e.g., on chrome:// pages or before content script loads)
    if (chrome.runtime.lastError) {
      console.log('Could not send message:', chrome.runtime.lastError.message);
    }
  });
});

// Handle reading list requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getReadingList') {
    chrome.readingList.query({}, (items) => {
      sendResponse(items || []);
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'searchHistory') {
    const { keywords, originalQuery } = request;
    
    // Search history with keywords
    const searchText = keywords.join(' ');
    
    chrome.history.search({
      text: searchText,
      maxResults: 50
    }, (results) => {
      // Score and sort results by relevance
      const scoredResults = results.map(item => {
        let score = 0;
        const titleLower = (item.title || '').toLowerCase();
        const urlLower = item.url.toLowerCase();
        
        keywords.forEach(keyword => {
          if (titleLower.includes(keyword)) score += 3;
          if (urlLower.includes(keyword)) score += 1;
        });
        
        return { ...item, score };
      });
      
      // Sort by score, then by visit count
      scoredResults.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.visitCount || 0) - (a.visitCount || 0);
      });
      
      sendResponse(scoredResults.slice(0, 10));
    });
    
    return true; // Keep message channel open for async response
  }
});