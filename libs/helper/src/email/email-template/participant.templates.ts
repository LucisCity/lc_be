import { Receiver } from '../email.type';
import { lucis_signature } from './lucis-signature';
export const register_success_template = (
  receiver: Receiver,
  team_name: string,
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
              Congratulations, ${
                team_name.length > 0
                  ? 'Your team ' + team_name + ' has'
                  : 'You have'
              } successfully registered for 
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament .<br />
              Please immediately visit our system for detailed information.<br /><br/>
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
export const left_tour_template = (
  receiver: Receiver,
  team_name: string,
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
              ${
                team_name.length > 0
                  ? 'Your team ' + team_name + ' has'
                  : 'You have'
              }
              just left 
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament .<br />
              Please immediately visit our system for detailed information.<br /><br />
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
export const tour_updated_template = (
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
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament has just been updated. Please visit
              our system immediately for more information. <br /><br />
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
export const match_start_soon_template = (
  receiver: Receiver,
  round_name: string,
  start_time: string,
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
              Your match in ${round_name} of 
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament will be started in less than 15 minutes, on ${start_time}.<br />
              Are you ready to fight? Visit our system now!!!<br /><br />
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
export const match_started_template = (
  receiver: Receiver,
  round_name: string,
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
              Your match in ${round_name} of
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament has officially started. Please immediately visit our system so as not to miss your match.
              <br /><br />
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
export const tour_closed_not_confirmed_template = (
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
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament has officially closed. <br />
              The tournment results are in the process of being confirmed and will
              be announced soon. <br />
              Thank you for participating!<br /><br/>
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
export const claim_earnings_template = (
  receiver: Receiver,
  tournament_name: string,
  tournament_rank: string,
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
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament has officially closed. The tournament results:<br />
              ${tournament_rank} Please visit our system immediately to claim
              your earnings.<br /><br />
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

export const notify_match_result_template = (
  receiver: Receiver,
  round_name: string,
  tournament_name: string,
  won: boolean,
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
              We ${
                won
                  ? 'are glad to inform you that you have won'
                  : 'regret to inform you that you have lost'
              } your match in ${round_name} of 
              <a
                href="${tour_link}"
                target="_blank"
              >${tournament_name}</a> tournament. <br/>
              Lucis hopes that we can grow on our next journey together. We will always be here with you.<br /><br/>
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
