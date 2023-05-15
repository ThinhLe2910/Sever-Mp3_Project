$(document).ready(function(){
    getProfile()
    $('#btnUpdate').click(function(){
        if (confirm('Are you sure you want to update  profile?')) {
        $.post('/account/update',{
            token:getCookie("Token"),
            name:$('#txtName').val(),
            email:$('#txtEmail').val(),
            username:$('#txtUserName').val(),
            avatarImage:$('#hiddenAvatar').val(),
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
                var indexImage = data.data.avatarImage.lastIndexOf('/')
                var avatarImage = data.data.avatarImage.slice(indexImage+1)
                $('#avatar').attr("src","upload/image/avatar/"+avatarImage);
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
    $("#fileAvatar").change(function(){     
        var data = new FormData();
        jQuery.each(jQuery('#fileAvatar')[0].files, function(i, file) {
            data.append("avatar", file);
        });
    
        jQuery.ajax({
            url: './uploadAvatar',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            type: 'POST',
            success: function(data){
                if(data.result==1){
                    $("#avatar").attr("src","upload/image/avatar/" + data.data);
                    $('#hiddenAvatar').val(data.data);
                }else{
                    alert("Upload fail!");
                }
            }
        });
    });
})