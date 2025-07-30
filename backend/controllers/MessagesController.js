import db from "../models/model.js";



export const getMessages = async (req, res) => {
    try{
        const user1 = req.userId
        const user2 = req.body.id


        if(!user1 || !user2){
            return res.status(400).send("Both user ID's are required!")
        }

        const messages = await db.message.findMany({
            where: {
                OR: [
                    {
                        AND: [
                            {senderId: user1},
                            {recipientId: user2}
                        ]
                    },
                    {
                        AND: [
                            {senderId: user2},
                            {recipientId: user1}
                        ]
                    }
                ]
            },
        orderBy: {
            timestamp: 'asc'
            }
        })
        
        return res.status(200).json({messages})

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}









export const uploadFile = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).send("File is required!")
        }
        console.log("filePath:", req.file.path)
        return res.status(200).json({filePath: req.file.path})
    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}
