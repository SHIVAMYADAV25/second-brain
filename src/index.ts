// src/server.ts
import express from 'express';
import { connectDB } from './db.js';
import { User } from './model.js';
import jwt from "jsonwebtoken"

const app = express();
const port = 3000;

app.use(express.json());

app.post('/api/v1/signup',async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    if(
        [username,password].some((field)=>field?.trim === "")
    ){
        res.status(400).json({
            message: "All fields are required"
        })
    }

    const exitUser = await User.findOne({
        $or: [{username}]
    })

    if(exitUser){
        res.status(411).json({
            message: "User already exists"
        })
    }

    const user = await User.create({
        username:username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password"
    )

    if(!createdUser){
        res.status(500)
            .json({
                message : "Something went wrong while registering the user" 
            })
    }

    res.status(200)
            .json({
                message : "User created successfully"
            })
});

app.post('/api/v1/signin',async (req, res) => {
    const {username,password} = req.body;

    const existingUser = await User.findOne({
        username,
        password
    })

    if(existingUser){

        const token = jwt.sign({
            id:existingUser._id},"ssh");

        res.status(200)
            .json({
                token
            })
    }else{
        res.status(403)
            .json({
                message : "Incorrect credentials"
            })
    }
});

app.post('/api/v1/content', (req, res) => {
    // connect middleware
    //take data
    // save in mongo db
    // send response
});

app.get('/api/v1/content', (req, res) => {
    //get all the data of that user 
    // and the user ID will be in middleware
});

app.delete("/api/v1/content",(res,req) => {
    // get the content ID of that content
    // delete that data and send delete response
})

app.post("/api/v1/share",(res,req) => {
    
})

app.get("/api/v1/share/:shareLink",(res,req) => {

})


connectDB()
.then(()=>{
    app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    });
})
.catch((err)=>{
    console.log("MONGO db Connection failed !! ",err);
})

