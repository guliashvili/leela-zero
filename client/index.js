// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const axios = require('axios')


server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

let gameHistory = [];

io.on('connection', (socket) => {

    // when the client emits 'new message', this listens and executes
    socket.on('new move', (data) => {
        gameHistory.push({x: data['x'], y: data['y'], isBlack: true});

        axios
            .post('http://127.0.0.1:1999/json', {
                moves: gameHistory,
                commandSpec: {command: "z"}
            })
            .then(res => {
                const {x, y, isBlack} = res.data["move"];
                gameHistory.push({x, y, isBlack});
                console.log('send data', gameHistory);
                socket.emit('new move', {
                    x,
                    y,
                    isBlack
                });
                console.log('sent sock');
            })
            .catch(error => {
                console.error(error)
            })
        // we tell the client to execute 'new message'

    });

});
