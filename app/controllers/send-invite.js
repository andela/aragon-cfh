const nodemailer = require('nodemailer');
require('dotenv').load();

module.exports = (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.NM_EMAIL,
      pass: process.env.NM_PASSWORD
    }
  });
  const mailOptions = {
    from: process.env.NM_EMAIL,
    to: req.body.inviteeEmail,
    subject: "You've been invited to play Cards for Humanity!",
    html: `<p>Hi, ${req.body.inviteeName}</p>\
    <p>Your friend ${req.body.inviterName} is inviting you to play Cards of Humanity.</p>\
    <p><a href="${req.body.gameURL}">Follow this link</a> to play!</p><br /><br />\
    <p>Cards for Humanity is a fast-paced online version of the popular card game,\
    <a href="cardsagainsthumanity.com">Cards Against Humanity</a>, that gives you the\
    opportunity to donate to children in need.</p>`
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
      res.json(err);
    } else {
      console.log('Message sent: ' + info.response);
      res.status(200).send({
        message: `Invite sent to ${mailOptions.to}!`,
      });
    }
  });
};
