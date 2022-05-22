const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
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
        socket.to(salaId).emit('user-connected', userId);

        socket.on('disconnect', () => {
            socket.to(salaId).emit('user-disconnected', userId);
        })
    })
})

server.listen(8100);