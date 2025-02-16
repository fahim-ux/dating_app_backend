//  Handles fetching chat history, deleting messages, and clearing chats.
import { Socket, Server } from "socket.io";
import { onlineUsers, lastSeen } from "../utils/onlineUsers";

const chatHistory: { [key: string]: { sender: string; text: string; id: string }[] } = {};

export default function handleChat(io: Server, socket: Socket) {

    // console.log("Chathistory", chatHistory)
    console.log("Online Users", onlineUsers)
    socket.on("fetch_chat_history", ({ user1, user2 }) => {
        const chatKey = [user1, user2].sort().join("-");
        console.log("Fetch - msg : ChatKey -- ", chatKey);
        console.log("Fetch - msg : ChatHistory -- ", chatHistory[chatKey]);
        socket.emit("chat_history", chatHistory[chatKey] || []);
    });

    socket.on("send_message", ({ sender, recipient, text, messageId }) => {
        const chatKey = [sender, recipient].sort().join("-");
        console.log(`User {${sender}} sent a message to {${recipient}}: ${text}`);
        console.log("Send - msg : ChatKey -- ", chatKey);

        if (!chatHistory[chatKey]) chatHistory[chatKey] = [];
        chatHistory[chatKey].push({ sender, text, id: messageId });
        console.log("Send - msg : ChatHistory -- ", chatHistory[chatKey]);
        console.log("Online Users", onlineUsers)
        const recipientSocket = onlineUsers.get(recipient);
        if (recipientSocket) {
            console.log("User is online, sending message to recipient");
            io.to(recipientSocket).emit("receive_message", { sender, text, id: messageId ,status:'sent'});
        }
    });

    socket.on("delete_message", ({ user1, user2, messageId }) => {
        const chatKey = [user1, user2].sort().join("-");
        if (chatHistory[chatKey]) {
            chatHistory[chatKey] = chatHistory[chatKey].filter(msg => msg.id !== messageId);
        }
        socket.emit("message_deleted", { messageId });
    });

    socket.on('typing', ({ sender, recipient }) => {
        console.log("User Typing triggered");
        const recipientSocket = onlineUsers.get(recipient);
        console.log("Recipient Socket", recipientSocket);
        if (recipientSocket) {
            console.log("Emitting user_typing event to recipient");
            io.to(recipientSocket).emit('user_typing', { sender });
        }
    });

    // Handle stopped typing event
    socket.on('stopped_typing', ({ sender, recipient }) => {
        const recipientSocket = onlineUsers.get(recipient);
        if (recipientSocket) {
            io.to(recipientSocket).emit('user_stopped_typing', { sender });
        }
    });

    socket.on("join_room", ({ user1, user2 }) => {
        const room = [user1, user2].sort().join("_"); // Unique room name
        socket.join(room);
        console.log(`${user1} and ${user2} joined room: ${room}`);
        io.to(room).emit("room_joined", { room });
    });
    socket.on("get_last_seen", (data: { userId: string }) => {
        const { userId } = data;
        socket.emit("last_seen", { userId, lastSeen: lastSeen.get(userId) });
    });

    socket.on("get_status", (data: { userId: string }) => {
        const { userId } = data;
        const isOnline = onlineUsers.has(userId);
        const status = {
            userId,
            online: isOnline,
            lastSeen: isOnline ? null : lastSeen.get(userId) || "Never",
        };
        // Respond to the requesting socket.
        socket.emit("user_status", status);
    });

     // When the recipient confirms that the message is delivered:
    socket.on("message_delivered", (data: { messageId: string; sender: string; recipient: string }) => {
        const { messageId, sender, recipient } = data;
        // Notify sender that message is delivered.
        const senderSocketId = onlineUsers.get(sender);
        if (senderSocketId) {
        io.to(senderSocketId).emit("message_status_update", { messageId, status: "delivered" });
        console.log(`Message ${messageId} marked as delivered.`);
        }
    });

    // When the recipient marks a message as read:
    socket.on("message_read", (data: { messageId: string; sender: string; recipient: string }) => {
        const { messageId, sender, recipient } = data;
        // Notify sender that message is read.
        const senderSocketId = onlineUsers.get(sender);
        if (senderSocketId) {
        io.to(senderSocketId).emit("message_status_update", { messageId, status: "read" });
        console.log(`Message ${messageId} marked as read.`);
        }
    });

}