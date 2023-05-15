$(document).ready(function(){
    var arrayCate = null
    var index = 0 
    var currentChooseId = null
    getCategory()
    function getCategory(){
        $.post('/category/list',function(data1){
            if(data1.result==1){
                arrayCate = data1.data;
                
                $('#listAccount').html("");
                    data1.data.forEach(category => {
                        var indexCategory = category.image.lastIndexOf('/')
                        var categoryImage = category.image.slice(indexCategory+1)
                        index += 1
                        if(category.image){
                            image = `<td class="text-center"><img src="upload/image/category/`+categoryImage
                            +`" width="100px" height="100px" alt=""></td> `
                           }else{
                            image = `<td class="text-center"><img src="upload/image/category/music.png" width="100px" height="100px" alt=""></td> `
                           }
                    $('#listAccount').append(` 
                    <tr> 
                    <td class="text-center">`+index+`</td>
                    `+ image +`
                    <td class="text-center"><span class="badge bg-info rounded-pill">`+category.name+`</span></td>
                    <th><button type="button" class="btn waves-effect waves-light btn-info" id="btnChoose" _id="`+category._id+`">Choose</button></th>
                    </tr>
                    `);
                });         
            }
        });
    }
    $('#btnClear').click(function(){
        clearForm()
    })
    $("#fileImage").change(function(){     
        var data = new FormData();
        jQuery.each(jQuery('#fileImage')[0].files, function(i, file) {
            data.append("category", file);
        });
    
        jQuery.ajax({
            url: '/category/uploadImage',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            type: 'POST',
            success: function(data){
               
                if(data.result==1){
                    $("#imageCategory").attr("src","upload/image/category/" + data.data);
                    $('#hiddenImage').val(data.data);
                }else{
                    alert("Upload fail!");
                }
            }
        });
    });
    $(document).on("click","#btnChoose",function(evt){
        currentChooseId = $(this).attr("_id");
        arrayCate.forEach(category=>{
            if(category._id == currentChooseId){
                $('#btnAdd').prop('disabled', true);
                var indexCategory = category.image.lastIndexOf('/')
                var categoryImage = category.image.slice(indexCategory+1)
                $('#txtName').val(category.name);
                $('#imageCategory').attr("src","upload/image/category/"+categoryImage);
                $('#hiddenImage').val(category.image);
            }
            })
    })
    $(document).on('click','#btnAdd',function(evt){
        $.post('/category/add',  
        {  
            image: $('#hiddenImage').val(),
            token : getCookie("Token"),
            name : $('#txtName').val(),
        },function(data){   
            if(data.result==1){
                alert(data.message)
                clearForm()
                getCategory()        
            }else{
                alert(data.message)
            }
    })
    })
    $(document).on('click','#btnUpdate',function(evt){
        if (confirm('Are you sure you want to update?')) {
        $.post('/category/update',  
        {  
            token : getCookie("Token"),
            name : $('#txtName').val(),
            _id : currentChooseId,
            image: $('#hiddenImage').val()
        },function(data){   
            if(data.result==1){
                alert(data.message)
                clearForm()
                getCategory()        
            }else{
                alert(data.message)
            }
        })
        }else{
            return
        }
    })
    $(document).on('click','#btnDelete',function(evt){
        if (confirm('Are you sure you want to delete?')) {
        $.post('/category/delete',  
        {  
            token : getCookie("Token"),
            _id : currentChooseId
        },function(data){   
            if(data.result==1){
                alert(data.message)
                clearForm()
                getCategory()        
            }else{
                alert(data.message)
            }
        })
    }else{
            return
        }
    })
    function clearForm(){
        currentChooseId = null;;
        $('#txtName').val("");
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