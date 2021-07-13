document.getElementById('login-button').addEventListener('click',function(){
    fetch('/login', {
        
        body: new FormData(document.getElementById('login-form')),
        method:'post'
    }).then(response=>{
        return response.json()
    }).then(response=>{
        console.log(response)
        document.getElementById('status').innerHTML = response.status
        if(response.isloggedin == 'true'){
            window.location.href = '/home'
        }
    })
})
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
        })
    })
}).catch(err=> console.log(err))





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
// Notification.requestPermission().then(function(){
//     var notification = new Notification("hello", )
// })


var initViewport = function(){
	var metaEl = document.querySelector("#viewportMeta");
	var content = "height=" + window.innerHeight + ",width=" + window.innerWidth + ",user-scalable=no";
	metaEl.setAttribute('name', 'viewport');
	metaEl.setAttribute('content', content);
}
initViewport();