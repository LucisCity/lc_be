import { Receiver } from '../email.type';
import { lucis_signature } from './lucis-signature';

export const passwordUpdatedTemplate = (receiver: string): string => {
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
    rel="stylesheet" />
</head>

<style>
  @media (max-width: 540px) {
    a {
      padding: 120px 0px;
    }
  }
</style>

<body style="
        background: #e9eaec;
        font-family: 'Roboto', sans-serif;
        padding: 20px 12px;
      ">
  <div class="container" style="
          max-width: 600px;
          margin: 20px auto;
          border: 1px solid #c1c1c1;
          padding: 30px;
          background: #fff;
        ">
    <div class="heading" style="padding-top: 30px">
      <span style="font-size: 14px; line-height: 20px">Hello <b>${receiver},</b></span>
      <div style="font-size: 14px; line-height: 20px; padding-top: 8px">
        <p style="margin: 12px 0px 0px 0px">
          <span style="color: #222 !important">
            Your password has been updated!</br>
            If you made this update then please ignore this email.</br>
            Otherwise, please report back to us as soon as possible.</br></br>
          </span>
        </p>
        <span style="color: #222">Best regards,</span><br />
        <span style="color: #222">Lucis Support Team</span><br /><br />
        ${lucis_signature()}
      </div>
    </div>
  </div>
</body>

</html>`;
};
