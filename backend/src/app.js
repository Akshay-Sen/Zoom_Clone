import express from "express"
import mongoose from "mongoose"
import {createServer} from "node:http"
import cors from "cors"
import { connectToSocket } from "./controlers/socketManager.js"
import userRoutes from "./routes/users.routes.js"


const app = express()
const server = createServer(app)
const io = connectToSocket(server)

app.use(cors());
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}))
app.use("/api/v1/users",userRoutes)

app.set("port", (process.env.PORT || 3000))

// app.get("/",(req,res)=>{
//     res.send("Jai Shree Ram")
// })

main()
.then(()=>{
    console.log("DB Connected!!")
})
.catch((err)=>{
    console.log(err)
})

async function main(){
   await mongoose.connect("mongodb+srv://akshaysen6150:zoom123@zoom.yc7ni.mongodb.net/zoom?retryWrites=true&w=majority&appName=zoom")
}

server.listen(app.get("port"),()=>{
    console.log(`App is listening on port ${app.get("port")} `)
})
