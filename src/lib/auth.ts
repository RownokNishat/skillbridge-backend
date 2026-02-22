import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  trustedOrigins: [process.env.APP_URL!],
  advanced: {
    useSecureCookies: false, // Set to false for localhost
    cookiePrefix: "better-auth",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }: { user: { email: string; name: string }; url: string; token: string }, request?: Request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
        const info = await transporter.sendMail({
          from: '"SkillBridge" <skillbridge@ph.com>',
          to: user.email,
          subject: "Please verify your email!",
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>
<body>
  <div class="container">
    <h2>Verify Your Email Address</h2>
    <p>
        Hello ${user.name} <br /><br />
        Thank you for registering on <strong>SkillBridge</strong>.
        Please confirm your email address to activate your account.
    </p>

    <div class="button-wrapper">
        <a href="${verificationUrl}" class="verify-button">
          Verify Email
        </a>
    </div>
  </div>
</body>
</html>
`
        });

        console.log("Message sent:", info.messageId);
      } catch (err) {
        console.error(err)
        throw err;
      }
    },
  },
  socialProviders: {
     google: {
       clientId: process.env.GOOGLE_CLIENT_ID || "",
       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  }, 
});
