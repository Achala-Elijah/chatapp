import db from "../models/model.js";




export const createChannel = async (req, res) => {
    try{
        const {name, members} = req.body
        const userId = req.userId

        const admin = await db.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!admin){
            return res.status(400).send("Admin user not found.")
        }

        const validMembers = await db.user.findMany({
            where:{
                id:{
                    in: members
                }
            }
        })

        if(validMembers.length !== members.length){
            return res.status(400).send("Some members are not valid users.")
        }

        const newChannel = await db.channel.create({
            data:{
                name,
                members:{
                    connect: members.map(id => ({id}))
                },
                adminId: userId
            },
            include: { 
                members: true, 
                admin: true 
            }
        })

        return res.status(201).json({channel: newChannel})
    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}




export const getUserChannels = async (req, res) => {
    try{
        const userId = req.userId

        const channels = await db.channel.findMany({
            where: {
                OR: [
                    {admin: { id: userId }},
                    {members: {
                        some: {id: userId}
                    }}
                ]
            },
            include: {
                members: true,
                admin: true
              },
              orderBy: {
                updatedAt: 'desc'
              }
        })

        return res.status(201).json({channels})
    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}




export const getChannelMessages = async (req, res) => {
    try{
        const channelId = parseInt(req.params.channelId)
        const channel = await db.channel.findUnique({
            where: { id: channelId },
            include: {
              messages: {
                include: {
                  sender: {
                    select: {
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      image: true,
                      color: true,
                    },
                  },
                },
              },
            },
          });

          if(!channel){
            return res.status(404).send("Channel not found.")
          }

          const messages = channel.messages
         
        return res.status(201).json({messages})
    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}