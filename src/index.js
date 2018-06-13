var app = app || {};

window.appView = new app.AppView;

$(".btnAddAnswer").on('click', function(){
	var answer = '<div class="row"><div class="col-md-10 m-bottom-sm form-inline">';
        answer += '<input style="width:100%" type="text" class="form-control form-check" value="" required="">';
        answer += '</div><div class="col-md-1"><button class="delAnswer">x</button></div></div>';
	$('.add-answer').before(answer);
});

$(document).on('click', ".delAnswer", function () {
	$(this).parent().parent().remove();
});
