import { Receiver } from '../email.type';
import { lucis_signature } from './lucis-signature';
export const member_left_template = (
  receiver: Receiver,
  leaving_member_name: string,
  team_link,
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
              ${leaving_member_name} just left your team. Please
              immediately visit our system for detailed information.<br />
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
export const checkin_started_template = (
  receiver: Receiver,
  tournament_name: string,
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
              Check-in phase of
              <a
                href="${tour_link}"target="_blank"
              >${tournament_name}</a> tournament has officially started. Please immediately visit our system to check in your tournament. <br/>
              <br/><br/>
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
export const checkin_close_soon_template = (
  receiver: Receiver,
  tournament_name: string,
  close_time: string,
  tour_link,
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
              Check-in phase of
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament will be closed after 15 minutes, on ${close_time}. So as not to miss your check-in, 
              please visit our system as soon as possible.<br /><br />
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
