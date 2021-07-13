
# Colloquium

Colloquium is a webrtc connection broker, with added features, written in Node.
It's hosted [at heroku](https://cryptic-dawn-98457.herokuapp.com) right now

## How to install on your local

1. Clone the repository

```bash
$ git clone https://github.com/RimJS/Colloquium.git
```
2. Install node modules
```bash
$ npm install
```
2. Run the server
```bash
$ node server.js
```

Change the port according to your need in the server.js

## UX

There are 4 pages, register, login, home and app.
Colloquium has a rooms model (app being the room), which the users can create and join once they are logged in.
Users in the same room can chat with each other or join the call in the room to talk face to face.


#### Login, Register and Joining a room
* It’s a conscious choice to not take any personal information for registration
* Once logged in, the user may create or join a room, or click on start new room instantly to create a new room with a unique ID

#### Room
* When a user enters a room, they can see who all are in the room and in the room’s call in the chat box
* User may click on any video to enlarge it
* Whenever someone enters or leaves a room/ room’s call, all users are notified in the chat box
* Users can preview themselves before joining the call
* Users can share their screen
* Users can copy the room’s ID with a button

#### Invitation
* Users can subscribe to get notifications when someone invites them to a room
* Users can invite other users through the chat by typing #invite username 
* The notification gives the user the ability to click join and enter the room directly without having to login



## Server
The server is written in node. The video streams do not go through the server, Colloquium relies on peer to peer webrtc connections. Server stores data in runtime memory, there is not database as of yet. The following data is available with the server
* Generated rooms, their occupants and who are in the call in that room
* Users, their names, their status (online, incall, inroom, offline), the room they are in (if they are in) their hashed passwords and their push subscription 

The documentation is organised in terms of node modules utilised:

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

Be mindful that no session store is used as of yet, sessions might be garbage collected if they stay on for long.

#### Bcrypt
Bcrypt is used to hash passwords, only hashed passwords are stored in the server when a user registers. Bcrypt is also used to authenticate passwords during login.

#### Web-push
Webpush is used to send notifications which are received and displayed by the service worker. When a notification is sent, an uuid is generated and the server starts listening for a request at a URL with that uuid. The same uuid is also sent as notification payload to the client's service worker, using which the client is able to bypass the login.

## Client
EJS has been used in the frontend to create the views.  

Login, Registration and Home page, each have their JS scripts. Login and Registration scripts are used to send user input to the server, collect the response and redirect accordingly. The scripts themselves do not perform any validation, so as to avoid tampering.

The option to opt in to invite notifications is provided at the home page, hence the service worker is also installed there.

#### Room
The room's JS scripts, named videochat.js and textchat.js is where the magic happens. videochat.js performs all the functions of the first three-fourths of the screen, and the textchat.js performs all the functions of the remaining fourths, and ofcourse they talk to each other.

These scripts maintain in runtime memory the following data
* usernames and names of users in room
* peerids of users in the call

These scripts communicate with the server using socket about new users joining, users leaving etc. (except initially, when textchat.js requests the server for the list users in the room and the room's call)

A peer object is constructed in videochat.js which acts as a telephone, a very advanced one, as it can make and take multiple calls simultaneously 

videochat.js is also responsible for arranging the videos according to their numbers

textchat.js is responsible for sending, receiving and displaying texts, and for notifications of user activity in the chatbox. textchat.js is also responsible for requesting the server to send invite to a user.
