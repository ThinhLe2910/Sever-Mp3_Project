$(document).ready(function(){
    var categoryId
    var categoryIdOption
    var currentChoose
    var arrayMusic
    var checkStatus
    getCategory()
    getMusic();  
    $("#clickAll").click(function(){
        clearForm()
    });
    $("#btnClear").click(function(){
        getMusic()
    });
    $('#inlineFormCustomSelect').on('change',function(){
        categoryIdOption = $(this).val();
      });
    $('#customSwitch1').on('change',function(){
    checkStatus =  $(this).is(':checked');
    });
    $(document).on("click","#chooseCategory",function(evt){
        categoryId = $(this).attr("_id");
        
        $.post('/music/categoryId',
        {categoryId : categoryId},function(data){   
            if(data.result==1){
                arrayMusic = data.data;
                $('#bodyMusic').html("");
                
                    data.data.forEach(music => {
                    $('#bodyMusic').append(`  
                    <div  class="col-lg-2 col-md-3">
                    <div class="el-card-item">
                    <div class="el-card-avatar el-overlay-1"> <img src="upload/music.png"  width="100" height="100" alt="music" />
                        <div class="el-overlay">
                            <ul class="el-info">
                                <li><a class="img-circle font-20" href="http://localhost:3000/upload/music/`+music.file+`"><i class="ti-control-play"></i></a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="el-card-content text-start">
                    <a class="card-title m-b-0" _id="`+music._id+`" id="ChooseMusic" >`+music.nameAlbum+`</a>
                    </br>
                        <small class="text-muted">`+music.nameSinger+`</small>
                    </div>
                </div>
                </div>
                `);
                });         
            }
        }) 
        
    });
    $(document).on('click','#btnUpdate',function(evt){
        if (confirm('Are you sure you want to update?')) {
            $.post('/administrator/music/update',
            {   
                status:checkStatus,
                _id:currentChoose,
                idCategory : categoryIdOption,
                token : getCookie("Token"),
                nameAlbum : $('#txtNameSong').val(),
                nameSinger : $('#txtNameSinger').val(),
                file : $('#hiddenMusic').val(),
                image: $('#hiddenImage').val()
            },function(data){   
                if(data.result==1){
                    alert(data.message)
                    clearForm()
                    getMusic()        
                }else{
                    alert(data.message)
                }
            })
        } else
        {
        return
        }
    });
    $(document).on('click','#btnAdd',function(evt){
        $.post('/music/add',
        
        {   idCategory : categoryIdOption,
            token : getCookie("Token"),
            nameAlbum : $('#txtNameSong').val(),
            nameSinger : $('#txtNameSinger').val(),
            file : $('#hiddenMusic').val(),
            image: $('#hiddenImage').val()
        },function(data){   
            console.log(data);
            if(data.result==1){
                alert(data.message)
                clearForm()
                getMusic()        
            }else{
                alert(data.message)
            }
    })
    })
    $(document).on('click','#ChooseMusic',function(evt){
        currentChoose =  $(this).attr("_id");
        arrayMusic.forEach(music=>{
            if(music._id == currentChoose){
                $('#txtNameSong').val(music.nameAlbum);
                $('#txtNameSinger').val(music.nameSinger);
                categoryIdOption = music.idCategory;
                 $("#inlineFormCustomSelect").val(music.idCategory);
                if(music.status){
                    $('#customSwitch1').prop('checked', true); 
                    checkStatus = true
                }else{
                    $('#customSwitch1').prop('checked', false);  
                    checkStatus = false
                }
                var audio = $("audio").get(0);
                audio.src = "upload/music/" + music.file
                audio.load()
                $('#hiddenMusic').val(music.file);
                $("#imageMusic").attr("src","upload/image/music/" + music.image);
                $('#hiddenImage').val(music.image);
            }
            })
    })
    $(document).on('click','#btnDelete',function(evt){
        if (confirm('Are you sure you want to delete?')) {
            $.post('/administrator/music/delete',
            {   
                _id:currentChoose,
                token : getCookie("Token"),
            },function(data){   
                if(data.result==1){
                    alert(data.message)
                    clearForm()
                    getMusic()        
                }else{
                    alert(data.message)
                }
            })
        }else{
        return
        }
    })
    $("#fileImage").change(function(){     
        var data = new FormData();
        jQuery.each(jQuery('#fileImage')[0].files, function(i, file) {
            data.append("music", file);
        });
    
        jQuery.ajax({
            url: '/music/uploadImage',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            type: 'POST',
            success: function(data){
               
                if(data.result==1){
                    $("#imageMusic").attr("src","upload/image/music/" + data.data);
                    $('#hiddenImage').val(data.data);
                }else{
                    alert("Upload fail!");
                }
            }
        });
    });
    $("#fileMusic").change(function(){ 
        var data = new FormData();
        jQuery.each(jQuery('#fileMusic')[0].files, function(i, file) {
            data.append("music", file);
        });   
        jQuery.ajax({
            url: './uploadMusic',
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            method: 'POST',
            type: 'POST',
            success: function(data){

                if(data.result==1){
                    var audio = $("audio").get(0);
                    audio.src = "upload/music/" + data.data
                    audio.load()
                    $('#hiddenMusic').val(data.data);
                    
                }else{
                    alert("Upload fail!");
                }
            }
        });
    })                   
    function getMusic(){
        $.post('/administrator/music',{token:getCookie("Token")},function(data1){
            arrayMusic = data1.data
            if(data1.result==1){
                $('#bodyMusic').html("");
                    data1.data.forEach(music => {
                        if(music.image != undefined){
                            image = "upload/image/music/" + music.image
                           }else{
                            image = `upload/image/music/music.png`
                           }
                    $('#bodyMusic').append(`  
                    <div  class="col-lg-2 col-md-3">
                    <div class="el-card-item">
                    <div class="el-card-avatar el-overlay-1"> <img src="`+ image +`" width="200" height="200" alt="music" />
                        <div class="el-overlay">
                            <ul class="el-info">
                                <li><a class="img-circle font-20" href="http://localhost:3000/upload/music/`+music.file+`"><i class="ti-control-play"></i></a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="el-card-content text-start">
                        <a class="card-title m-b-0" _id="`+music._id+`" id="ChooseMusic" >`+music.nameAlbum+`</a>
                        </br>
                        <small class="text-muted">`+music.nameSinger+`</small>
                    </div>
                </div>
                </div>
                `);
                });         
            }
        });
    }
    function getCategory(){
        $.post('/category/list',function(data1){
            if(data1.result==1){
                arrayCate = data1.data;
                $('#bodyCategory').html("");
                $('#inlineFormCustomSelect').html()
                    data1.data.forEach(category => {
                    $('#inlineFormCustomSelect').append(`
                    <option id="chooseOption" value="`+category._id+`">`+ category.name +`</option>
                    `)
                    $('#bodyCategory').append(`  
                    <a  href="javascript:void(0)" id="chooseCategory" _id="`+category._id+`" class="list-group-item active">`+ category.name+`</a>`);
                });         
            }
        });
    }
    function clearForm(){
        currentChooseId = null;
        categoryIdOption = null;
        $('#txtNameSong').val("");
        $('#txtNameSinger').val("");
        categoryIdOption = $("#inlineFormCustomSelect").val("");
        var audio = $("audio").get(0);
        audio.src = ""
        audio.load()
        $('#hiddenMusic').val("");
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


