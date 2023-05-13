$(document).ready(function () {
      $("#btnLogin").click(function () { 
        var un = $("#txtUsername").val();
        var pw = $("#txtPassword").val();
        $.post("./login",{
          username : un,
          password : pw
        },function(data){
          if(data.result ==1){
            $("#result").css("color","green");
            $("#result").html("Login Successfully");
            setCookie("Token",data.data,10);
            // chuyen huong
            window.location = "/administrator";

          }else{
            $("#result").css("color","red");
            $("#result").html(data.message);
          }
        })
       })
       $("#register").click(function(){
        window.location = "/registerAdmin";
    });
  });


  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
