import { marked } from "marked";
import DOMPurify from "dompurify";
import { autoResizeTextarea, setLoading } from "./utils.js";

const giftForm = document.getElementById("gift-form");
const userInput = document.getElementById("user-input");
const outputContent = document.getElementById("output-content");

let currentAbortController = null;

function start() {
  userInput.addEventListener("input", () => autoResizeTextarea(userInput));
  giftForm.addEventListener("submit", handleGiftRequest);
}

async function handleGiftRequest(e) {
  e.preventDefault();

  const userPrompt = userInput.value.trim();
  if (!userPrompt) return;

  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  const signal = currentAbortController.signal;

  setLoading(true);

  try {
    const response = await fetch("/api/gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userPrompt }),
      signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    const giftSuggestions = data.giftSuggestions;
    if (typeof giftSuggestions !== "string" || !giftSuggestions.trim()) {
      outputContent.textContent =
        "No suggestions came back. Please try again with a different prompt.";
      return;
    }

    const html = marked.parse(giftSuggestions);
    const safeHTML = DOMPurify.sanitize(html);
    outputContent.innerHTML = safeHTML;
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }
    console.error(error);
    outputContent.textContent =
      "Sorry, I can't access what I need right now. Please try again in a bit.";
  } finally {
    currentAbortController = null;
    setLoading(false);
  }
}

start();
