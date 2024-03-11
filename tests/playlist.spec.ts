import {test, expect} from '@playwright/test'
import {getAccessTokenAuthorizationCode} from '../helpers/auth_helper'
import {TestData} from '../helpers/test_data'

let accessToken: string
let playlistId: string

test.beforeAll(async () => {
    accessToken = await getAccessTokenAuthorizationCode()
})

test.describe.serial('Create playlist, add items, get items, unfollow playlist', async () => {
    test('Create a playlist', async ({request}) => {
        const response = await request.post(`/v1/users/${TestData.userId}/playlists`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                'name': 'New Playlist',
                'description': 'New playlist description',
                'public': false
            }
        })

        const responseBody = await response.json()
        expect(response.status()).toBe(201)
        expect(responseBody.name).toBe('New Playlist')
        playlistId = responseBody.id
    })

    test('Add items to playlist', async ({request}) => {
        const response = await request.post(`/v1/playlists/${playlistId}/tracks`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            data: {
                'uris': `${TestData.itemIds}`.split(','),
                'position': 0
            }
        })

        expect(response.status()).toBe(201)
    })

    test('Get items from the playlist', async ({request}) => {
        const response = await request.get(`/v1/playlists/${playlistId}/tracks`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })

        const responseBody = await response.json()
        expect(response.status()).toBe(200)
        expect(responseBody.items[0].track.name).toBe('Scar Tissue')
    })

    test('Unfollow playlist', async ({request}) => {
        const response = await request.delete(`/v1/playlists/${playlistId}/followers`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        })

        expect(response.status()).toBe(200)
    })
})