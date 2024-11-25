import nodemailer from 'nodemailer'
import { DotenvConfig } from '../config/env.config'
interface AccountActivationMailProps {
  email: string;
  subject: string;
  fullname: string;
  token: string;
}
const transporter=nodemailer.createTransport({
  host: DotenvConfig.MAIL_HOST,
  port:DotenvConfig.MAIL_PORT,
  auth:{
    user:DotenvConfig.MAIL_FROM,
    pass:DotenvConfig.MAIL_PASSWORD,
  }
})

export const generateHtml = (body: string) => {
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body style="
            margin: 0;
            font-family: 'Poppins', sans-serif;
            background: #ffffff;
            font-size: 14px;
          ">
      <main>
          ${body}
      </main>
  </body>
  </html>
`
}
export const accountActivationMail = async ({ email, subject, fullname, token }:AccountActivationMailProps) => {
  const mailOption = {
    from: `Esports zone <${process.env.SMTP_MAIL}>`,
    to: email,
    subject,
    html: `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; background-color: #f3f3f3;">
      <tr>
        <td align="center" style="padding: 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; max-width: 600px; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);">
            <tr>
              <td align="center" style="padding: 40px;">
                <h1 style="color: #333333; margin: 0;">Verify Your Email</h1>
                <p style="color: #777777; margin: 20px 0;">Hi, ${fullname},</p>
                <p style="color: #777777; margin: 20px 0;">In order to complete your registration, please click the button below to verify your email:</p>
                <a href="${token}" style="display: inline-block; padding: 10px 20px; background-color: #FF8F40; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `,
  };
  await transporter.sendMail(mailOption);
};
