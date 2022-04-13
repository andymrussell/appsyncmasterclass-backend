require("dotenv").config();
const AWS = require("aws-sdk");

const signUpUser = async (password, name, email) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID;

  const signUpResp = await cognito
    .signUp({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "name", Value: name }],
    })
    .promise();

  const username = signUpResp.UserSub;
  console.log(`[${email}] - user has signed up [${username}]`);

  // Do we need to verify the email at all?
//   await cognito
//     .adminUpdateUserAttributes({
//       UserPoolId: userPoolId,
//       Username: username,
//       UserAttributes: [{ Name: "email_verified", Value: "True" }],
//     })
//     .promise();

  console.log(`[${email}] - verified email`);

  await cognito
    .adminConfirmSignUp({
      UserPoolId: userPoolId,
      Username: username,
      // ClientMetadata: { email_verified: 'true' },
    })
    .promise();

  console.log(`[${email}] - confirmed sign up`);

  return {
    username,
    name,
    email,
  };
};

module.exports = {
  signUpUser,
};
