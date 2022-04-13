const given = require('../../steps/given')
const when = require('../../steps/when');
const then = require('../../steps/then');

const chance = require('chance').Chance();


describe('Given an authenticates user', () => {
    let user;
    beforeAll(async () => {
        user = await given.an_authenticated_user();
    })

    describe('When he sends a tweet', () => {
        let tweet;
        const text = chance.string({ length: 16 });
        beforeAll(async () => {
            tweet = await when.we_invoke_tweet(user.username, text);
        })

        it('saves the tweet in the Tweets table', async() => {
            await  then.tweet_exists_in_TweetsTable(tweet.id);
        })

        it('saves the tweet in the Timelines table', async() => {
            await  then.tweet_exists_in_TimelinesTable(user.username, tweet.id);
        })

        it('increments the tweet count in user table by 1', async() => {
            await  then.tweetsCount_is_updated_in_UsersTable(user.username, 1);
        })

    })
})