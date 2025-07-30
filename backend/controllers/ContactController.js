import db from "../models/model.js";


async function getContactsPostgres(userId) { // userId is a number (Int) in PostgreSQL
  // 1. Fetch messages where the current user is involved, ordered by timestamp descending.
  const messages = await db.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { recipientId: userId },
      ],
    },
    orderBy: {
      timestamp: 'desc', // Get the latest messages first
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          color: true,
        },
      },
      recipient: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          image: true,
          color: true,
        },
      },
    },
  });

  // 2. Process messages in application to find unique conversations and their last message.
  //    This simulates the $group logic from Mongoose.
  const conversations = new Map(); // No generic types in pure JS

  for (const message of messages) {
    const otherUserId = message.senderId === userId ? message.recipientId : message.senderId;
    // Create a consistent key for the conversation (e.g., "1-5" or "5-1" for users 1 and 5)
    // Ensure the smaller ID comes first for consistent keying.
    const conversationKey = [userId, otherUserId].sort((a, b) => a - b).join('-');

    if (!conversations.has(conversationKey)) {
      const contactInfo = message.senderId === userId ? message.recipient : message.sender;

      if (contactInfo) { // Ensure contactInfo is not null
        conversations.set(conversationKey, {
          id: contactInfo.id, // The contact's ID (which was _id in Mongoose)
          lastMessageTime: message.timestamp,
          email: contactInfo.email,
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          image: contactInfo.image,
          color: contactInfo.color,
        });
      }
    }
  }

  // Convert the map values to an array
  let contacts = Array.from(conversations.values());

  // Final sort by lastMessageTime descending, mimicking the Mongoose `$sort`
  contacts.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());

  return contacts;
}










export const searchContacts = async (req, res) => {
    try{
        const {searchTerm} = req.body

        if(searchTerm === undefined || searchTerm === null){
            return res.status(400).send("searchTerm is required!")
        }

        const sanitizedSearchTerm = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
            )

        const regex = new RegExp(sanitizedSearchTerm, "i")

        const contacts = await db.user.findMany({
            where: {
                NOT: {
                    id: req.userId
                },
                OR: [
                    { firstName: { contains: searchTerm, mode: "insensitive" } },
                    { lastName: { contains: searchTerm, mode: "insensitive" } },
                    { email: { contains: searchTerm, mode: "insensitive" } }
                  ]
            }
        })
        return res.status(200).json({contacts})

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}






export const getContactsForDMList = async (req, res) => {
    try{
        let {userId} = req
        
        const contacts = await getContactsPostgres(userId)

        return res.status(200).json({contacts})

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}

