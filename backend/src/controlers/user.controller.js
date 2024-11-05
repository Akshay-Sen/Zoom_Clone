import { User } from "../models/user.model.js";
import httpStatus from "http-status"
import bcrypt, { hash } from "bcrypt"
import crypto from "crypto"
import { Meeting } from "../models/meeting.model.js";




const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ meassage: "Pease Provide!" })
    }

    try {
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ meassage: "User not found!" })
        }
        let isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (isPasswordCorrect) {
            // let token = crypto.randomBytes(20).toString("hex")
            let token = crypto.randomBytes(20).toString("hex")
            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" })
        }
    } catch (err) {
        return res.status(500).json({ message: `Something went wrong ${err}` })
    }
}

const register = async (req, res) => {
    const { name, username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username })
        if (existingUser) {
            return res.status(httpStatus.FOUND).json({ message: "User Already exist" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        })

        await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "User Registerd!" })

    } catch (err) {
        res.json({ message: `Something went wrong ${err}` })
    }
}

const getUserHistory = async(req,res)=>{
    const {token} = req.query;
    try {
        const user = await User.findOne({token:token});
        const meetings = await Meeting.findOne({user_id:user.username})
        res.json(meetings)
    } catch (err) {
        res.json(`Something went wrong ${err}`)
    }
}

const addToHistory = async(req,res)=>{
    const {token, meeting_code} = req.body

    try {
        const user = await User.findOne({token : token})
        const newMeeting = new Meeting({
            user_id :user.username ,
            meeting_code : meeting_code
        })
        await newMeeting.save();
        res.status(httpStatus.CREATED).json({message : "Added code to  history"})
    } catch (err) {
        res.json(`Something wont wrong ${err}`)
    }
}

export { register, login,getUserHistory,addToHistory };


