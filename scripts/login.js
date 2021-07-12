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