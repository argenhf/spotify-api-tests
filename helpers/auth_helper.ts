import {expect, chromium} from '@playwright/test'
import axios from 'axios'
import qs from 'qs'
import {TestData} from './test_data'
import {Constants} from './constants'

export {
    getAccessTokenClientCredentials,
    getAccessTokenAuthorizationCode,
}

let accessToken: string

async function getAccessTokenClientCredentials() {
    const formData = {
        grant_type: 'client_credentials',
        client_id: Constants.CLIENT_ID,
        client_secret: Constants.CLIENT_SECRET,
    }

    const headersConfig = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }

    const response = await axios.post(`${Constants.AUTH_URL}/api/token`,
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

    const authUrl = new URL(`${Constants.AUTH_URL}/authorize`)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', Constants.CLIENT_ID)
    authUrl.searchParams.set('scope', Constants.SCOPE)
    authUrl.searchParams.set('redirect_uri', Constants.REDIRECT_URI)

    try {
        await page.goto(authUrl.toString())

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

        const redirectedUrl = page.url()
        const urlParams = new URLSearchParams(redirectedUrl.split('?')[1])
        const authCode = urlParams.get('code')

        const formData = {
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: Constants.REDIRECT_URI,
        }

        const headersConfig = {
            headers: {
                Authorization:
                    `Basic ${Buffer.from(`${Constants.CLIENT_ID}:${Constants.CLIENT_SECRET}`).toString(
                        'base64'
                    )}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }

        const response = await axios.post(`${Constants.AUTH_URL}/api/token`,
            qs.stringify(formData),
            headersConfig
        )

        accessToken = response.data.access_token
        return accessToken
    } catch (error) {
        console.error('Error getting access token:', error)
    } finally {
        await context.close()
    }
}