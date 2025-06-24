# Self-Contained Chat Widget

This project provides a single JavaScript file that can be easily embedded into any website to add a functional chat widget. The widget is self-contained, meaning it injects its own HTML and CSS, and can be configured to connect to any n8n webhook URL.

## Features

- **Easy Integration**: Add the chat widget to your site with a single `<script>` tag.
- **Self-Contained**: The script handles everything - CSS, HTML, and JavaScript logic.
- **Configurable**: Set your n8n webhook URL directly in the script tag.
- **No Dependencies**: Works in any modern browser without requiring external libraries.

## How It Works

The `chat-widget.js` script, when included in a webpage, does the following:
1.  **Injects CSS**: It adds all the necessary styles for the chat widget into the `<head>` of the document.
2.  **Injects HTML**: It appends the HTML structure for the chat widget to the end of the `<body>`.
3.  **Initializes Logic**: It runs the JavaScript code to handle sending messages, receiving responses, and updating the chat interface.

## Getting Started

### 1. Host the `chat-widget.js` File

You need to host the `chat-widget.js` file on a server so it can be accessed from the web. You can use services like GitHub Pages, Netlify, Vercel, or your own web server.

### 2. Add the Script to Your Website

To add the chat widget to your website, paste the following line of HTML just before the closing `</body>` tag of your HTML file.

```html
<script src="URL_TO_YOUR_HOSTED_WIDGET_FILE/chat-widget.js" 
        data-webhook-url="YOUR_N8N_WEBHOOK_URL" 
        defer>
</script>
```

### 3. Configure the Script

You need to replace two placeholders in the script tag:
-   `URL_TO_YOUR_HOSTED_WIDGET_FILE/chat-widget.js`: Change this to the actual URL where you are hosting the `chat-widget.js` file.
-   `YOUR_N8N_WEBHOOK_URL`: Replace this with the webhook URL from your specific n8n workflow.

### Example

If you host the file on a domain `https://example.com/`, the script tag would look like this:

```html
<script src="https://example.com/chat-widget.js" 
        data-webhook-url="https://n8n.example.com/webhook/your-id" 
        defer>
</script>
```

## Local Demo

The included `index.html` file provides a simple demonstration of how the widget works. To run it locally, you can use a simple web server.

1.  Make sure you have Node.js installed.
2.  Install a simple server package like `http-server`:
    ```bash
    npm install -g http-server
    ```
3.  Run the server from the project directory:
    ```bash
    http-server
    ```
4.  Open your browser and navigate to the provided local URL (e.g., `http://localhost:8080`).

**Note**: The chat functionality in the local demo will not work until you replace `"YOUR_N8N_WEBHOOK_URL"` in `index.html` with a real webhook URL. 