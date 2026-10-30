const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const conversation = document.getElementById("conversation");
const welcome = document.getElementById("welcome");
const newChatBtn = document.getElementById("newChatBtn");

let history = [];
let busy = false;

function addMessage(role, text, extraClass = "") {
  if (welcome && welcome.isConnected) welcome.remove();
  const row = document.createElement("div");
  row.className = `message ${role === "user" ? "user" : "assistant"}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "user" ? "You" : "✦";
  const bubble = document.createElement("div");
  bubble.className = `bubble ${extraClass}`;
  bubble.textContent = text;
  row.append(avatar, bubble);
  conversation.appendChild(row);
  conversation.scrollTop = conversation.scrollHeight;
  return row;
}

function setBusy(value) {
  busy = value;
  sendBtn.disabled = value;
  input.disabled = value;
  sendBtn.textContent = value ? "…" : "↑";
}

async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || busy) return;

  addMessage("user", clean);
  history.push({ role: "user", content: clean });
  input.value = "";
  input.style.height = "auto";
  setBusy(true);
  const typing = addMessage("model", "Thinking…", "typing");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: history.map(item => ({
          role: item.role,
          content: item.content
        }))
      })
    });
    const data = await response.json();
    typing.remove();

    if (!response.ok) {
      addMessage("model", data.error || "Something went wrong. Please try again.", "error");
      history.pop();
    } else {
      addMessage("model", data.reply);
      history.push({ role: "model", content: data.reply });
    }
  } catch (error) {
    typing.remove();
    addMessage("model", "Could not reach the chatbot server. Please check your connection and try again.", "error");
    history.pop();
  } finally {
    setBusy(false);
    input.focus();
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 140) + "px";
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt || ""));
});

newChatBtn.addEventListener("click", () => {
  history = [];
  conversation.innerHTML = "";
  const welcomeCard = document.createElement("div");
  welcomeCard.className = "welcome";
  welcomeCard.innerHTML = '<div class="welcome-icon">✦</div><h2>Start a conversation</h2><p>Ask a question, learn something new, or get help with an idea.</p><div class="suggestions"><button class="suggestion" type="button" data-prompt="Explain artificial intelligence in simple words.">💡 <span>Explain AI simply</span></button><button class="suggestion" type="button" data-prompt="Give me 5 tips to prepare for an exam.">📚 <span>Study tips</span></button><button class="suggestion" type="button" data-prompt="Write a short introduction about me for a presentation.">✍️ <span>Help me write</span></button><button class="suggestion" type="button" data-prompt="What are some beginner-friendly Python project ideas?">🐍 <span>Python project ideas</span></button></div>';
  conversation.appendChild(welcomeCard);
  welcomeCard.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => sendMessage(button.dataset.prompt || ""));
  });
  input.focus();
});
