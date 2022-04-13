require("dotenv").config();

const chance = require('chance').Chance();
const path = require('path');

const then = require('../../steps/then');
const given = require('../../steps/given');
const when = require('../../steps/when');


describe('Given an authenticated user', () => {
    let user;
    beforeAll(async () => {
        user = await given.an_authenticated_user();
    });

    it('the user can get hisprofile with getmyProfile', async () => {

        const profile = await when.a_user_calls_getMyProfile(user);

        expect(profile).toMatchObject({
            id: user.username,
            name: user.name,
            // screenName: null,
            imageUrl: null,
            backgroundImageUrl: null,
            bio: null,
            location: null,
            website: null,
            birthdate: null,
            createdAt: expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g),
            // tweets
            followersCount: 0,
            followingCount: 0,
            tweetsCount: 0,
            likesCounts: 0,
        })

        const [firstName, lastName] = user.name.split(' ')
        expect(profile.screenName).toContain(firstName)
        expect(profile.screenName).toContain(lastName)
    })

    it('the user can get a URL to upload new profile image', async () => {
        const uploadUrl = await when.a_user_calls_getImageUploadUrl(user, '.png', 'image/png');
        const { BUCKET_NAME } = process.env;
        const regex = new RegExp(`https://${BUCKET_NAME}.s3-accelerate.amazonaws.com/${user.username}/.*\.png\?.*Content-Type=image%2Fpng.*`);
        expect(uploadUrl).toMatch(regex);

        const filePath = path.join(__dirname, '../../data/logo.png');
        await then.user_can_uplaod_image_to_url(uploadUrl, filePath, 'image/png');

        const downloadUrl = uploadUrl.split('?')[0];
        await then.user_can_download_image_from(downloadUrl);
    });

    it('the user can edit his profile with edit my profile', async () => {
        const input = {
            name: chance.first(),
        }

        const profile = await when.a_user_calls_editMyProfile(user, input);

        expect(profile).toMatchObject({
            id: user.username,
            name: user.name,
            // screenName: null,
            imageUrl: null,
            backgroundImageUrl: null,
            bio: null,
            location: null,
            website: null,
            birthdate: null,
            createdAt: expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g),
            // tweets
            followersCount: 0,
            followingCount: 0,
            tweetsCount: 0,
            likesCounts: 0,
            ...input,
        })

        const [firstName, lastName] = user.name.split(' ')
        expect(profile.screenName).toContain(firstName)
        expect(profile.screenName).toContain(lastName)
    })
})