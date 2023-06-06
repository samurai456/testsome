const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const dispatch = require('./controller.js');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

app.use('/assets', express.static(path.join(__dirname, '/dist/assets')))

const callback = (req, res) =>{
    res.sendFile(path.join(__dirname, '/dist/index.html'));
}

app.get('/', callback);
app.get('/sign-in', callback);
app.get('/new-message', callback);
app.get('/message/:id', callback);

const server = http.createServer(app);
const dbUrl = "mongodb+srv://user:user34567@cluster0.oez3z3j.mongodb.net/?retryWrites=true&w=majority"

const webSocketServer = new WebSocket.Server({ server });

let online = [];

webSocketServer.on('connection', ws=>{
    console.log(online.map(i=>i.nickname),'connected', webSocketServer.clients.size)
    ws.send('welcome! (from server)');
    ws.on('message', m=>{
        let data;
        try {
            data = JSON.parse(m);
        } catch (e) {
            ws.send('this is not json!')
            console.log('this is not json!');
            return
        }
        try {
            dispatch(data, ws, online);
        } catch (e){
            ws.send('invalid request')
            console.log('invalid request');
        }
        console.log(online.map(i=>i.nickname))
    })
    ws.on('close', ()=>{
        const ind = online.findIndex(i=>i.ws===ws);
        if (ind!==-1){
            console.log('deleting', online[ind].nickname)
            online.splice(ind, 1)
            console.log(online.map(i=>i.nickname))
        }
    })
});

async function startApp(){
    try {
        await mongoose.connect(dbUrl);
        server.listen(80, ()=>console.log('good...'));
    } catch (e) {
        console.log(e)
    }
}

startApp();