require("dotenv").config();
const fs = require("fs");
const AWS = require("aws-sdk");
const Velocity = require("velocityjs");

const { signUpUser } = require('../lib/auth');

// const velocityMapper = require('amplify-appsync-simulator/lib/velocity/value-mapper/mapper');
// const velocityTemplate = require('amplify-velocity-template')

const GraphQL = require('../lib/graphql');

const a_user_signs_up = async (password, name, email) => {
  return await signUpUser(password, name, email);
};

const we_invoke_confirmUserSignup = async (username, name, email) => {
  const handler = require("../../functions/confirm-user-signup").handler;

  const context = {};
  const event = {
    version: "1",
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userName: username,
    triggerSource: "PostConfirmation_ConfirmSignUp",
    request: {
      userAttributes: {
        sub: username,
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
        email_verified: "false",
        name: name,
        email: email,
      },
    },
    response: {},
  };

  console.log("event", event);
  await handler(event, context);
};

const we_invoke_an_appsync_template = (templatePath, context) => {
  const template = fs.readFileSync(templatePath, { encoding: "utf-8" });
  // OLD WAY (FROM DEMO)
  // const ast = velocityTemplate.parse(template)
  // const compiler = new velocityTemplate.Compile(ast, {
  //   valueMapper: velocityMapper.map,
  //   escape: false
  // })
  // return JSON.parse(compiler.render(context))

  var asts = Velocity.parse(template);
  const res = new Velocity.Compile(asts, {
    // valueMapper: velocityMapper.map,
    // escape: false,
  }).render(context);

  return JSON.parse(res);
};

const a_user_calls_getMyProfile = async (user) => {
  const getMyProfile = `
    query getMyProfile{
      getMyProfile {
        name
        tweetsCount
        screenName
        website
        location
        likesCounts
        imageUrl
        id
        followingCount
        followersCount
        createdAt
        birthdate
        bio
        backgroundImageUrl
      }
    }
  `;
    const data = await GraphQL(process.env.API_URL, getMyProfile, {}, user.accessToken);
    const profile = data.getMyProfile;

    console.log(`[${user.username}] - fetched profile`);
    return profile;
};

const a_user_calls_editMyProfile = async (user, input) => {
  const editMyProfile = `
    mutation editMyProfile($input: ProfileInput!){
      editMyProfile(newProfile: $input) {
        name
        tweetsCount
        screenName
        website
        location
        likesCounts
        imageUrl
        id
        followingCount
        followersCount
        createdAt
        birthdate
        bio
        backgroundImageUrl
      }
    }
  `;
  
  const variables = {
    input,
  }
    const data = await GraphQL(process.env.API_URL, editMyProfile, variables, user.accessToken);
    const profile = data.editMyProfile;

    console.log(`[${user.username}] - edited profile`);
    return profile;
}

const we_invoke_getImageUploadUrl = async (username, extension, contentType) => {
  const handler = require("../../functions/get-upload-url").handler;

  const context = {};
  const event = {
    identity: {
      username
    },
    arguments: {
      extension,
      contentType
    }
  };

  return await handler(event, context);
};

const a_user_calls_getImageUploadUrl = async (user, extension, contentType) => {
  const getImageUploadUrl = `query getImageUploadUrl($extension: String, $contentType: String) {
    getImageUploadUrl(extension: $extension, contentType: $contentType)
  }`
  const variables = {
    extension,
    contentType
  }

  const data = await GraphQL(process.env.API_URL, getImageUploadUrl, variables, user.accessToken);
  const url = data.getImageUploadUrl

  console.log(`[${user.username}] - got image upload url`)

  return url
}

const we_invoke_tweet = async (username, text) => {
  const handler = require("../../functions/tweet").handler;

  const context = {};
  const event = {
    identity: {
      username
    },
    arguments: {
      text
    }
  };

  return await handler(event, context);
};

const a_user_calls_tweet = async (user, text) => {
  const tweet = `mutation tweet($text: String!) {
    tweet(text: $text) {
      id
      createdAt
      text
      replies
      likes
      retweets
    }
  }`
  const variables = {
    text,
  }

  const data = await GraphQL(process.env.API_URL, tweet, variables, user.accessToken);
  const url = data.tweet

  console.log(`[${user.username}] - posted a new tweet`)

  return url
}

module.exports = {
  we_invoke_confirmUserSignup,
  a_user_signs_up,
  we_invoke_an_appsync_template,
  a_user_calls_getMyProfile,
  a_user_calls_editMyProfile,
  we_invoke_getImageUploadUrl,
  a_user_calls_getImageUploadUrl,
  we_invoke_tweet,
  a_user_calls_tweet,
};
