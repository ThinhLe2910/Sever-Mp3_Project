$(document).ready(function(){
    getProfile()
    $('#btnUpdate').click(function(){
        if (confirm('Are you sure you want to update  profile?')) {
        $.post('/account/update',{
            token:getCookie("Token"),
            name:$('#txtName').val(),
            email:$('#txtEmail').val(),
            username:$('#txtUserName').val()
        },function(data){
            if(data.result == 1){
                alert(data.message);
            }else{
                alert(data.message);
            }
            
        })
    }else{
        return
    }
    })
    function getProfile(){
        $.post('/account',{
            token:getCookie("Token"),
            username:$('#txtUserName').val()
        },function(data){
            if(data.result == 1){
                $('#txtName').val(data.data.name),
                $('#txtEmail').val(data.data.email),
                $('#txtUserName').val(data.data.username) 
            }else{
                alert(data.message)
            }
        })
    }
    function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
            c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
            }
        }
        return "";
        }
})