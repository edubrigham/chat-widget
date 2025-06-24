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
        #chat-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-width: 90%;
            height: 500px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: Arial, sans-serif;
            z-index: 9999;
        }

        #chat-header {
            background: #4a4a4a;
            color: white;
            padding: 15px;
            text-align: center;
            font-size: 1.1em;
            font-weight: bold;
        }

        #chat-messages {
            flex-grow: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }

        .message {
            padding: 10px 15px;
            border-radius: 18px;
            max-width: 80%;
            line-height: 1.4;
            color: #333;
        }

        .user-message {
            background: #007bff;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }

        .bot-message {
            background: #e9e9eb;
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
            padding: 10px;
            border-top: 1px solid #eee;
        }

        #chat-input {
            flex-grow: 1;
            border: 1px solid #ddd;
            padding: 10px;
            font-size: 1em;
            border-radius: 20px;
            margin-right: 10px;
        }

        #chat-input:focus {
            outline: none;
            border-color: #007bff;
        }

        #send-btn {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.2s;
        }

        #send-btn:hover {
            background: #0056b3;
        }
    `;

    // 2. HTML structure for the chat widget
    const widgetHtml = `
        <div id="chat-widget-container">
            <div id="chat-header">
                <span>Chat with our AI</span>
            </div>
            <div id="chat-messages" aria-live="polite">
                 <div class="message bot-message">Hello! How can I help you today?</div>
            </div>
            <div id="chat-input-container">
                <input type="text" id="chat-input" placeholder="Type your message..." aria-label="Chat input">
                <button id="send-btn" aria-label="Send message">Send</button>
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
        const widgetContainer = document.createElement('div');
        widgetContainer.innerHTML = widgetHtml;
        document.body.appendChild(widgetContainer);
        
        // --- All the chat logic from before goes here ---
        const chatMessages = document.getElementById('chat-messages');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);

        const appendMessage = (text, sender) => {
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
    }

    // Wait for the DOM to be fully loaded before initializing the widget
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        // DOM is already ready
        initializeWidget();
    }

})(); 