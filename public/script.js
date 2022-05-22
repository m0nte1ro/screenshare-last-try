const socket = io('/');
const videoGrid = document.getElementById('video-grid');

const peers = {};
const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getDisplayMedia({
    video:true,
    audio:true
}).then(stream => {
    const myPeer = new Peer(undefined, {
        host: '/',
        port: '8101'
    })

    myPeer.on('open', id => {
        socket.emit('entrar-sala', SALA_ID, id);
    })
   
    addVideoStream(myVideo, stream);

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream, myPeer);
    });

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
        socket.emit('ready');
    })

    
});

socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close();
})



function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
}

function connectToNewUser(userId, stream, peer){
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call;
}