// src/server.ts
import express from 'express';
import { connectDB } from './db.js';
import { User ,Content,Link} from './model.js';
import { random }  from "./utilites.js";
import jwt from "jsonwebtoken"
import { userMiddleware } from './middleware.js';

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

app.post('/api/v1/content', userMiddleware,async (req, res) => {
    // connect middleware
    //take data
    // save in mongo db
    // send response
    const {link,type,title} = req.body

    const content = await Content.create({
        link,
        type,
        title,
        // @ts-ignore
        userId:  req.userId,
        tags : []
    })

    res.json({
        message : "content created"
    })

});

app.get('/api/v1/content', userMiddleware,async (req, res) => {
    //get all the data of that user 
    // and the user ID will be in middleware
    // @ts-ignore
    let userId = req.userId

    const contentData = await Content.find({
        userId:userId
    }).populate("userId","username") //agar kisi mai kisi data ka id raha ta hai to uska pura data show lar sakte hai using populate
    // aur agar uska baad kuch bhi lekha to vahi data show hoga 
    // like uerId mai user ka ID hai aur usmai userdata hai agar uske baat username lekha to user ka kaam dekha ga
    // aur agar password lekha to user ka password dekhe ga

    if(!contentData){
        res.status(400).json({
        message : "error fetching data"
    })
    }

    res.status(200).json({
        contentData
    })


});

app.delete("/api/v1/content",userMiddleware, async (req,res) => {
    // get the content ID of that content
    // delete that data and send delete response
    const { contentId } = req.body;

    if(!contentId){
        return res.status(400).json({
        message:"please give the content ID"
    })
    }

    const deletedData = await Content.deleteOne({
        _id : contentId,      // <-- FIX HERE
        // @ts-ignore
        userId : req.userId // <-- ensures users delete only their own content
    })

    if(deletedData.deletedCount === 0){
        return res.status(403).json({
      message: "Trying to delete a doc you don't own or doc doesn't exist",
    });
    }


    res.status(200).json({
        message: "Content deleted successfully"
    })
})

app.post("/api/v1/share",userMiddleware,async (req,res) => {

    // the share will be true or false
    // of true then get the userId from middleware
    // create link from random store it with userId
    // if already made then return it by default
    // if the share id false then the link will be deleted

    const share = req.body.share;
    const contentId = req.body.contentId;
    // @ts-ignore
    const userId = req.userId
    // console.log(share)
    if(share){
        const existingLink = await Link.findOne({
            userId : userId,
            contentId : contentId
        });

        if(existingLink){
            return res.status(201).json({
                hash  : existingLink.hash
            })
        }

        const hash = random(10);
        await Link.create({
            hash:hash,
            userId : userId,
            contentId : contentId 
        })

        res.status(200).json({
            hash
        })
    }else{
        // console.log("working")
        await Link.deleteOne({
            userId
        });

        res.status(201).json({
            message : "Link Removed"
        })
    }
})

app.get("/api/v1/share/:shareLink",userMiddleware,async (req,res) => {
    // get the has linked from parames
    // find hash in link model
    // after that get the content from the userId store in link model
    // same with username 
    // return username and content data

    const sharedLink = req.params.shareLink;

    if(!sharedLink){
        return res.status(301).json({
            message:"didn't give the shareLink"
        })
    }

    const link = await Link.findOne({
        hash : sharedLink
    })

    if(!link){
        return res.status(304).json({
            message:"didn't get the link from model"
        })
    }

    const content = await Content.find({
        _id : link.contentId
    })

    const user = await User.findOne({
        _id : link.userId
    })

    if(!content && !user){
        return res.status(401).json({
            message:"didn't get the content or user"
        })
    }

    res.status(200).json({
        content,
        user : user?.username
    })

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

