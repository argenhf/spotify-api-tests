import {test, expect} from '@playwright/test'
import {getAccessTokenAuthorizationCode} from '../helpers/auth_helper'
import {TestData} from '../helpers/test_data'

let accessToken: string

test.beforeAll(async () => {
    accessToken = await getAccessTokenAuthorizationCode()
})

test.describe.serial('Follow and unfollow artists and check followings', async () => {
    test('Follow artist', async ({request}) => {
        const response = await request.put('/v1/me/following', {
            params: {
                type: 'artist',
                ids: TestData.artistIds
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                ids: TestData.artistIds
            }
        })

        expect(response.status()).toBe(204)
    })

    test('Check if artists are followed', async ({request}) => {
        const response = await request.get('/v1/me/following/contains', {
            params: {
                type: 'artist',
                ids: TestData.artistIds
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        const responseBody = await response.json()
        expect(response.status()).toBe(200)
        expect(responseBody).toEqual([true, true])
    })

    test('Unfollow artists', async ({request}) => {
        const response = await request.delete('/v1/me/following', {
            params: {
                type: 'artist',
                ids: TestData.artistIds
            },
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                ids: TestData.artistIds
            }
        })

        expect(response.status()).toBe(204)
    })

    test('Check if artists are no longer followed', async ({request}) => {
        const response = await request.get('/v1/me/following/contains', {
            params: {
                type: 'artist',
                ids: TestData.artistIds
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })

        const responseBody = await response.json()
        expect(response.status()).toBe(200)
        expect(responseBody).toEqual([false, false])
    })
})