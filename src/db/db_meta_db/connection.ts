import { PrismaClient } from "@prisma/client";
import { setData } from "../db_cache_db/connection";
import { Redis } from "@upstash/redis";
import { lastSeen } from "../../utils/onlineUsers";

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