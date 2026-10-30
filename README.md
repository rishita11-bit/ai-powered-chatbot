# AI-Powered Chatbot

A responsive AI chatbot web app built with Python, Flask, HTML, CSS, JavaScript, and the Google Gemini API.

## Features
- Real AI-generated answers using Gemini
- Chat-style interface with conversation context
- Clear chat and example prompts
- Responsive layout for phones and computers
- API key stays on the server (it is never placed in browser code)
- Health-check endpoint for deployment

## Run locally
1. Install Python 3.10 or newer.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a Gemini API key in Google AI Studio.
4. Set the environment variable `GEMINI_API_KEY` to your key.
   - macOS/Linux: `export GEMINI_API_KEY="your-key"`
   - Windows PowerShell: `$env:GEMINI_API_KEY="your-key"`
5. Start the app:
   ```bash
   python app.py
   ```
6. Open `http://127.0.0.1:5000`.

## Deploy on Render
1. Push the extracted project files to a GitHub repository.
2. In Render, create **New + → Web Service** and connect that repository.
3. Use:
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app`
4. In the Render service, open **Environment** and add:
   - Key: `GEMINI_API_KEY`
   - Value: your Gemini API key
5. Save changes and deploy.

Render may also read `render.yaml` when deploying as a Blueprint. Add `GEMINI_API_KEY` as a secret environment variable in Render; never commit it to GitHub.

## Notes
- A Gemini API key is required for live AI responses. Without it, the web page loads but chat requests show a setup message.
- Gemini API availability, quotas, and pricing depend on Google's current terms and your account.
- The browser keeps the conversation for the current page session; refreshing starts a new conversation.
- Do not share your API key or put it in `static/script.js`, HTML, or GitHub.
