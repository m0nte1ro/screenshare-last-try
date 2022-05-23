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
        port: '8100',
	secure: true,
	debug:3,
	path: '/peerjs'
    })
    
    console.log("Peer:")
    console.log(myPeer);

    myPeer.on('open', id => {
	console.log("MyPeer abriu: " + id + ".\nSala ID: " + SALA_ID);
        socket.emit('entrar-sala', SALA_ID, id);
    })
   
    addVideoStream(myVideo, stream);


    myPeer.on('call', call => {
	console.log("Recebida chamada. Mais info: V");
	console.log(call);
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
	    console.log("Entrei no call on Stream PAPI :3")
            addVideoStream(video, userVideoStream);
        })
   });
    socket.on('user-connected', userId => {
            console.log("New user connected" + userId);
            connectToNewUser(userId, stream, myPeer);
        });

    
});

socket.on('user-disconnected', userId => {
    console.log("-> O user: " + userId + " bazou mesmo de vez :(")
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
    console.log("--> O connect to new user diz que vem aí o " + userId);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove();
    })

    peers[userId] = call;
}
