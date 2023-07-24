import nodemailer from "nodemailer";
import { origin } from "../../../../config.js";

export default async function handler(req, res) {
  const { to, from, subject, filename, size, time, link } = req.body;

  if (!to || !subject || !filename || !size || !time || !link) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  // Calculate time remaining
  const now = Date.now();
  const expires = parseInt(time);
  const timeRemaining = expires - now;

  // Format time remaining in human-readable format
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const millisecondsPerHour = 60 * 60 * 1000;

  let expiresText;
  if (timeRemaining >= millisecondsPerDay) {
    const days = Math.floor(timeRemaining / millisecondsPerDay);
    expiresText = `${days} day${days > 1 ? "s" : ""}`;
  } else {
    const hours = Math.ceil(timeRemaining / millisecondsPerHour);
    expiresText = `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  const emailContent = `<!DOCTYPE html>
  <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: "Montserrat", Arial, Helvetica, sans-serif;
          font-weight: 500;
          background-color: #1e1e1e;
          width: 100%;
          max-width: 100% !important;
        }
  
        h1 {
          font-weight: 400;
        }
        h3 {
          font-weight: 500;
        }
  
        a,
        a[href] {
          text-decoration: none !important;
          color: #1e1e1e;
        }
        a:hover,
        a[href]:hover {
          color: #ff8d00;
          text-decoration: none !important;
        }
        a:visited {
          color: #ff8d00;
          text-decoration: none !important;
        }
  
        .container {
          background-color: #1e1e1e;
          padding: 2.5em 0 2em 0;
          text-align: center;
        }
  
        .inner-wrapper {
          padding: 2em 0;
          background-color: #fff;
        }
  
        .logo {
          display: inline-block;
        }
  
        .title {
          color: #1e1e1e;
          margin-top: 1em;
          text-align: center;
        }
  
        .filename {
          color: #1e1e1e;
          text-align: center;
        }
        .row {
          display: flex;
          justify-content: space-between;
          margin-top: 1em;
        }
  
        .column {
          flex-basis: 50%;
          text-align: center;
          padding: 0 1em;
        }
  
        .col-right {
          text-align: left;
          padding-left: 1em;
        }
        .col-left {
          text-align: right;
          padding-right: 1em;
        }
  
        a.link {
          display: inline-block;
          margin-top: 1em;
          padding: 1em 1.5em;
          background-color: #ff8d00;
          color: #1e1e1e;
          text-decoration: none;
          border: solid #1e1e1e;
          border-width: 2px 4px 4px 2px;
          border-radius: 12px;
        }
  
        a:hover,
        a[href]:hover {
          color: #ff8d00 !important;
          text-decoration: none !important;
        }
  
        a.link:hover,
        a[href].link:hover {
          display: inline-block;
          margin-top: 1em;
          padding: 1em 1.5em;
          color: #ff8d00 !important;
          background-color: #ffffff !important;
          text-decoration: none !important;
          border: solid #ff8d00 !important;
          border-width: 2px 4px 4px 2px !important;
          border-radius: 12px;
        }
  
        .download-header {
          text-align: center;
          margin-top: 3.5em;
        }
  
        .download-link {
          margin-top: 0.5em;
          text-align: center;
        }
  
        .container-footer {
          background-color: #1e1e1e;
          text-align: center;
          padding: 1.5em 0 3em 0;
          color: #fff;
          font-size: 12px;
          font-weight: 400;
        }
  
        .footer-links {
          margin-top: 1em;
          padding: 0 1em;
          display: flex;
          justify-content: center;
        }
  
        .footer-link {
          color: #fff;
          text-decoration: none;
          padding: 0 1em;
        }
  
        a.footer-link,
        a[href].footer-link {
          color: #fff;
        }
  
        a.footer-link:hover,
        a[href].footer-link:hover {
          color: #ff8d00 !important;
          text-decoration: none !important;
        }
      </style>
    </head>
    <body
      style="
        margin: 0;
        padding: 0;
        font-family: 'Montserrat', Arial, Helvetica, sans-serif;
        font-weight: 500;
        background-color: #1e1e1e;
        width: 100%;
        max-width: 100% !important;
      "
    >
      <div
        class="container"
        style="
          background-color: #1e1e1e;
          padding: 2.5em 0 2em 0;
          text-align: center;
        "
      >
        <a href="https://ambr.link/">
          <img
            width="125px"
            class="logo"
            src="${origin}/ambr-logo-white.png"
            alt="Ambr"
          />
        </a>
      </div>
  
      <div class="inner-wrapper" style="padding: 2em 0; background-color: #fff">
        <div
          class="title"
          style="color: #1e1e1e; margin-top: 1em; text-align: center"
        >
          <h1>You've got a file</h1>
        </div>
  
        <div class="filename" style="color: #1e1e1e; text-align: center">
          <h2>${filename}</h2>
        </div>
  
        <div
          class="row"
          style="display: table; width: 100%; text-align: center; margin-top: 1em"
        >
          <div
            class="column col-left"
            style="
              display: table-cell;
              width: 50%;
              text-align: right;
              padding: 0 1em 0 0em;
            "
          >
            <p>File Size: ${size}</p>
          </div>
          <div
            class="column col-right"
            style="
              display: table-cell;
              width: 50%;
              text-align: left;
              padding: 0 0em 0 1em;
            "
          >
            <p>Expires In: ${expiresText}</p>
          </div>
        </div>
  
        <div class="download-link" style="margin-top: 0.5em; text-align: center">
          <a
            class="link"
            href="${link}"
            style="
              display: inline-block;
              margin-top: 1em;
              padding: 1em 1.5em;
              background-color: #ff8d00;
              color: #1e1e1e;
              text-decoration: none;
              border: solid #1e1e1e;
              border-width: 2px 4px 4px 2px;
              border-radius: 12px;
            "
            >Go to secure download</a
          >
        </div>
  
        <div
          class="download-header"
          style="text-align: center; margin-top: 3.5em"
        >
          <p style="padding: 0 3em 0em 3em;">If the button above is not visible, here is the secure download link:</p>
        </div>
  
        <div class="download-link" style="margin-top: 0.5em; text-align: center">
          <p>
            <a href="${link}" style="color: #1e1e1e; text-decoration: none"
              >${link}</a
            >
          </p>
        </div>
      </div>
  
      <div
        class="container-footer"
        style="
          background-color: #1e1e1e;
          text-align: center;
          padding: 1.5em 0 3em 0;
          color: #fff;
          font-size: 12px;
          font-weight: 400;
          width: 100%;
        "
      >
        <div
          class="footer-links"
          style="
            margin-top: 1em !important;
            padding: 0 0;
            display: inline-table !important;
            text-align: center !important;
            min-width: 16rem !important;
            width: 18rem !important;
          "
        >
          <a
            class="footer-link"
            href="https://ambr.link/terms"
            style="
              color: #fff;
              text-decoration: none;
              padding: 0 0;
              display: table-cell !important;
              text-align: center;
            "
            >Terms</a
          >
          <a
            class="footer-link"
            href="https://ambr.link/privacy"
            style="
              color: #fff;
              text-decoration: none;
              padding: 0 0;
              display: table-cell !important;
              text-align: center;
            "
            >Privacy</a
          >
          <a
            class="footer-link"
            href="https://ambr.link/security"
            style="
              color: #fff;
              text-decoration: none;
              padding: 0 0;
              display: table-cell !important;
              text-align: center;
            "
            >Security</a
          >
        </div>
      </div>
    </body>
  </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.REACT_APP_MAILR_ADDR,
        pass: process.env.REACT_APP_MAILR_PW,
      },
    });

    const message = {
      from: process.env.REACT_APP_MAILR_ADDR,
      bcc: to,
      subject: subject,
      html: emailContent,
    };

    const info = await transporter.sendMail(message);
    //console.log("Message sent: %s", info.messageId);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
}
