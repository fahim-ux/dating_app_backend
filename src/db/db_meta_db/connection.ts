import { PrismaClient } from "@prisma/client";


// const prisma = new PrismaClient();

export async function InsertUser(prisma:PrismaClient,user:{name:string, email:string}) {
    try {
        const new_user = await prisma.user.create({
            data: user,
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

export async function findAllUsers(prisma:PrismaClient) {
    const users = await prisma.user.findMany()
    console.log("All users:", users);
}