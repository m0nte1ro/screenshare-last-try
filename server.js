var fs = require('fs');
const https = require('https');

var credentials = {
    key: fs.readFileSync('ssl/creche.ipmaia.key'),
    cert: fs.readFileSync('ssl/creche.ipmaia.crt')
}

const express = require('express');
const app = express();

const server = https.createServer(credentials, app);

const ExpressPeerServer = require('peer').ExpressPeerServer
var PeerServer = ExpressPeerServer(server, {
    	debug: true,
	path: '/peerjs'
   }
)

app.use(PeerServer);

const io = require('socket.io')(server, {
    forceNew: true,
    transports: ["polling"],
    cors: {
        origin: '*'
    }
});

const { v4: urlUnico } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${urlUnico()}`)
})

app.get('/:sala', (req, res) => {
    res.render('sala', {salaId: req.params.sala})
})

io.on('connection', socket => {
    socket.on('entrar-sala', (salaId, userId) => {
        socket.join(salaId);
	console.log(userId + " vai entrar na sala: " + salaId);
        
	
        socket.to(salaId).emit('user-connected', userId);
        
        

        socket.on('disconnect', () => {
	    console.log("Vai bazar o: " + userId + "já avisou");
            socket.to(salaId).emit('user-disconnected', userId);
        })
    })
})

server.listen(process.env.PORT || 8100);
