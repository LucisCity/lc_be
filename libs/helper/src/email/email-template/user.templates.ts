import { Receiver } from '../email.type';
import { lucis_signature } from './lucis-signature';

export const verify_email_template = (
  receiver: string,
  link: string,
): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Email</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&family=Saira:wght@300;400;600;900&display=swap"
        rel="stylesheet"
      />
    </head>
  
    <style>
      @media (max-width: 540px) {
        a {
          padding: 120px 0px;
        }
      }
    </style>
  
    <body
      style="
        background: #e9eaec;
        font-family: 'Roboto', sans-serif;
        padding: 20px 12px;
      "
    >
      <div
        class="container"
        style="
          max-width: 600px;
          margin: 20px auto;
          border: 1px solid #c1c1c1;
          padding: 30px;
          background: #fff;
        "
      >
        <div class="heading" style="padding-top: 30px">
          <span style="font-size: 14px; line-height: 20px"
            >Hello <b>${receiver},</b></span
          >
          <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
            <p style="margin: 12px 0px 0px 0px">
              <span style="color: #222 !important"
                >Please click the button below to verify your email address.</span
              >
            </p>
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 26px 0px;
              "
            >
              <a
                href="${link}"
                style="
                  background: #0f0f0f;
                  padding: 8px 20px;
                  border-radius: 16px;
                  border: none;
                  outline: none;
                  color: #fff;
                  font-size: 13px;
                  line-height: 20px;
                  font-weight: 600;
                  cursor: pointer;
                  box-shadow: rgba(27, 31, 35, 0.15);
                  text-align: center;
                  margin: 0px auto;
                  text-decoration: none;
                "
              >
                Verify Email
              </a>
            </div>
            <span style="color: #222">Best regards,</span><br />
            <span style="color: #222">Lucis Support Team</span><br /><br/>
            ${lucis_signature()}
          </div>
        </div>
      </div>
    </body>
  </html>  
`;
};

export const successful_donation_template = (
  receiver: Receiver,
  donation_receiver: string,
  donation_amount: string,
  tour_link: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&family=Saira:wght@300;400;600;900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    @media (max-width: 540px) {
      a {
        padding: 120px 0px;
      }
    }
  </style>

  <body
    style="
      background: #e9eaec;
      font-family: 'Roboto', sans-serif;
      padding: 20px 12px;
    "
  >
    <div
      class="container"
      style="
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #c1c1c1;
        padding: 30px;
        background: #fff;
      "
    >
      <div
        class="im_banner"
        style="
          min-height: 180px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          background-image: url(https://yt3.ggpht.com/V_UCjMY57-4VtfZNsk5kOpBrDnmw-zHgvOfKi2lUosq1shsjXCXrSzgqjCcTppVDfDeP_iTxRA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj);
        "
      ></div>
      <div class="heading" style="padding-top: 30px">
        <span style="font-size: 14px; line-height: 20px"
          >Hello <b>${receiver.name},</b></span
        >
        <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
          <p style="margin: 12px 0px 0px 0px">
            <span style="color: #222 !important">
              Congratulations on your successfully donation:<br />
              - Recipient: ${donation_receiver} <br />
              - Amount: ${donation_amount} <br />
              Feel free to contact us if you have any questions via
              <a href="mailto:lucis_tournament@lucis.network">lucis_tournament@lucis.network</a>! <br/>
              <a
                href="${tour_link}"
                target="_blank"
              >
                <span>Go to tournament!</span>
              </a><br /><br/>
            </span>
          </p>
          <span style="color: #222">Best regards,</span><br />
          <span style="color: #222">Lucis Support Team</span><br /><br/>
          ${lucis_signature()}
        </div>
      </div>
    </div>
  </body>
</html>

`;
};

export const added_to_team_template = (
  receiver: Receiver,
  leader_name: string,
  team_name: string,
  team_link: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&family=Saira:wght@300;400;600;900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    @media (max-width: 540px) {
      a {
        padding: 120px 0px;
      }
    }
  </style>

  <body
    style="
      background: #e9eaec;
      font-family: 'Roboto', sans-serif;
      padding: 20px 12px;
    "
  >
    <div
      class="container"
      style="
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #c1c1c1;
        padding: 30px;
        background: #fff;
      "
    >
      <div
        class="im_banner"
        style="
          min-height: 180px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          background-image: url(https://yt3.ggpht.com/V_UCjMY57-4VtfZNsk5kOpBrDnmw-zHgvOfKi2lUosq1shsjXCXrSzgqjCcTppVDfDeP_iTxRA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj);
        "
      ></div>
      <div class="heading" style="padding-top: 30px">
        <span style="font-size: 14px; line-height: 20px"
          >Hello <b>${receiver.name},</b></span
        >
        <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
          <p style="margin: 12px 0px 0px 0px">
            <span style="color: #222 !important">
              You have just been added to a team by ${leader_name}:<br />
              - Team name: ${team_name}<br />
              - Leader: ${leader_name}<br />
              Please immediately visit our system for detailed information.<br />
              <a
                href="${team_link}"
                target="_blank"
               >
                <span>Go to your profile!</span>
              </a><br /><br/>
            </span>
          </p>
          <span style="color: #222">Best regards,</span><br />
          <span style="color: #222">Lucis Support Team</span><br /><br/>
          ${lucis_signature()}
        </div>
      </div>
    </div>
  </body>
</html>

`;
};
export const removed_from_team_template = (
  receiver: Receiver,
  leader_name: string,
  team_name: string,
  team_link: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&family=Saira:wght@300;400;600;900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    @media (max-width: 540px) {
      a {
        padding: 120px 0px;
      }
    }
  </style>

  <body
    style="
      background: #e9eaec;
      font-family: 'Roboto', sans-serif;
      padding: 20px 12px;
    "
  >
    <div
      class="container"
      style="
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #c1c1c1;
        padding: 30px;
        background: #fff;
      "
    >
      <div
        class="im_banner"
        style="
          min-height: 180px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          background-image: url(https://yt3.ggpht.com/V_UCjMY57-4VtfZNsk5kOpBrDnmw-zHgvOfKi2lUosq1shsjXCXrSzgqjCcTppVDfDeP_iTxRA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj);
        "
      ></div>
      <div class="heading" style="padding-top: 30px">
        <span style="font-size: 14px; line-height: 20px"
          >Hello <b>${receiver.name},</b></span
        >
        <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
          <p style="margin: 12px 0px 0px 0px">
            <span style="color: #222 !important">
              You have just been removed from ${team_name} team by
              ${leader_name}. Please immediately visit our system for detailed
              information.<br />
              <a
                href="${team_link}"
                target="_blank"
              >
                <span>Go to your profile!</span>
              </a><br /><br/>
            </span>
          </p>
          <span style="color: #222">Best regards,</span><br />
          <span style="color: #222">Lucis Support Team</span><br /><br/>
          ${lucis_signature()}
        </div>
      </div>
    </div>
  </body>
</html>

`;
};
export const team_deleted_template = (
  receiver: Receiver,
  leader_name: string,
  team_name: string,
  team_link: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&family=Saira:wght@300;400;600;900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    @media (max-width: 540px) {
      a {
        padding: 120px 0px;
      }
    }
  </style>

  <body
    style="
      background: #e9eaec;
      font-family: 'Roboto', sans-serif;
      padding: 20px 12px;
    "
  >
    <div
      class="container"
      style="
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #c1c1c1;
        padding: 30px;
        background: #fff;
      "
    >
      <div
        class="im_banner"
        style="
          min-height: 180px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          background-image: url(https://yt3.ggpht.com/V_UCjMY57-4VtfZNsk5kOpBrDnmw-zHgvOfKi2lUosq1shsjXCXrSzgqjCcTppVDfDeP_iTxRA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj);
        "
      ></div>
      <div class="heading" style="padding-top: 30px">
        <span style="font-size: 14px; line-height: 20px"
          >Hello <b>${receiver.name},</b></span
        >
        <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
          <p style="margin: 12px 0px 0px 0px">
            <span style="color: #222 !important">
              ${team_name} team has been deleted by ${leader_name}.
              Please immediately visit our system for detailed information.<br />
              <a
                href="${team_link}"
                target="_blank"
              >
                <span>Go to your profile!</span>
              </a><br /><br/>
            </span>
          </p>
          <span style="color: #222">Best regards,</span><br />
          <span style="color: #222">Lucis Support Team</span><br /><br/>
          ${lucis_signature()}
        </div>
      </div>
    </div>
  </body>
</html>

`;
};
export const got_donated_template = (
  receiver: Receiver,
  recipient: string,
  donor_name: string,
  amount: string,
  tour_link: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&family=Saira:wght@300;400;600;900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    @media (max-width: 540px) {
      a {
        padding: 120px 0px;
      }
    }
  </style>

  <body
    style="
      background: #e9eaec;
      font-family: 'Roboto', sans-serif;
      padding: 20px 12px;
    "
  >
    <div
      class="container"
      style="
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #c1c1c1;
        padding: 30px;
        background: #fff;
      "
    >
      <div
        class="im_banner"
        style="
          min-height: 180px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          background-image: url(https://yt3.ggpht.com/V_UCjMY57-4VtfZNsk5kOpBrDnmw-zHgvOfKi2lUosq1shsjXCXrSzgqjCcTppVDfDeP_iTxRA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj);
        "
      ></div>
      <div class="heading" style="padding-top: 30px">
        <span style="font-size: 14px; line-height: 20px"
          >Hello <b>${receiver.name},</b></span
        >
        <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
          <p style="margin: 12px 0px 0px 0px">
            <span style="color: #222 !important">
              We are glad to inform you that ${
                recipient == 'you' ? 'you have' : `${recipient} has`
              } been donated:<br/>
              - Donor: ${donor_name}<br/>
              - Amount: ${amount}<br/>
              ${
                recipient.includes('your tournament')
                  ? ''
                  : "Don't forget to claim it on our system when the tournament's over!<br/>"
              } 
              <a
                href="${tour_link}"
                target="_blank"
              >
                <span>Go to tournament!</span>
              </a><br />
              Feel free to contact us if you have any questions via <a href="mailto:lucis_tournament@lucis.network">lucis_tournament@lucis.network</a>!<br/><br/>
            </span>
          </p>
          <span style="color: #222">Best regards,</span><br />
          <span style="color: #222">Lucis Support Team</span><br /><br/>
          ${lucis_signature()}
        </div>
      </div>
    </div>
  </body>
</html>

`;
};

export const reset_password_template = (
  receiver: Receiver,
  reset_password_link: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&family=Saira:wght@300;400;600;900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    @media (max-width: 540px) {
      a {
        padding: 120px 0px;
      }
    }
  </style>

  <body
    style="
      background: #e9eaec;
      font-family: 'Roboto', sans-serif;
      padding: 20px 12px;
    "
  >
    <div
      class="container"
      style="
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #c1c1c1;
        padding: 30px;
        background: #fff;
      "
    >
      <div
        class="im_banner"
        style="
          min-height: 180px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          background-image: url(https://yt3.ggpht.com/V_UCjMY57-4VtfZNsk5kOpBrDnmw-zHgvOfKi2lUosq1shsjXCXrSzgqjCcTppVDfDeP_iTxRA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj);
        "
      ></div>
      <div class="heading" style="padding-top: 30px">
        <span style="font-size: 14px; line-height: 20px"
          >Hello <b>${receiver.name},</b></span
        >
        <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
          <p style="margin: 12px 0px 0px 0px">
            <span style="color: #222 !important"
              >If you've lost your password or wish to reset it, please click on the button below.</span
            >
          </p>
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 26px 0px;
            "
          >
            <a
              href="${reset_password_link}"
              style="
                background: #0f0f0f;
                padding: 8px 20px;
                border-radius: 16px;
                border: none;
                outline: none;
                color: #fff;
                font-size: 13px;
                line-height: 20px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: rgba(27, 31, 35, 0.15);
                text-align: center;
                margin: 0px auto;
                text-decoration: none;
              "
            >
              Reset Password
            </a>
          </div>
          <p>
            If you're having trouble clicking on the "Reset Password" button, copy and paste the URL below into your web browser: <br/>
            ${reset_password_link} <br/><br/>
            If you did not request a password reset, you can safely ignore this email.
            Only a person with access to your email can reset your account password.
          </p>
          <span style="color: #222">Best regards,</span><br />
          <span style="color: #222">Lucis Support Team</span><br /><br/>
          ${lucis_signature()}
        </div>
      </div>
    </div>
  </body>
</html>
  `;
};

export const got_prizes_template = (
  receiver: Receiver,
  prizes: string,
  profile_link: string,
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400&family=Saira:wght@300;400;600;900&display=swap"
      rel="stylesheet"
    />
  </head>

  <style>
    @media (max-width: 540px) {
      a {
        padding: 120px 0px;
      }
    }
  </style>

  <body
    style="
      background: #e9eaec;
      font-family: 'Roboto', sans-serif;
      padding: 20px 12px;
    "
  >
    <div
      class="container"
      style="
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #c1c1c1;
        padding: 30px;
        background: #fff;
      "
    >
      <div
        class="im_banner"
        style="
          min-height: 180px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
          background-image: url(https://yt3.ggpht.com/V_UCjMY57-4VtfZNsk5kOpBrDnmw-zHgvOfKi2lUosq1shsjXCXrSzgqjCcTppVDfDeP_iTxRA=w1707-fcrop64=1,00005a57ffffa5a8-k-c0xffffffff-no-nd-rj);
        "
      ></div>
      <div class="heading" style="padding-top: 30px">
        <span style="font-size: 14px; line-height: 20px"
          >Hello <b>${receiver.name},</b></span
        >
        <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
          <p style="margin: 12px 0px 0px 0px">
            <span style="color: #222 !important">
              Congratulations! You have received the following prizes:<br/>
              ${prizes}<br/>
              <a
                href="${profile_link}"
                target="_blank"
              >
                <span>Go to your inventory</span>
              </a> to see the prizes you got.<br />
              Feel free to contact us if you have any questions via <a href="mailto:lucis_tournament@lucis.network">lucis_tournament@lucis.network</a>!<br/><br/>
            </span>
          </p>
          <span style="color: #222">Best regards,</span><br />
          <span style="color: #222">Lucis Support Team</span><br /><br/>
          ${lucis_signature()}
        </div>
      </div>
    </div>
  </body>
</html>

`;
};
