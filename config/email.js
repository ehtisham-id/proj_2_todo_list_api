const nodemailer = require('nodemailer');
const pino = require('pino');

const logger = pino();

export const emailClient = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async (to, subject, text) => {
    try {
        await emailClient.sendMail({
            from: `"No Reply" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text
        });
        logger.info(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
        logger.error(`Error sending email to ${to}: ${error.message}`);
    }
};