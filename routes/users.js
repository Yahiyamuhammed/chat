  var express = require('express');
  // const userHelpers = require('../../web des bro/shopping cart/helpers/user-helpers');
  var router = express.Router();
  var userHelpers=require('../helpers/userHelpers');
  const session = require('express-session');
  


  var http = require('http');
const { verify } = require('crypto');
var app = express();

  function verifyLogin(req,res,next)
  {
    let user=req.session.user
    console.log(user);
    if(user){
      next()
      console.log("user exist");}
    else{
      res.redirect('/login');console.log("redirecting to login");}
  }

  /* GET users listing. */
  router.get('/',verifyLogin,async(req, res, ) =>
  {
    let users=await userHelpers.friends()
    // console.log(users,"this is users");
      // userHelpers.friends().then((users)=>
      // {
      //   users=users
      // })
    
       userHelpers.chat(req).then((id)=>
      {
        console.log(id,"this is user");
        req.session.rId=id;
        console.log("this reqbody",req.session);
        // console.log("this reqbody",req.session.rId);
      })

      
      // console.log("got users",users); 
      res.render('user/user-chat',{users,userId:req.session.user._id});
    
  });
  router.get('/login',(req,res)=>
  {
    if( req.session.user)
      res.redirect('/')
    else{console.log("logging");
    res.render('user/login')}
  });
  router.post('/login',(req,res)=>
  {
    console.log(req.body);
    userHelpers.doLogin(req.body).then((response)=>
    {
      // console.log("loged in",response);
      req.session.user=response;
      // req.session.userLoggedIn=true;
        req.session.userLoggedin=true;

      // console.log("this is sssoin", req.session.user);
      res.redirect('/')
    })
  })
  router.post('/signup',(req,res)=>
  {
    console.log(req.body);
    userHelpers.dosignUp(req.body).then((response)=>
    {
      console.log("signed up",response);
      if(response)
      {
        req.session.user=response;
        // req.session.userLoggedin=true;
        res.redirect('/')
      }
    })
  })

  router.get('/chat-history',async(req,res)=>
  {
    // let usrid=req.session.user._id
    // console.log(req.query.userId,"+++",req.session.user._id);
    const chat=await userHelpers.chat_messages(req.query.userId, req.query.friendId)
    if (chat && chat.messages) {
      res.json(chat.messages);
    } else {
      res.json([]); // Return an empty array or handle the error in an appropriate way
    }  })

  module.exports = router;