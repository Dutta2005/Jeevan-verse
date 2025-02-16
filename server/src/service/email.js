import nodemailer from 'nodemailer';
import bloodBridgeTemplate from './emailTemplates/bloodBridge.js';


const sendBloodRequestEmail = async ({ to, bloodGroup, city, requestId }) => {
    try {

        const transporter = nodemailer.createTransport({
            host: process.env.NODE_ENV === "production" ? "smtp.gmail.com" : process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
            port: process.env.NODE_ENV === "production" ? 465 : process.env.MAILTRAP_PORT || 2525,
            secure: process.env.NODE_ENV === "production", // true for 465, false for other ports
            auth: {
                user: process.env.NODE_ENV === "production" ? process.env.GMAIL_USER : process.env.MAILTRAP_USER,
                pass: process.env.NODE_ENV === "production" ? process.env.GMAIL_PASS : process.env.MAILTRAP_PASS,
            }
        });

        const mailOptions = {
            from: process.env.MAIL_FROM || '"BloodBridge" <noreply@bloodbridge.com>',
            to,
            subject: `Urgent: Blood Request for ${bloodGroup} in ${city}`,
            html: bloodBridgeTemplate({
                bloodGroup,
                city,
                requestId,
                frontendUrl: process.env.FRONTEND_URL
            })
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

export { sendBloodRequestEmail };