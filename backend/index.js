import express from "express"
import cors from 'cors'
import cookieParser from "cookie-parser"
import multer from "multer"
import authRoutes from "./routes/AuthRoute.js"
import contactsRoutes from "./routes/ContactRoute.js"
import setupSocket from "./socket.js"
import messageRoutes from "./routes/MessagesRoute.js"

const app = express()
const port = process.env.PORT


app.use(cors({
   origin: 'http://localhost:3000',
   credentials: true
}))

app.use("/uploads/profiles", express.static("uploads/profiles"))
app.use("/uploads/files", express.static("uploads/files"))
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/contacts", contactsRoutes)
app.use("/api/messages", messageRoutes)


const server = app.listen(port, () => {
                    console.log(`App started on port ${port}`)
                 })

setupSocket(server)