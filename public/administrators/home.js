$(document).ready(function(){
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
            console.log(data);
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