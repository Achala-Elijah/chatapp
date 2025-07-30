import { Server } from "socket.io"
import db from "./models/model.js"

const setupServer = (server) => {
    const io = new Server(server, {
        cors: {
               origin: process.env.ORIGIN,
               methods: ["GET", "POST"],
               credentials: true
           }
      });

    const userSocketMap = new Map()

    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id}`)
        for(const[userId, socketId] of userSocketMap.entries()){
            if(socketId === socket.id){
                userSocketMap.delete(userId)
                break;
            }
        }
    }


    const sendMessage = async (message) => {
        const senderSocketId = userSocketMap.get(message.sender)
        const recipientSocketId = userSocketMap.get(message.recipient)
        const{sender, recipient, ...rest} = message

        const createdMessage = await db.message.create({data: {
            ...rest,
            senderId: sender,
            recipientId: recipient
        }})

        const messageData = await db.message.findUnique({
            where: {id: createdMessage.id},
            include: {
                sender: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        image: true,
                        color: true
                    }
                },
                recipient: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            image: true,
                            color: true
                        }
                }
            }
        })

        if(recipientSocketId){
            io.to(recipientSocketId).emit("receiveMessage", messageData)
        }
        if(senderSocketId){
            io.to(senderSocketId).emit("receiveMessage", messageData)
        }
    }




    
    io.on("connection", (socket) => {
        const userId = Number(socket.handshake.query.userId)

        if(userId){
            userSocketMap.set(userId, socket.id)
            console.log(`User connected: ${userId} with socket ID: ${socket.id}`)
        }else{
            console.log("User ID not provided during connection.")
        }

        socket.on("sendMessage", sendMessage)

        socket.on("disconnect", () => disconnect(socket))
    })


}

export default setupServer