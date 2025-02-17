import { consumer } from "./kafka"
import { io } from "../index";
import { onlineUsers } from "../utils/onlineUsers";


export async function startKafkaConsumer(){
    console.log("Kafka Consumer: Starting....");
    consumer.on('consumer.crash', (error) => {
        console.error('Kafka consumer crashed', error);
    });
    await consumer.subscribe({topic:"chat-messages",fromBeginning:true});
    await consumer.run({
        eachMessage:async ({topic,partition,message})=>{
            const receivedMessage = message.value?.toString()
            console.log(`📥 Received from Kafka: ${receivedMessage}`);
            // io.emit("message", JSON.parse(receivedMessage));
            // send these messages to clients with socket.io
            if(!receivedMessage) return;
            const { sender, recipient, text, id: messageId } = JSON.parse(receivedMessage);
            const recipientSocket = onlineUsers.get(recipient);
            if(recipientSocket){
                io.to([recipientSocket]).emit("receive_message", { sender, text, id: messageId ,status:'sent'});
                console.log("Kafka Consumer: Message sent to recipient");
            }            
        }
    })
}

// startKafkaConsumer().catch(console.error);