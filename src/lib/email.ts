import nodemailer from "nodemailer";

export type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!process.env.EMAIL_SERVER_HOST) {
    console.log("[email] skipped (no SMTP configured)", { to, subject });
    return { skipped: true } as const;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_SERVER_USER!,
      pass: process.env.EMAIL_SERVER_PASSWORD!,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });

  return { sent: true } as const;
}


