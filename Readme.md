
# Colloquium

Colloquium is essentially a webrtc connection broker, with added features.

## UX

There are 4 pages, register, login, home and app.
Colloquium has a rooms model (app being the room), which the users can create and join once they are logged in.
Users in the same room can chat with each other or join the call in the room to talk face to face.


#### Login, Register and Joining a room
* It’s a conscious choice to not take any personal information for registration
* Once logged in, the user may create or join a room, or click on start new room instantly to create a new room with a unique ID

#### Room
* When a user enters a room, they can see who all are in the room and in the room’s call in the chat box
* Whenever someone enters or leaves a room/ room’s call, all users are notified in the chat box
* Users can preview themselves before joining the call
* Users can share their screen
* Users can copy the room’s ID with a button

#### Invitation
* Users can subscribe to get notifications when someone invites them to a room
* Users can invite other users through the chat by typing #invite username 
* The notification gives the user the ability to click join and enter the room directly without having to login



## Server
The server is written in node. The video streams do not go through the server, Colloquium relies on peer to peer webrtc connections. 
The following documentation is organised in terms of the modules utilised:

#### Express
Express is the backbone of the server, handling all the requests and performing redirects, serving static files and rendering ejs views.

#### Socket.io
If Express is the backbone, socket is the spinal cord. Once the user is in the room, communication has to be fast, hence socket. Socket essentially is responsible for brokering peer connections. Following communications are also made through socket
* When a user joins or leaves the room or the room’s call, socket communication informs all the clients
* Chats are sent through socket
* Screen sharing on/off
* Invitation
* Client disconnection is also handled through socket

#### Peerjs
Peerjs is a wrapper around the RTCPeerConnection interface, which establishes media connections between users. Peerjs listens for and makes calls to users in the room, as informed by socket. Screen shares are also calls made through peer. The connection brokering is done by an open source peer server.


#### Express sessions
Express sessions is used to store session information which is used to maintain login and tailor server responses to the user, which includes
* If the session is logged in
* If yes, then the username of the user
* If the user is in a room, then the room of that user
#### Bcrypt
Bcrypt is used to hash passwords, only hashed passwords are stored in the server when a user registers. Bcrypt is also used to authenticate passwords during login

#### Web-push
Webpush is used to send notifications which are received and displayed by the service worker
