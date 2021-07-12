document.getElementById('register-button').addEventListener('click',function(){
    fetch('/register', {
        body: new FormData(document.getElementById('register-form')),
        method:'post'
    }).then(response=>{
        return response.json()
    }).then(response=>{
        console.log(response)
            document.getElementById('status').innerHTML = response.status
            if(response.isregistered = 'true'){
                setTimeout(function(){
                    window.location.href = '/login'
                }, 2000)
            }
    })
})

var initViewport = function(){
	var metaEl = document.querySelector("#viewportMeta");
	var content = "height=" + window.innerHeight + ",width=" + window.innerWidth + ",user-scalable=no";
	metaEl.setAttribute('name', 'viewport');
	metaEl.setAttribute('content', content);
}
initViewport();
