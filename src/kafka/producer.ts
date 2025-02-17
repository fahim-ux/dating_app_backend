import {producer} from './kafka';

export async function sendMsgToKafka(topic: string, msg: string) {
    await producer.send({
        topic,
        messages: [
            { value: msg }
        ]
    });
    console.log("Kafka Producer: <Message sent to Kafka>");
}