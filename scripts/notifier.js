var secret = ''
var room = ''

self.addEventListener('push', function(event) {
    const invite = event.data.json()
    secret = invite.secret
    room = invite.room
    const promiseChain = self.registration.showNotification('Colloquium invite',{
        body: `Invited by ${invite.inviter}`,
        actions : [
            {
                action: 'Join',
                title: 'Join'
            },
            {
                action: 'Decline',
                title: 'Decline'
            }
        ]
    });
    event.waitUntil(promiseChain);
});

self.addEventListener('notificationclick', function(event){
    event.notification.close()
    if(event.action == "Join"){
        clients.openWindow(`/${secret}/${room}`)
    }
    else if(event.action == "Decline"){

    }
    else{

    }
    secret = ''
    room = ''

})