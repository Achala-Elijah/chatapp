import db from "../models/model.js";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import fs from 'fs'

const maxAge = 3 * 24 * 60 * 60 * 1000
const salt = 10


//Sign token
const signToken = (email, userId) => {
    return jwt.sign({email, userId}, process.env.JWT_KEY, {expiresIn: maxAge})
}


//Signup controller
export const signup = async (req, res) => {
    try{
        const {email, password} = req.body
        const hashedPassword = await bcrypt.hash(password, salt)

        if(!email || !password){
            return res.status(400).send("Email and Password is required")
        }

        const user = await db.user.create({
            data: {email, password: hashedPassword}
        })

        return res.cookie("jwt", signToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None"
        }).status(201).json({
            id: user.id,
            email,
            profileSetup: user.profileSetup
        })

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}



//Login controller
export const login = async (req, res) => {
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).send("Email and Password is required")
        }

        const user = await db.user.findUnique({
            where: {email}
        })

        if(!user){
            return res.status(404).send("User not found")
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if(!isPasswordCorrect){
            return res.status(400).send("Password is incorrect.")
        }

        return res.cookie("jwt", signToken(email, user.id), {
            maxAge,
            secure: true,
            sameSite: "None"
        }).status(200).json({
            id: user.id,
            email,
            profileSetup: user.profileSetup,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            color: user.color
        })

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}





//Get user info controller
export const getUserInfo = async (req, res) => {
    try{
        const userData = await db.user.findUnique({
            where:{
                id: req.userId
            }
        })

        if(!userData) {
            return res.status(404).send("User with given id not found!")
        }

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color
        })

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}






//Update profile
export const updateProfile = async (req, res) => {
    try{
        const userId = req.userId
        const {firstName, lastName, color} = req.body
        console.log("values", firstName, lastName, color)

        if(!firstName || !lastName || color === undefined) {
            return res.status(400).send("Firstname lastname and color is required.")
        }

        const userData = await db.user.update({
            where: {
                id: userId
            },
            data: {
                firstName,
                lastName,
                color,
                profileSetup: true
            }
        })

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color
        })

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}





//Add profile image 
export const addProfileImage = async (req, res) => {
    try{
        if(!req.file){
            return res.status(400).send("File is required")
        }

        const updatedUser = await db.user.update({
            where: {
                id: req.userId
            },
            data: {
                image: req.file.path
            }
        })
        

        return res.status(200).json({
            image: updatedUser.image,
         })

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}







//Remove profile image
export const removeProfileImage = async (req, res) => {
    try{
        const userId = req.userId

        const user = await db.user.findUnique({
            where: {
                id: userId
            }
        })

        if(!user){
            return res.status(404).send("User not found")
        }

        if(user.image){
            console.log(user.image)
            fs.unlinkSync(user.image, () => {})
        }

        const updatedUser = await db.user.update({
            where: {
                id: user.id
            },
            data: {
                image: null
            }
        })

        return res.status(200).send("Profile image removed successfully")

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}





//Remove profile image
export const logout = async (req, res) => {
    try{
        res.cookie("jwt", "", {maxAge: 1, secure:true, sameSite: "None"})
        return res.status(200).send("Logout Successfull")

    }catch(e){
        console.log(e)
        return res.status(500).send("Internal Server Error!")
    }
}

