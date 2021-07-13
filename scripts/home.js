const notificationoptin = document.getElementById("notification-optin")

document.getElementById('newroom-button').addEventListener('click', function(){
    window.location.replace('/room')
})

if(issubscribed){
    notificationoptin.innerHTML = "You are subscribed to notifications"
}

function optin(){
    if(Notification.permission=="granted"){
        installserviceworker()    
    }
    else if(Notification.permission=="denied"){
        alert("please change your notification settings")
    }
    else{
        Notification.requestPermission().then(res=>{
            if(res=="granted"){
                installserviceworker()
            }
            else{
                alert("we can't send you notifications if you don't allow us to hehe")
            }
        })
    }
}

function installserviceworker(){
    navigator.serviceWorker.register('/notifier.js').then(registration=>{
        const options = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BKZ9fgsXkZTpcPn1yGwhZPZpwJQv64s5mbVwUcL647git4wlYClkzlN_D7aba8anMwfS4FKwZ1hPGK_i30VUPSQ')
          }
        registration.pushManager.subscribe(options).then(subscription=>{
            fetch('/newsubscription',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(subscription)
            }).then(res=>{
                return res.text()
            }).then(res=>{
                console.log(res)
                notificationoptin.innerHTML = "You are subscribed to notifications"
            })
        })
    }).catch(err=> console.log(err))
}





function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}