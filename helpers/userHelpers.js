var db=require('../config/connection');
var objectId=require('mongodb').ObjectId;
var collection=require('../config/collection')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const express = require('express');
const io=require('../config/server.js')

// io.on('connection', socket => {
//     console.log('New connection:', socket.id);

//     socket.on("disconnect", () => {
//       console.log(`User ${socket.id} disconnected.`);
//     });
// })

// Start the server
// const port = process.env.PORT || 5000;
// server.listen(port, () => {
// console.log(`Server started on port ${port}`);
// });
module.exports=
{
    dosignUp:(userData)=>
    {
        return new Promise (async(resolve,reject)=>
        {
            userData.password=await bcrypt.hash(userData.password,10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>
            {
                // console.log('inserted',data);
                userData._id = data.insertedId;
                resolve(userData)
            })
        })
    },
    doLogin:(loginData)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            console.log(loginData);
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:loginData.email})
            if(user)
            {
                console.log('user found');
                await bcrypt.compare(loginData.password,user.password).then((status)=>
                {
                    if(status)
                    {
                        console.log("login success");
                        resolve(user)
                    }
                    else
                    {
                        console.log("password error");
                    }
                })
            }
            
        })
    },
    friends:(loggedInUserId)=>
    {
        return new Promise(async(resolve,reject)=>
        {
            const users = await db.get().collection(collection.USER_COLLECTION).find().toArray();

            for (const user of users) {
                const chatId = [loggedInUserId, user._id].sort().join('-');
                const chat = await db.get().collection(collection.CHAT_COLLECTION).findOne({ _id: chatId });

                if (chat && chat.messages.length > 0) {
                    const mostRecentMessage = chat.messages[chat.messages.length - 1];
                    user.timestamp = mostRecentMessage.timestamp;
                } else {
                    // Set a default timestamp if the user has no messages
                    user.timestamp = 0;
                }
            }

            // Sort the users based on the most recent message timestamp
            users.sort((a, b) => b.timestamp - a.timestamp);

            resolve(users);
             
        }).catch((err) => {
            console.error(err);
            reject(err);
          });
        

    },
    chat:(req)=>
    {
        return new Promise (async(resolve,reject)=>
        {
            console.log("===",req.session.user._id);
            let user=req.session.user._id
            var di={};
            
            console.log('functioncall')
            io.once('connection',async socket => 
            {


                    db.get().collection(collection.USER_COLLECTION).updateOne({_id:new objectId(user)},
                    { $set: { server_id: socket.id } }).then(result => {
                        console.log('result:',result);
                    }).catch(error => {
                        console.error(error);
                    });
                di=socket.id;            
                resolve(di)
                console.log('New connection:', socket.id);

                socket.on('message',async (message, friendId) => {
                        console.log('the message is',message,friendId);
                        
                        const chatId = [user, friendId].sort().join('-');

                        const messageObject = {
                            sender: user,
                            timestamp: new Date(),
                            content: message
                          };

                        // update the chat document in the CHAT_COLLECTION collection
                        await db.get().collection(collection.CHAT_COLLECTION).updateOne(
                            { _id: chatId },
                            { $push: { messages: messageObject }},
                            { upsert: true }
                        );
                        const serverID = await db.get().collection(collection.USER_COLLECTION).findOne({ _id:new objectId( friendId) }, { projection: { server_id: 1 } });
                        console.log("this is server id",serverID.server_id);
                        if (serverID) {
                            // const serverID = await db.get().collection('friend').findOne({ user_id: friendId }).select('server_id');
                            // socket.emit('message', message, serverID);
                            io.to(serverID.server_id).emit('message', messageObject,user);
                            }
                        // socket.emit('message', message);
                    })
            
                // console.log("this si id",di);
                socket.on("disconnect", () => {
                console.log(`User ${socket.id} disconnected.`);
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    { _id:new objectId(user)},
                    { $unset: { server_id: "" } }
                  ).then(result => {
                    console.log(result);
                  }).catch(error => {
                    console.error(error);
                  });
            });
        })
        // console.log("this si id",di);
          
        })
        
    },
    chat_messages:(userId,friendId)=>
    {
        return new Promise (async(resolve,reject)=>
        {
        const chatId = [userId,friendId].sort().join('-');
        console.log("this is cat id ",chatId);
        // find the chat document in the CHAT_COLLECTION collection
        const chat = await db.get().collection(collection.CHAT_COLLECTION).findOne({ _id: chatId });
        console.log("this is chat",chat);
        resolve(chat)
        })
        
    }
    
      
}