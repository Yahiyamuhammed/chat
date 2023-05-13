const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });


//     io.on('connection', socket => {
//         console.log('New connection:', socket.id)a;
//     })
//   }


// Start the server
server.listen(3001, () => {
  console.log('Server started on port 3001');
});



module.exports =io;