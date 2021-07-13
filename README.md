# Colloquium

Colloquium is essentially a webrtc connection broker, with added features. 

UX
Colloquium has a rooms model, which the users can create and join once they are logged in.
Users in the same room can chat with each other or join the call in the room to talk face to face.
Login, Register and Joining a room
It’s a conscious choice to not take any personal information for registration
Once logged in, the user may create or join a room, or click on start new room instantly to create a new room with a unique ID
Room
When a user enters a room, they can see who all are in the room and in the room’s call in the chat box
Whenever someone enters or leaves a room/ room’s call, all users are notified in the chat box
Users can preview themselves before joining the call
Users can share their screen
Users can copy the room’s ID with a button
Invitations
Users can subscribe to get notifications when someone invites them to a room
Users can invite other users through the chat by typing #invite username 
The notification gives the user the ability to click join and enter the room directly without having to login

Backend
The server is written in node. The video streams do not go through the server, Colloquium relies on peer to peer webrtc connections. 
The following documentation is organised in terms of the modules utilised
Express
Express is the backbone of the server, handling all the requests and performing redirects, serving static files and rendering ejs views

Express sessions
Express sessions is used to store session information which is used to maintain login and tailor server responses to the user, which includes
If the session is logged in
If yes, then the username of the user
If the user is in a room, then the room of that user
