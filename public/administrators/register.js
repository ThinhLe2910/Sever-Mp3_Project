$(document).ready(function () {
    clearForm()
    $("#clickLogin").click(function(){
        window.location = "/loginAdmin";
    });
    $("#customCheck1").on("change",function(){
        if($(this).is(':checked')){
            $('#btnRegister').prop('disabled', false);
        }else{
            $('#btnRegister').prop('disabled', true);
        }
        });
    $("#btnRegister").click(function () { 
      $.post("/register",{
        username : $("#txtUsername").val(),
        name : $("#txtName").val(),
        email : $("#txtEmail").val(),
        password : $("#txtPassword").val(),
        confirmPassword : $("#txtConfirmPassword").val(),
      },function(data){
        if(data.result ==1){
          $("#result").css("color","green");
          $("#result").html(data.message);
          alert(data.message)
          // chuyen huong
          window.location = "/loginAdmin";
        }else{
          $("#result").css("color","red");
          $("#result").html(data.message);
        }
      })
     })
     $("#clickLogin").click(function(){
      window.location = "/registerAdmin";
  });
  function clearForm(){
    $("#txtUsername").val(""),
    $("#txtName").val(""),
    $("#txtEmail").val(""),
    $("#txtPassword").val(""),
    $("#txtConfirmPassword").val("")
    $('#btnRegister').prop('disabled', true);
  }
});