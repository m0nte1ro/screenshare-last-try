const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '8101'
})

const peers = {};
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getDisplayMedia({
    video:true,
    audio:true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
        console.log("Entrou o: " + userId)
    });
});

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close();
})

myPeer.on('open', id => {
    socket.emit('entrar-sala', SALA_ID, id);
})

function addVideoStream(video, stream){
    video.srcObject = stream;
    console.log(stream);
    video.addEventListener('loadedmetadata', () => {
        video.play()
    });
    videoGrid.append(video);
}

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call;
}