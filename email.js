var nodemailer = require('nodemailer');
const fs = require('fs');
const path = require("path");
const handlebars = require("handlebars");


module.exports = {
    async sendEmail(email, subject, url, token) {
        const filePath = path.join(__dirname, '/emails/password.html');
        const source = fs.readFileSync(filePath, 'utf-8').toString();
        const template = handlebars.compile(source);
        
        const TOKEN = {
            token: token
        }
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: "darayuthhang12@gmail.com",
            pass: "Banita!@3"
          }
        });
        const mailOptions = {
          from: email,
          to: email,
          subject: subject,
          text: url,
          html: template(TOKEN)
        };
        const info = await transporter.sendMail(mailOptions);
        return info;
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", "https://mailtrap.io/inboxes/test/messages/");
      
      }
}


