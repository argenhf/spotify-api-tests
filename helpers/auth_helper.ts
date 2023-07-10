import { expect, chromium } from '@playwright/test'
import axios from 'axios'
import qs from 'qs'
import { TestData } from './test_data.ts'

export {
  getAccessTokenClientCredentials,
  getAccessTokenAuthorizationCode
}

let accessToken

const CLIENT_ID = '9785f9cad5e045efad0400a1a8d0ca7b'
const CLIENT_SECRET = '083a1297cd5540b6b1baca46176cddb7'
const SCOPE = 'user-follow-modify user-follow-read playlist-modify-public playlist-modify-private playlist-read-private'
const REDIRECT_URI = 'https://example.com/callback'

async function getAccessTokenClientCredentials() {
  const formData = {
    grant_type: 'client_credentials',
    client_id: `${CLIENT_ID}`,
    client_secret: `${CLIENT_SECRET}`
  }

  const headersConfig = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify(formData),
    headersConfig
  )

  accessToken = response.data.access_token
  return accessToken
}

async function getAccessTokenAuthorizationCode() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${SCOPE}&redirect_uri=${REDIRECT_URI}`
  )
  await page.locator('#login-username').fill(TestData.email)
  await page.locator('#login-password').fill(TestData.password)
  await page.locator('#login-button').click()
  await page.waitForNavigation()

  const agreeButton = await page.getByRole('button').getByText('Agree')

  if (await agreeButton.isVisible()) {
    await agreeButton.click()
  } else {
    await expect(page).toHaveTitle('Example Domain')
  }

  const redirectedUrl = await page.url()
  const urlParams = await new URLSearchParams(redirectedUrl.split('?')[1])
  const authCode = await urlParams.get('code')

  await context.close()

  const formData = {
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: REDIRECT_URI
  }

  const headersConfig = {
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify(formData),
    headersConfig
  )

  accessToken = response.data.access_token
  return accessToken
}