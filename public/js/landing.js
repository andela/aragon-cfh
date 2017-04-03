// scroll functions
function scroll_to_what() {
    $('#what-btn').click(function(){
    $('html, body').animate({
        scrollTop: $('#what').position().top },
        1000
    );
});
}
function scroll_to_howto() {
    $('#howto-btn').click(function(){
    $('html, body').animate({
        scrollTop: $('#howto').position().top },
        1000
    );
});
}
function scroll_to_charity() {
    $('#charity-btn').click(function(){
    $('html, body').animate({
        scrollTop: $('#charity').position().top },
        1000
    );
});
}