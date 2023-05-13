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
    console.log(users,"this is users");
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
      res.render('user/user-chat',{users});
    
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

  module.exports = router;