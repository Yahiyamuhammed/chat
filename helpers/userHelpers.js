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
    friends:()=>
    {
        return new Promise(async(resolve,reject)=>
        {
           await db.get().collection(collection.USER_COLLECTION).find().toArray().then((data)=>
           {
            // console.log(data);
            resolve(data);
           })
              
             
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
                        const serverID = await db.get().collection(collection.USER_COLLECTION).findOne({ _id:new objectId( friendId) }, { projection: { server_id: 1 } });
                        console.log("this is server id",serverID.server_id);
                        if (serverID) {
                            // const serverID = await db.get().collection('friend').findOne({ user_id: friendId }).select('server_id');
                            // socket.emit('message', message, serverID);
                            io.to(serverID.server_id).emit('message', message);
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
    sendMessage(message, friendId) {
        console.log("emited");
        io.emit('message', {
          message,
          from: user.id,
          to: friendId,
        });
      }
      
}