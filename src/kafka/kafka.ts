import { triggerAsyncId } from "async_hooks";
import { Kafka } from "kafkajs";

export const kafka =  new Kafka({
    clientId:"dating-app-backend",
    brokers:["localhost:9092"]
})

export const producer = kafka.producer();
export const consumer = kafka.consumer({groupId:"chat-group"});

export async function connectKafka(){
    await producer.connect();
    try{
        await consumer.connect();
    }
    catch(e){
        console.log("Consmuer Could not connect: ",e);
    }
    
    console.log("Kafka connected 🤖.....");
}