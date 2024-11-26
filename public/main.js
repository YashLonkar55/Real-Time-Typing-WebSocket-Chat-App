const socket = io();

const clientsTotal = document.getElementById('client-total');
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

const messageTone = new Audio('/message-tone.mp3');

// Event listener for form submission
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Display total clients connected
socket.on('clients-total', (data) => {
  clientsTotal.innerText = `Total Clients: ${data}`;
});

// Send message function
function sendMessage() {
  if (messageInput.value === '') return;

  const data = {
    name: nameInput.value || 'Anonymous',
    message: messageInput.value,
    dateTime: new Date(),
  };
  socket.emit('message', data);
  addMessageToUI(true, data);
  messageInput.value = '';
}

// Receive and display chat messages
socket.on('chat-message', (data) => {
  messageTone.play();
  addMessageToUI(false, data);
});

// Add messages to UI
function addMessageToUI(isOwnMessage, data) {
  clearFeedback(); // Clear typing feedback
  const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${moment(data.dateTime).fromNow()}</span>
          </p>
      </li>`;
  messageContainer.innerHTML += element;
  scrollToBottom();
}

// Scroll to bottom for new messages
function scrollToBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Emit real-time typing updates
messageInput.addEventListener('input', () => {
  socket.emit('live-typing', {
    name: nameInput.value || 'Anonymous',
    typingText: messageInput.value,
  });
});

// Listen for real-time typing updates
socket.on('live-typing', (data) => {
  showLiveTyping(data);
});

// Display live typing feedback
function showLiveTyping(data) {
  clearFeedback(); // Clear existing feedback
  if (data.typingText === '') return; // If no text, do not show feedback

  const element = `
    <li class="message-feedback">
      <p class="feedback" id="feedback">${data.name} is typing: <strong>${data.typingText}</strong></p>
    </li>`;
  messageContainer.innerHTML += element;
  scrollToBottom();
}

// Clear typing feedback
function clearFeedback() {
  document.querySelectorAll('li.message-feedback').forEach((element) => {
    element.parentNode.removeChild(element);
  });
}
