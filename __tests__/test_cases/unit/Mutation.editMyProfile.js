const chance = require('chance').Chance();
const path = require('path');

const given = require('../../steps/given');
const when = require('../../steps/when');


describe('Mutation.editMyProfile.request template', () => {
    it('Should use "newProfile" fields in expression values', () => {
        const templatePath = path.resolve(__dirname, '../../../mapping-templates/Mutation.editMyProfile.request.vtl')

        const username = chance.guid();
        const newProfile = {
            name: 'Andy',
            imageUrl: null,
            backgroundImageUrl: null,
            bio: 'test buio',
            location: null,
            website: null,
            birthdate: null,
        }
        const context = given.an_appsync_context({ username }, { newProfile });
        const result = when.we_invoke_an_appsync_template(templatePath, context);

        expect(result).toEqual({
            "version" : "2018-05-29",
            "operation" : "UpdateItem",
            "key": {
                "id" : {
                    S: username
                }
            },
            "update" : {
                "expression" : "set #name = :name, imageUrl = :imageUrl, backgroundImageUrl = :backgroundImageUrl, bio = :bio, #location = :location, website = :website, birthdate = :birthdate",
                "expressionNames" : {
                "#name" : "name",
                "#location" : "location"
                },
                "expressionValues" : {
                    ":name" : {
                        S: newProfile.name,
                    },
                    ":imageUrl" : {
                        NULL: true
                    },
                    ":backgroundImageUrl" : {
                        NULL: true
                    },
                    ":bio" : {
                        S: newProfile.bio,
                    },
                    ":location" : {
                        NULL: true
                    },
                    ":website" : {
                        NULL: true
                    },
                    ":birthdate" : {
                        NULL: true
                    },
                }
            },
            "condition" : {
                "expression" : "attribute_exists(id)"
            }
        })
    })
})