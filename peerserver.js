const { PeerServer } = require('peer');
const fs = require('fs')
const peerServer = PeerServer({ 
    port: 3000, path: '/',
    ssl : {
        key: fs.readFileSync(__dirname+'\\localhost-key.pem'),
        cert: fs.readFileSync(__dirname+'\\localhost.pem')
    } 
});
