import { PrismaClient } from "@prisma/client";
import { Socket } from "socket.io";

// const prisma = new PrismaClient();

export async function CreateUser(prisma:PrismaClient,user:{phone_number:string,user_name:string,profile_picture:string,is_online:boolean}) {
    try {
        const new_user = await prisma.user.create({
            data: {
                phone_number: user.phone_number,
                username: user.user_name,
                profile_picture: user.profile_picture,
                is_online: user.is_online,
            },
        });
        console.log("User created:", new_user);
    } catch (error: any) {
        if (error.code === 'P2002') {
            console.error("Error: A user with this email already exists.");
        } else {
            console.error("Error creating user:", error);
        }
    }
}

export async function findAllUsers(prisma: PrismaClient) {
    const users = await prisma.user.findMany({
        select: {
            username: true,
            phone_number: true,
            profile_picture: true,
            is_online: true,
            last_seen: true,
        }
    });
    // console.log("All users:", users);
    return users;
}


export async function update_status(prisma:PrismaClient,phn_no:string,status:boolean) {
    // setData(redis, phn_no, status?"online":"offline", 60).then(() => {
    //     console.log("Data saved in Redis Confirmed");});
    const user = await prisma.user.update({
        where: { phone_number: phn_no },
        data: { is_online: status },
    });
    console.log("User status updated:", user);
}

export async function find_User_Id  (prisma:PrismaClient,phn_no:string)  {
    const user = await prisma.user.findUnique({
        where: { phone_number: phn_no },
    });
    console.log("User found:", user);
    return user?.user_id;
}

export async function verify_user  (prisma:PrismaClient,data:{phone_number:string})  {
    const user = await prisma.user.findUnique({
        where: { phone_number: data.phone_number },
        select:{
            username:true,
            last_seen:true,
            is_online:true,
            profile_picture:true
        }
    });
    console.log("User found:", user);
    return  user;
}


export async function create_session  (prisma:PrismaClient,user_id:string,session_id:string,device_id:string,ipAddress:string,userAgent:string)  {
    try{
        await prisma.session.create({
            data:{
                session_id:session_id,
                user_id:user_id,
                device_id:device_id,
                ip_address:ipAddress,
                user_agent:userAgent
            }
        });
        console.log("Session created for user:", user_id);
    }
    catch(error){
        console.error("Error creating session:", error);
    }

}
export async function update_session(prisma: PrismaClient, user_id: string, session_id: string) {
    console.log("Updating session for socket id :", session_id);
    try {

        const exist_session = await prisma.session.findFirst({
            where: {
                user_id: user_id,
            },
        });

        if(!exist_session){
            console.log("Session not found for user:", user_id);
            return;
        }


        await prisma.session.update({
            where: {
                session_id:exist_session.session_id, // Ensure session_id is unique
            },
            data: {
                last_activity: new Date(),
                is_online: false,
            },
        });
        console.log("Session updated for user:", user_id);
    } catch (error) {
        console.error("Error updating session:", error);
    }
}