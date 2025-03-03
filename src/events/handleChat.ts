//  Handles fetching chat history, deleting messages, and clearing chats.
import { Socket, Server } from "socket.io";
import { onlineUsers, lastSeen } from "../utils/onlineUsers";
import { sendMsgToKafka } from "../kafka/producer";
import { Message } from "../models/Message";


async function send_msg_to_kafka(msg: string) {
    await sendMsgToKafka("chat-messages", msg);
}

export default function handleChat(io: Server, socket: Socket) {

    socket.on("send_message", (message: Message) => {
        console.log(`User {${message.sender_id}} sent a message to {${message.receiver_id}}: ${message.message_text}`);
        send_msg_to_kafka(JSON.stringify(message));
    }); //done

    // socket.on("get_all_users", () => {
    //     console.log("All users requested by client");
    
    //     fetch("http://localhost:3000/api/users") // Ensure the correct port
    //         .then((response) => {
    //             if (!response.ok) {
    //                 throw new Error(`HTTP error! Status: ${response.status}`);
    //             }
    //             return response.json();
    //         })
    //         .then((data) => {
    //             socket.emit("all_users", data);
    //         })
    //         .catch((error) => {
    //             console.error("Error fetching users:", error);
    //         });
    // });
    // socket.on('typing', ({ sender, recipient }) => {
    //     console.log("User Typing triggered");
    //     const recipientSocket = onlineUsers.get(recipient);
    //     console.log("Recipient Socket", recipientSocket);
    //     if (recipientSocket) {
    //         console.log("Emitting user_typing event to recipient");
    //         io.to(recipientSocket).emit('user_typing', { sender });
    //     }
    // });

    // Handle stopped typing event
    // socket.on('stopped_typing', ({ sender, recipient }) => {
    //     const recipientSocket = onlineUsers.get(recipient);
    //     if (recipientSocket) {
    //         io.to(recipientSocket).emit('user_stopped_typing', { sender });
    //     }
    // });

    socket.on("join_room", ({ user1, user2 }) => {
        const room = [user1, user2].sort().join("_"); // Unique room name
        socket.join(room);
        console.log(`${user1} and ${user2} joined room: ${room}`);
        io.to(room).emit("room_joined", { room });
    });

    // socket.on("get_last_seen", (data: { userId: string }) => {
    //     const { userId } = data;
    //     socket.emit("last_seen", { userId, lastSeen: lastSeen.get(userId) });
    // });

    // socket.on("get_status", (data: { userId: string }) => {
    //     const { userId } = data;
    //     const isOnline = onlineUsers.has(userId);
    //     const status = {
    //         userId,
    //         online: isOnline,
    //         lastSeen: isOnline ? null : lastSeen.get(userId) || "Never",
    //     };
    //     // Respond to the requesting socket.
    //     socket.emit("user_status", status);
    // });

    // When the recipient confirms that the message is delivered:
    // socket.on("message_delivered", (data: { messageId: string; sender: string; recipient: string }) => {
    //     const { messageId, sender, recipient } = data;
    //     // Notify sender that message is delivered.
    //     const senderSocketId = onlineUsers.get(sender);
    //     if (senderSocketId) {
    //         io.to(senderSocketId).emit("message_status_update", { messageId, status: "delivered" });
    //         console.log(`Message ${messageId} marked as delivered.`);
    //     }
    // });

    // When the recipient marks a message as read:
    // socket.on("message_read", (data: { messageId: string; sender: string; recipient: string }) => {
    //     const { messageId, sender, recipient } = data;
    //     // Notify sender that message is read.
    //     const senderSocketId = onlineUsers.get(sender);
    //     if (senderSocketId) {
    //         io.to(senderSocketId).emit("message_status_update", { messageId, status: "read" });
    //         console.log(`Message ${messageId} marked as read.`);
    //     }
    // });
}