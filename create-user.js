require('dotenv').config();
const AWS = require('aws-sdk');

const id = '4c14cf1b-8571-474f-8052-a63586314821';

const cognito = new AWS.CognitoIdentityServiceProvider()

const userPoolId = process.env.COGNITO_USER_POOL_ID
const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID


const createUser = async() => {
    const signUpResp = await cognito.signUp({
        ClientId: clientId,
        Username: 'andy.m.russell@me.com',
        Password: 'password',
        UserAttributes: [
          { Name: 'name', Value: 'Andy' }
        ]
      }).promise()
    
      const username = signUpResp.UserSub;

      console.log('Created User with id:', username);
    
      // Do we need to verify the email at all?
      await cognito.adminUpdateUserAttributes({
        UserPoolId: userPoolId,
        Username: username,
        UserAttributes: [
          { Name: 'email_verified', Value: 'True' }
        ]
      }).promise();
    
      await cognito.adminConfirmSignUp({
        UserPoolId: userPoolId,
        Username: username,
        // ClientMetadata: { email_verified: 'true' },
      }).promise()
};


createUser();