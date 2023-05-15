$(document).ready(function(){
    getAcc()
    $("#chooseItem").click(function(){
        window.location = "/administrator/account";
    });
    $("#chooseItem2").click(function(){
        window.location = "/administrator";
    });
    $("#chooseItem3").click(function(){
        window.location = "/administrator/album";
    });
    $("#chooseItem4").click(function(){
        window.location = "/administrator/change-password";
    });
    $("#chooseItem5").click(function(){
        window.location = "/administrator/profile";
    });
    $("#btnLogout").click(function(){
        var token = getCookie("Token");
        $.post("./logout",{token:token},function(data){
            eraseCookie("Token");
            window.location = "/loginAdmin";
            
        });
    });

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
    function eraseCookie(name) {   
        document.cookie = name+'=; Max-Age=-99999999;'; 
    }
    function getAcc(){
        var token = getCookie("Token")
        $.post('/account',{token:token},function(data1){
            if(data1.result==1){
                var indexImage = data1.data.avatarImage.lastIndexOf('/')
                var avatarImage = data1.data.avatarImage.slice(indexImage+1)
                $('#avatarHomeImage').attr("src","upload/image/avatar/"+avatarImage);
            }
        });
    }