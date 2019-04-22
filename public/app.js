$('.save-article-button').on('click', function () {
    event.preventDefault();
    //grab DOM elements to b sent to articles DB
    var link = $(this).parent().siblings().attr('href');
    var photo = $(this).parent().siblings().children().attr('src');
    var title = $(this).siblings().children().text();
    $(this).parent().parent().hide();

    $.post('/savearticle', {
        link: link,
        photo: photo,
        title: title,
    }).then(function (response) {
        console.log(response)
    });
})

$('.delete-article-button').on('click', function () {
    event.preventDefault();
    $.post('/deletearticle/' + $(this).attr('mongoID')).then(response => {
        location.reload();
    })
})

$('.comment-article-button').on('click', function () {
    $('.modal-body').empty()
    $.get('/articlenotes/' + $(this).attr('article-id')).then(response=>{
        console.log(response.note)
        for(var i=0;i<response.note.length;i++){
            $('.modal-body').append(
                '<div class="input-group">' +
                    '<input type="text" class="form-control mb-2 col-8 note-id="' + response.note[i]._id + '" value="' + response.note[i].text +'">' +
                    '<span class="input-group-btn">' +
                        '<button class="edit-note btn btn-primary ml-5" note-id=' + response.note[i]._id + ' type="submit">Edit</button>' +
                        '<button class="delete-note btn btn-danger" note-id=' + response.note[i]._id + ' type="submit">X</button>' +
                    '</span>' +
                '</div>'
            )
        }
    })
})

$('.add-new-note').on('click', function () {
    $('.modal-body').append(
        '<div class="input-group">' +
            '<input type="text" class="form-control mb-2 col-8 article-id="' + $(this).attr('article-id') + '" placeholder="new note">' +
            '<span class="input-group-btn">' +
                '<button class="save-new-note btn btn-primary ml-5" article-id=' + $(this).attr('article-id') + ' type="submit">Save</button>' +
            '</span>' +
        '</div>') 
})

$(document).on('click', '.delete-note',  function(){
    $.post('/deletenote/' + $(this).attr('note-id')).then(response=>location.reload())
})

$(document).on('click', '.save-new-note',  function(){
    var inputedNote = ($(this).parents().siblings('input').val())
    if(inputedNote !==''){
        $.post('/notes/' + $(this).attr('article-id'), {text:inputedNote}).then(response=>location.reload())
    }    
})

$(document).on('click', '.edit-note',  function(){
    var inputedNote = ($(this).parents().siblings('input').val())
    if(inputedNote !==''){
        $.ajax({
            type: "PUT",
            url: "/notes/" + $(this).attr('note-id'),
            data:{inputedNote}
        }).then(response=>console.log(response))
    }    
    location.reload()
})