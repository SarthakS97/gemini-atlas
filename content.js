// ==========================================================
// 🔴 FLOATING PROMPT UI LOGIC WITH REWRITER API
// ==========================================================

// --- State and UI Elements ---
let activeRange = null;
let rewriter = null; // Rewriter API instance

// Initialize Rewriter API
async function initRewriter() {
  if (rewriter) return rewriter;
  
  try {
    if (!('Rewriter' in self)) {
      console.error('❌ Rewriter API not available');
      return null;
    }
    
    const availability = await Rewriter.availability();
    console.log('Rewriter availability:', availability);
    
    if (availability === 'unavailable') {
      console.error('❌ Rewriter not available on this device');
      return null;
    }
    
    if (availability === 'downloading') {
      console.log('⏳ Rewriter model is downloading...');
    }
    
    rewriter = await Rewriter.create({
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`Downloaded ${Math.round(e.loaded * 100)}%`);
        });
      }
    });
    
    console.log('✅ Rewriter API initialized');
    return rewriter;
  } catch (err) {
    console.error('Failed to initialize Rewriter:', err);
    return null;
  }
}

// Initialize on load
initRewriter();

// 1. Create and inject the floating prompt UI element
const promptUI = document.createElement('div');
promptUI.id = 'gemini-replacement-prompt';
promptUI.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2147483647;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    padding: 16px;
    width: 320px;
    display: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    pointer-events: auto;
`;

promptUI.innerHTML = `
    <style>
        #gemini-replacement-prompt * {
            box-sizing: border-box;
        }
        
        .prompt-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 15px;
            font-weight: 600;
            color: #333;
        }
        
        .prompt-icon {
            font-size: 18px;
        }
        
        .prompt-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 6px;
            font-weight: 500;
        }
        
        .original-text {
            background: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 12px;
            font-size: 13px;
            color: #555;
            max-height: 80px;
            overflow-y: auto;
        }
        
        .prompt-input-wrapper {
            position: relative;
        }
        
        .prompt-input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        
        .prompt-input:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        .prompt-actions {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            margin-top: 12px;
        }
        
        .prompt-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .prompt-btn-cancel {
            background: #f5f5f5;
            color: #666;
        }
        
        .prompt-btn-cancel:hover {
            background: #e0e0e0;
        }
        
        .prompt-btn-submit {
            background: #4f46e5;
            color: white;
        }
        
        .prompt-btn-submit:hover {
            background: #4338ca;
            transform: translateY(-1px);
        }
        
        .prompt-btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
    </style>
    
    <div class="prompt-header">
        <span class="prompt-icon">✍🏻</span>
        <span>Rewrite with Atlas</span>
    </div>
    
    <div class="prompt-label">Selected Text</div>
    <div class="original-text" id="original-text-display"></div>
    
    <div class="prompt-label">How should I rewrite this?</div>
    <div class="prompt-input-wrapper">
        <input type="text" id="replacement-input" class="prompt-input" placeholder="e.g., make it more formal..." autofocus>
    </div>
    
    <div class="prompt-actions">
        <button id="prompt-cancel" class="prompt-btn prompt-btn-cancel">Cancel</button>
        <button id="replacement-submit" class="prompt-btn prompt-btn-submit">Rewrite</button>
    </div>
`;

document.body.appendChild(promptUI);

const replacementInput = document.getElementById('replacement-input');
const submitButton = document.getElementById('replacement-submit');
const cancelButton = document.getElementById('prompt-cancel');
const originalTextDisplay = document.getElementById('original-text-display');

// Hide the UI when clicking outside
document.addEventListener('mousedown', (event) => {
    if (!promptUI.contains(event.target)) {
        promptUI.style.display = 'none';
        activeRange = null;
    }
});

// Cancel button
cancelButton.addEventListener('click', () => {
    promptUI.style.display = 'none';
    activeRange = null;
});

/**
 * Replace selected text using Rewriter API
 */
async function replaceSelectionWithRewriter(instruction, rangeToUse, originalText) {
    if (!rangeToUse) {
        console.error('Replacement failed: No active range stored.');
        return;
    }

    // Show loading state
    submitButton.textContent = 'Rewriting...';
    submitButton.disabled = true;
    replacementInput.disabled = true;

    try {
        // Initialize Rewriter if not already done
        const rewriterInstance = await initRewriter();
        
        if (!rewriterInstance) {
            throw new Error('Rewriter API is not available');
        }

        // Call Rewriter API
        console.log('🔄 Rewriting text with instruction:', instruction);
        const rewrittenText = await rewriterInstance.rewrite(originalText, {
            context: instruction
        });
        
        console.log('✅ Rewritten text:', rewrittenText);

        // Create a Text Node with the rewritten text
        const textNode = document.createTextNode(rewrittenText);

        // Clear existing content
        rangeToUse.deleteContents();

        // Insert the new content
        rangeToUse.insertNode(textNode);

        // Move cursor to end of inserted text
        const selection = window.getSelection();
        selection.removeAllRanges();
        rangeToUse.setStartAfter(textNode);
        rangeToUse.setEndAfter(textNode);
        selection.addRange(rangeToUse);

        // Hide UI after successful replacement
        promptUI.style.display = 'none';
        activeRange = null;
        
        console.log('✅ Replacement successful');

    } catch (error) {
        console.error('❌ Rewriter error:', error);
        alert('Error: ' + error.message);
    } finally {
        // Reset button state
        submitButton.textContent = 'Rewrite';
        submitButton.disabled = false;
        replacementInput.disabled = false;
    }
}

// Submit button click handler
submitButton.addEventListener('click', async () => {
    const instruction = replacementInput.value.trim();
    const originalText = originalTextDisplay.textContent;
    
    if (!instruction) {
        alert('Please enter rewriting instructions');
        return;
    }
    
    if (activeRange) {
        await replaceSelectionWithRewriter(instruction, activeRange, originalText);
    } else {
        promptUI.style.display = 'none';
    }
});

// Enter key handler
replacementInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitButton.click();
    }
});

/**
 * Show the prompt UI when Ctrl/Cmd + J is pressed
 */
function handleShortcutTrigger() {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        try {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            // Store the range
            activeRange = range.cloneRange();
            
            // Store the original text
            const selectedText = activeRange.toString();
            originalTextDisplay.textContent = selectedText;

            // Calculate position
            const uiWidth = 320;
            let x = rect.right + window.scrollX - uiWidth;
            let y = rect.top + window.scrollY - 10;

            // Prevent going off screen
            x = Math.max(x, window.scrollX + 10);
            
            if (y < window.scrollY) {
                y = rect.bottom + window.scrollY + 5;
            }

            promptUI.style.left = `${x}px`;
            promptUI.style.top = `${y}px`;
            promptUI.style.display = 'block';

            // Clear and focus input
            replacementInput.value = '';
            replacementInput.focus();
            
            console.log('✅ Prompt UI shown for text:', selectedText.substring(0, 50) + '...');
            
        } catch (e) {
            console.error('Error positioning UI:', e);
            promptUI.style.display = 'none';
            activeRange = null;
        }
    } else {
        console.log('⚠️ No text selected');
    }
}

/**
 * Global keydown listener for Ctrl/Cmd + J
 */
document.addEventListener('keydown', (event) => {
    const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j';

    if (isShortcut) {
        event.preventDefault(); 
        event.stopPropagation();
        handleShortcutTrigger();
    }
}, true);