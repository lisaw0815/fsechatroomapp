const socket = io();

socket.emit('fetchMessages');

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

const currentUser = getCookie('username');

socket.on('existingMessages', (messages) => {
  const chatBox = document.getElementById('chatBox');
  chatBox.innerHTML = ''; 

  messages.forEach((message) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Invalid date';
    const content = message.message || 'No content available';

    const displayName = (message.username === currentUser) ? 'Me' : message.username;

    messageElement.innerHTML = `
      <strong>${displayName}</strong>
      <span class="timestamp">${timestamp}</span>
      <p>${content}</p>
    `;

    chatBox.appendChild(messageElement);
  });
});


// Send a new message to the server
document.querySelector('.input-box').addEventListener('submit', function (e) {
  e.preventDefault();

  const messageInput = document.querySelector('input[name="message"]');
  const message = messageInput.value;

  const username = getCookie('username');


  socket.emit('newMessage', {
    username: username || 'user1',
    content: message
  });

  messageInput.value = ''; 
});


socket.on('broadcastMessage', (message) => {
  const chatBox = document.getElementById('chatBox');
  const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const timestamp = message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Invalid date';
    const content = message.message;

    const displayName = (message.username === currentUser) ? 'Me' : message.username;

    messageElement.innerHTML = `
      <strong>${displayName}</strong>
      <span class="timestamp">${timestamp}</span>
      <p>${content}</p>
    `;

    chatBox.appendChild(messageElement);
});
