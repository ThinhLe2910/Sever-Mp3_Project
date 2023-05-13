$(document).ready(function(){
    $('#btnUpdate').click(function(){
        if (confirm('Are you sure you want to change password?')) {
        $.post('/account/change-password',{
            token:getCookie("Token"),
            password:$('#txtNewPassword').val(),
            currentPassword:$('#txtCurrentPassword').val(),
            comfirmPassword:$('#txtComfirmPassword').val()
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