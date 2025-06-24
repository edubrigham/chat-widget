// chat-widget.js

(function() {
    // Get the user-provided webhook URL from the script tag
    const scriptTag = document.currentScript;
    const n8nWebhookUrl = scriptTag.getAttribute('data-webhook-url');

    if (!n8nWebhookUrl) {
        console.error('Chat Widget Error: The data-webhook-url attribute is missing from the <script> tag.');
        return;
    }

    // 1. CSS styles for the chat widget
    const styles = `
        :root {
            --widget-height-collapsed: 60px;
            --widget-height-expanded: 500px;
        }

        #chat-widget-container {
            position: fixed;
            bottom: 0;
            right: 20px;
            width: 350px;
            max-width: 90%;
            height: var(--widget-height-collapsed);
            background: #ffffff;
            border-top-left-radius: 16px;
            border-top-right-radius: 16px;
            box-shadow: 0 -2px 12px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            z-index: 9999;
            border: 1px solid #e0e0e0;
            border-bottom: none;
            color: #0F1419;
            transition: height 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }

        #chat-widget-container.is-open {
            height: var(--widget-height-expanded);
        }

        #chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            background: #ffffff;
            color: #0F1419;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            min-height: var(--widget-height-collapsed);
        }
        
        #chat-header-icons {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        #chat-header-icons svg {
            width: 24px;
            height: 24px;
            fill: #0F1419;
        }
        
        #toggle-widget-icon {
            transition: transform 0.3s;
        }

        #chat-widget-container.is-open #toggle-widget-icon {
            transform: rotate(180deg);
        }

        #chat-messages {
            flex-grow: 1;
            padding: 0 20px 20px 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            background-color: #ffffff;
        }

        .message {
            padding: 10px 15px;
            border-radius: 18px;
            max-width: 80%;
            line-height: 1.4;
        }

        .user-message {
            background: #1D9BF0;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .bot-message {
            background: #f0f0f0;
            color: #0F1419;
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }
        
        .typing-indicator {
            align-self: flex-start;
        }

        .typing-indicator span {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #a0a0a0;
            margin: 0 2px;
            animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
        }

        #chat-input-container {
            display: flex;
            align-items: center;
            padding: 10px 20px;
            border-top: 1px solid #e0e0e0;
        }

        #chat-input {
            flex-grow: 1;
            border: none;
            padding: 10px 15px;
            font-size: 1em;
            border-radius: 20px;
            margin-right: 10px;
            background-color: #f0f0f0;
            color: #0F1419;
        }

        #chat-input:focus {
            outline: none;
        }

        #send-btn {
            background: #1D9BF0;
            color: white;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.5em;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: background-color 0.2s;
        }

        #send-btn:hover {
            background: #1a8cd8;
        }
    `;

    // 2. HTML structure for the chat widget
    const widgetHtml = `
        <div id="chat-widget-container">
            <div id="chat-header">
                <span id="chat-widget-title">Messages</span>
                <div id="chat-header-icons">
                     <svg viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 12H5V5h14v9z"></path>
                    </svg>
                    <svg id="toggle-widget-icon" viewBox="0 0 24 24">
                        <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
                    </svg>
                </div>
            </div>
            <div id="chat-messages" aria-live="polite">
                 <div id="welcome-message" class="message bot-message">Hello! How can I help you today?</div>
            </div>
            <div id="chat-input-container">
                <input type="text" id="chat-input" placeholder="Start a new message" aria-label="Chat input">
                <button id="send-btn" aria-label="Send message">&#10148;</button>
            </div>
        </div>
    `;

    // Function to inject the widget and its styles into the page
    function initializeWidget() {
        // Inject CSS
        const styleElement = document.createElement('style');
        styleElement.innerHTML = styles;
        document.head.appendChild(styleElement);

        // Inject HTML
        document.body.insertAdjacentHTML('beforeend', widgetHtml);
        
        // --- All the chat logic from before goes here ---
        const widgetContainer = document.getElementById('chat-widget-container');
        const chatHeader = document.getElementById('chat-header');
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);

        const fetchWidgetConfig = async () => {
            try {
                const response = await fetch(n8nWebhookUrl, { method: 'GET' });
                if (!response.ok) throw new Error('Failed to fetch config');
                const config = await response.json();
                
                const titleElement = document.getElementById('chat-widget-title');
                const welcomeMessageElement = document.getElementById('welcome-message');

                if (config.title) {
                    titleElement.innerText = config.title;
                }
                if (config.welcomeMessage) {
                    welcomeMessageElement.innerText = config.welcomeMessage;
                }
            } catch (error) {
                console.error('Chat Widget Error: Could not fetch initial configuration.', error);
            }
        };

        const appendMessage = (text, sender) => {
            const welcomeMessage = document.getElementById('welcome-message');
            if(welcomeMessage) welcomeMessage.remove();

            const messageElement = document.createElement('div');
            messageElement.classList.add('message', `${sender}-message`);
            messageElement.textContent = text;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const showTypingIndicator = () => {
            const typingIndicator = document.createElement('div');
            typingIndicator.id = 'typing-indicator';
            typingIndicator.classList.add('message', 'typing-indicator');
            typingIndicator.innerHTML = '<span></span><span></span><span></span>';
            chatMessages.appendChild(typingIndicator);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const removeTypingIndicator = () => {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) typingIndicator.remove();
        };

        const sendMessage = async () => {
            const messageText = chatInput.value.trim();
            if (messageText === '') return;

            appendMessage(messageText, 'user');
            chatInput.value = '';
            showTypingIndicator();

            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: messageText, sessionId: sessionId }),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                const botResponse = data.text || 'Sorry, I could not get a response.';
                removeTypingIndicator();
                appendMessage(botResponse, 'bot');

            } catch (error) {
                console.error('Error sending message to n8n:', error);
                removeTypingIndicator();
                appendMessage('Sorry, something went wrong. Please try again later.', 'bot');
            }
        };

        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') sendMessage();
        });

        // Toggle widget visibility
        chatHeader.addEventListener('click', () => {
            widgetContainer.classList.toggle('is-open');
        });

        fetchWidgetConfig();
    }

    // Wait for the DOM to be fully loaded before initializing the widget
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        // DOM is already ready
        initializeWidget();
    }

})(); 