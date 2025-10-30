# Gemini Atlas

**AI-powered Chrome extension for intelligent web page analysis, Q&A, and text rewriting using Gemini Nano.**

Built for the [Google Chrome Built-in AI Challenge 2025](https://googlechromeai.devpost.com/).

---

## 🌟 What is Gemini Atlas?

Gemini Atlas is a Chrome extension that brings the power of on-device AI to your browsing experience. It helps you quickly understand, analyze, and interact with web content without ever leaving the page.

### Key Features

- **📄 Intelligent Page Q&A** - Ask questions about any webpage and get instant answers based on the content
- **📺 YouTube Transcript Analysis** - Automatically extracts video transcripts and lets you ask questions about videos
- **✨ One-Click Summarization** - Get quick TL;DR summaries of long articles or pages
- **✏️ AI Text Rewriting** - Select text in any textarea (emails, forms, etc.) and rewrite it with AI:
  - Make it more formal or casual
  - Fix grammar and spelling
  - Shorten or expand text
  - Change tone and style
- **⌨️ Keyboard Shortcuts** - Quick access with `Ctrl+Shift+Y` (open sidebar), `Ctrl+Shift+S` (summarize) and `Ctrl+J` (Rewrite selected text)

---

## 🔧 Chrome Built-in AI APIs Used

This extension leverages the following Chrome Built-in AI APIs:

1. **Prompt API** - Powers the intelligent Q&A functionality for answering questions about page content
2. **Summarizer API** - Generates concise summaries of web pages
3. **Rewriter API** - Enables AI-powered text rewriting in textareas with multiple tone and style options

All processing happens **client-side** on your device, ensuring privacy and fast performance.


---

## 📦 Installation

### Install the Extension

1. **Download or Clone this repository**
   ```bash
   git clone https://github.com/SarthakS97/gemini-atlas.git
   ```

2. **Open Chrome Extensions page**
   - Go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)

3. **Load the extension**
   - Click **"Load unpacked"**
   - Select the `gemini-atlas` folder
   - The extension icon should appear in your toolbar


---

## 🎮 How to Use

### Sidebar Q&A
1. Click the extension icon **OR** press `Ctrl+Shift+Y`
2. The sidebar opens on the right side
3. Type your question in the input box
4. Get instant AI-powered answers based on the page content

### Summarization
1. Open the sidebar
2. Click the **✨ Summarize** button **OR** press `Ctrl+Shift+S`
3. Get a concise summary of the current page

### Text Rewriting (in textareas)
1. Select text in any textarea (Gmail, forms, etc.)
2. Ctrl + J → Give instructions → **"Rewrite with AI"**
3. Choose your rewriting option: Make more formal, casual, fix grammar, shorten, expand etc

### YouTube Videos
- The extension automatically detects YouTube videos
- It extracts transcripts and uses them for Q&A
- Ask questions about the video

---

