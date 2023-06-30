import { test, expect } from '@playwright/test'
import { getAccessTokenClientCredentials } from '../helpers/auth_helper.ts'
import { TestData } from '../helpers/test_data.ts'

let accessToken

test.beforeAll(async () => {
  accessToken = await getAccessTokenClientCredentials()
})

test('Get artist', async ({ request }) => {
  const response = await request.get(`/v1/artists/${TestData.artistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const responseBody = await response.json()
  expect(response.status()).toBe(200)
  expect(responseBody.name).toBe('Radiohead')
})

test('Get multiple artists', async ({ request }) => {
  const response = await request.get(`/v1/artists/?ids=${TestData.artistIds}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const responseBody = await response.json()
  expect(response.status()).toBe(200)
  expect(responseBody.artists[0].name).toBe('deadmau5')
  expect(responseBody.artists[1].name).toBe('Avicii')
})