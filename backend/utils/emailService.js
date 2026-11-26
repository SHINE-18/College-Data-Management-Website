const nodemailer = require('nodemailer');

const smtpPort = Number(process.env.SMTP_PORT || 587);
if (process.env.SMTP_HOST && (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535)) {
    throw new Error('SMTP_PORT must be a valid TCP port');
}
const transportOptions = process.env.SMTP_HOST
    ? { host: process.env.SMTP_HOST, port: smtpPort, secure: smtpPort === 465, requireTLS: smtpPort !== 465 }
    : { service: process.env.EMAIL_SERVICE || 'gmail' };
const transporter = nodemailer.createTransport({
    ...transportOptions,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send a broadcast email to all students and faculty
 * @param {string} subject - Email subject
 * @param {string} text - Email body (text)
 * @param {string} html - Email body (html)
 * @param {Array} recipients - Array of email addresses
 */
const sendBroadcastEmail = async (subject, text, html, recipients) => {
    if (!recipients || recipients.length === 0) return;

    const mailOptions = {
        from: { name: 'VGEC CE Department', address: process.env.EMAIL_FROM || process.env.EMAIL_USER },
        bcc: recipients, // Use BCC for mass emails to protect privacy
        subject,
        text,
        html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Broadcast email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error("Email send failed:", error);
        throw error;
    }
};

/**
 * Generate and send email notification for a new notice/circular
 * @param {Object} item - The notice or circular object
 * @param {string} type - 'Notice' or 'Circular'
 * @param {Array} emails - List of recipient emails
 */
const notifyNewPost = async (item, type, emails) => {
    const subject = `New ${type}: ${item.title}`;
    const text = `A new ${type} has been posted on the VGEC CE Department portal.\n\nTitle: ${item.title}\nCategory: ${item.category}\nDate: ${new Date(item.createdAt).toLocaleDateString()}\n\nPlease login to the portal to view details.`;

    // Simple HTML template
    const html = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0;">VGEC CE Department</h2>
            </div>
            <div style="padding: 20px;">
                <h3 style="color: #1e40af;">New ${type} Published</h3>
                <p><strong>Title:</strong> ${item.title}</p>
                <p><strong>Category:</strong> ${item.category}</p>
                <p><strong>Date:</strong> ${new Date(item.createdAt).toLocaleDateString()}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 14px;">This is an automated notification. Please do not reply to this email.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: block; width: fit-content; margin: 20px auto; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">Login to Portal</a>
            </div>
        </div>
    `;

    return sendBroadcastEmail(subject, text, html, emails);
};

/**
 * Send a single email (e.g., for password reset)
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: { name: 'VGEC CE Department', address: process.env.EMAIL_FROM || process.env.EMAIL_USER },
        to,
        subject,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email send failed:', error);
        throw error;
    }
};

module.exports = { notifyNewPost, sendBroadcastEmail, sendEmail };
