import nodemailer, { Transporter } from "nodemailer";
import { emitWarning } from "process";

class SendEmail {
  async sendEmail(mailOptions: {
    email: string;
    subject: string;
    code: string;
  }): Promise<boolean> {
    try {
      const transporter: Transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSKEY,
        },
      });

      const info = await transporter.sendMail({
        to: mailOptions.email,
        html: `<div>
        <p>${mailOptions.subject} </p>
        <div><h1>${mailOptions.code}</h1></div>
        </div>`, // html body
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export default SendEmail;
