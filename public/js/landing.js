/**
   * trim, remove special characters, white spaces and special characters
   * remove word duplicates
   * @function
   * @returns {event} click
  */
const scrollToWhat = () => {
  $('#what-btn').click(() => {
    $('html, body').animate({
      scrollTop: $('#what').position().top },
        1000
    );
  });
};

/**
   * trim, remove special characters, white spaces and special characters
   * remove word duplicates
   * @function
   * @returns {event} click
  */
const scrollToHowto = () => {
  $('#howto-btn').click(function(){
    $('html, body').animate({
      scrollTop: $('#howto').position().top },
        1000
    );
  });
};

/**
   * trim, remove special characters, white spaces and special characters
   * remove word duplicates
   * @function
   * @returns {event} click
  */
const scrollToCharity = () => {
  $('#charity-btn').click(() => {
    $('html, body').animate({
      scrollTop: $('#charity').position().top },
        1000
    );
  });
};
