$(document).ready(function(){
    var arrayAcc = null;
    var currentChooseId = null;
    getAcc()
    

    
    $(document).on("click","#btnChoose",function(evt){
        currentChooseId = $(this).attr("_id");
        arrayAcc.forEach(acc=>{
            if(acc._id == currentChooseId){
                
                $('#txtName').val(acc.name);
                $('#txtUsername').val(acc.username);
                $('#txtEmail').val(acc.email);
                $('#avatar').attr("src","upload/image/"+acc.avatarImage);
                $('#hiddenAvatar').val(acc.avatarImage);
            }
            })
        })
    $('#btnClear').click(function(){
        clearForm()
    })
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
                    $("#avatar").attr("src","upload/image/" + data.data);
                    $('#hiddenAvatar').val(data.data);
                }else{
                    alert("Upload fail!");
                }
            }
        });
    });

    $('#btnUpdate').click(function(){
        if (confirm('Are you sure you want to update?')) {
            if(currentChooseId==null){
                alert("Please choose Account")
            }else{
                $.post('./administrator/account/update',{
                    token:getCookie("Token"),
                    _id:currentChooseId,
                    username:$('#txtUsername').val(),
                    name:$('#txtName').val(),
                    email:$('#txtEmail').val(),
                    avatarImage:$('#hiddenAvatar').val(),
                },function(data){
                    console.log(data);
                    if(data.result==1){
                        alert(data.message);
                        clearForm();
                        getAcc()
                    }else{
                        alert(data.message);
                    }
                })
            }
        }else{
            return
        }      
    });
    $('#btnDelete').click(function(){
        if (confirm('Are you sure you want to delete?')) {
            if(currentChooseId==null){
                alert("Please choose Account")
            }else{
                $.post('./administrator/account/delete',{
                    token:getCookie("Token"),
                    _id:currentChooseId,
                },function(data){
                    console.log(data);
                    if(data.result==1){
                        alert(data.message);
                        clearForm();
                        getAcc()
                    }else{
                        alert(data.message);
                    }
                })
            }    
        }else{
            return
        }
    })  
    function getAcc(){
        var token = getCookie("Token")
        $.post('/account/list',{token:token},function(data1){
            var index = 0
            var avatar = ""
            if(data1.result==1){
                arrayAcc = data1.data
                $('#listAccount').html("");
                data1.data.forEach(acc => {
                       index += 1
    
                       if(acc.avatarImage){
                        avatar = `<td class="text-center"><img src="upload/image/`+acc.avatarImage
                        +`" width="30px" height="30px" alt=""></td> `
                       }else{
                        avatar = `<td class="text-center"><img src="upload/image/avatar.png" width="30px" height="30px" alt=""></td> `
                       }
                    $('#listAccount').append(`                
                <tr>
                <td class="text-center">`+index+`</td>
                `+ avatar +` 
                <td class="text-center">`+acc.name+`</td>
               
                <td class="text-center" ><span class="badge bg-info rounded-pill" >`+acc.username+`</span></td>
                <td class="text-center"><span class="badge bg-info rounded-pill">`+acc.email+`</span></td>
                <td class="text-center" ><span class="badge bg-info rounded-pill" >`+acc.email_active+`</span></td>
                <th><button type="button" class="btn waves-effect waves-light btn-info" id="btnChoose" _id="`+acc._id+`">Choose</button></th>
                </tr>
                `);
                });         
            }
        });
    }
    function clearForm(){
        currentChooseId = null;
        $('#avatar').attr("src","upload/avatar.png");
        $('#txtUsernmae').val("");
        $('#txtName').val("");
        $('#Email').val("");
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





