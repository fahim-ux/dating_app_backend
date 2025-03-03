let socket;
let currentRecipient = "";
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const allUsersDiv = document.getElementById("all-users");
const chatWithSpan = document.getElementById("chat-with");

// Create typing indicator element
const typingIndicator = document.createElement("div");
typingIndicator.id = "typingIndicator";
messagesDiv.appendChild(typingIndicator);

let typingTimeout;

messageInput.addEventListener("input", () => {
  const sender = document.getElementById("joinId").value.trim();
  if (!currentRecipient) return;
  socket.emit("typing", { sender, recipient: currentRecipient });
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopped_typing", { sender, recipient: currentRecipient });
  }, 3000);
});

function joinChat() {
  const joinId = document.getElementById("joinId").value.trim();
  if (!joinId) {
    document.getElementById("error-message").textContent = "Please enter an ID";
    return;
  }
  document.getElementById("join-section").style.display = "none";
  document.getElementById("main-chat").style.display = "block";
  socket = io("http://localhost:3000");

  socket.on("connect", () => {
    socket.emit("user_connected", { phn: joinId });
  });
  // socket.on("chat_history", (history) => {
  //   messagesDiv.innerHTML = "";
  //   history.forEach((msg) => displayMessage(msg));
  // });
  // socket.on("receive_message", (msg) => {
  //   displayMessage(msg);
  //   // Once a message is received, immediately acknowledge delivery.
  //   const sender = msg.sender;
  //   const recipient = document.getElementById("joinId").value.trim();
  //   // Only acknowledge if this client is the recipient.
  //   if (recipient === currentRecipient) {
  //     socket.emit("message_delivered", { messageId: msg.id, sender, recipient });
  //   }
  // });
  // socket.on("message_status_update", (data) => {
  //   // data: { messageId, status }
  //   // Update the corresponding message in the UI.
  //   const messageEl = document.getElementById(data.messageId);
  //   if (messageEl) {
  //     // For demonstration, append the status text.
  //     let statusEl = messageEl.querySelector(".status");
  //     if (!statusEl) {
  //       statusEl = document.createElement("span");
  //       statusEl.className = "status";
  //       statusEl.style.marginLeft = "10px";
  //       messageEl.appendChild(statusEl);
  //     }
  //     statusEl.textContent = `(${data.status})`;
  //   }
  // });
  // socket.on("user_typing", (data) => {
  //   const joinId = document.getElementById("joinId").value.trim();
  //   if (data.sender !== joinId) {
  //     typingIndicator.textContent = `${data.sender} is typing...`;
  //   }
  // });
  // socket.on("user_stopped_typing", () => {
  //   typingIndicator.textContent = "";
  // });
  // socket.on("all_users", (users) => {
  //   updateAllUsers(users);
  // });
  // socket.on("user_status", ({phn_no,is_online}) => {
  //   if (data.online) {
  //     chatWithSpan.textContent = `Chat with ${data.userId} (Online)`;
  //   } else {
  //     chatWithSpan.textContent = `Chat with ${data.userId} (Last seen: ${data.lastSeen})`;
  //   }
  // });
}

//   function updateAllUsers(users) {
//     allUsersDiv.innerHTML = "";
//     const myId = document.getElementById("joinId").value.trim();
//     users.forEach((user) => {
//       if (user === myId) return;
//       const userDiv = document.createElement("div");
//       userDiv.className = "user-item";
//       userDiv.innerHTML = `<span>${user}</span>`;
//       const connectBtn = document.createElement("button");
//       connectBtn.textContent = "Connect";
//       connectBtn.onclick = () => {
//         connectToUser(user);
//       };
//       userDiv.appendChild(connectBtn);
//       allUsersDiv.appendChild(userDiv);
//     });
//   }

//   function connectToUser(user) {
//     currentRecipient = user;
//     chatWithSpan.textContent = `Chat with ${user}`;
//     const myId = document.getElementById("joinId").value.trim();
//     socket.emit("join_room", { user1: myId, user2: user });
//     messagesDiv.innerHTML = "";
//     const roomNotification = document.createElement("div");
//     roomNotification.textContent = `You have joined a room with ${user}`;
//     roomNotification.style.color = "blue";
//     messagesDiv.appendChild(roomNotification);
//     socket.emit("fetch_chat_history", { user1: myId, user2: user });
//     // Request the current status of the selected user.
//     socket.emit("get_status", { userId: user });
//   }

//   function sendMessage() {
//     const sender = document.getElementById("joinId").value.trim();
//     if (!currentRecipient) {
//       alert("Please select a user to chat with");
//       return;
//     }
//     const text = messageInput.value.trim();
//     const messageId = Date.now().toString();
//     const conversation_id  = sender + currentRecipient;
//     const created_at = new Date().toISOString();
//     const message = { conversation_id,created_at,sender, currentRecipient, text };
//     if (text) {
//       socket.emit("send_message", message);
//       displayMessage({ sender, text, id: messageId, status: "sent" });
//       messageInput.value = "";
//     }
//   }

//   function displayMessage(msg) {
//     const messageElement = document.createElement("div");
//     messageElement.id = msg.id;
//     messageElement.className = "message " +
//       (msg.sender === document.getElementById("joinId").value.trim() ? "sent" : "received");
//     messageElement.innerHTML = `<strong>${msg.sender}:</strong> ${msg.text}`;
//     // Optionally display the status if available.
//     if (msg.status) {
//       const statusEl = document.createElement("span");
//       statusEl.className = "status";
//       statusEl.style.marginLeft = "10px";
//       statusEl.textContent = `(${msg.status})`;
//       messageElement.appendChild(statusEl);
//     }
//     messagesDiv.appendChild(messageElement);
//     messagesDiv.scrollTop = messagesDiv.scrollHeight;
//   }
