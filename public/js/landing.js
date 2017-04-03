/**
   * scroll to what section in the landing page
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
   * tscroll to howTo section in the landing page
   * @function
   * @returns {event} click
  */
const scrollToHowto = () => {
  $('#howto-btn').click(() => {
    $('html, body').animate({
      scrollTop: $('#howto').position().top },
        1000
    );
  });
};

/**
   * scroll to charity section in the landing page
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
