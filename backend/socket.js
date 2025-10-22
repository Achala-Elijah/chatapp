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


    const sendChannelMessage = async(message)=>{
        const {channelId, senderId, content, messageType, fileUrl} = message

        const createdMessage = await db.message.create({
            data: {
                // senderId,
                recipient: undefined,
                content,
                messageType,
                fileUrl,
                sender: {connect: {id: senderId}},
                // channelId,
                channel: {connect: {id: channelId}}
            },
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
                }
              }

        })

        
  const channel = await db.channel.findUnique({
    where: { id: channelId },
    include: {
        members: true,
        admin: true
    }
  });

  // 3️⃣ Combine message and channel info
  const finalData = { ...createdMessage, channelId: channel.id };

  if(channel && channel.members){
    channel.members.forEach((member) => {
        const memberSocketId = userSocketMap.get(member.id)
        if(memberSocketId){
            io.to(memberSocketId).emit("recieve-channel-message", finalData)
        }
    })
    const adminSocketId = userSocketMap.get(channel.admin.id)
    console.log("socketId: ", adminSocketId)
    if(adminSocketId){
        io.to(adminSocketId).emit("recieve-channel-message", finalData)
    }
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
        socket.on("send-channel-message", sendChannelMessage)

        socket.on("disconnect", () => disconnect(socket))
    })


}

export default setupServer