/* eslint-disable @typescript-eslint/semi */
import { GitHubError } from '../types'

const API_URL = 'https://api.github.com'
const TOKEN = process.env.GITHUB_TOKEN;
const ISSUE_NUMBER = process.env.GITHUB_ISSUE_NUMBER;
const REPOSITORY = process.env.GITHUB_REPOSITORY;

async function makeRequest (method: 'GET' | 'POST' | 'PUT', url: URL, body?: object): Promise<Response> {
  // eslint-disable-next-line @typescript-eslint/return-await
  return fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28'
    },
    ...(Boolean(body) && { body: JSON.stringify(body) })
  })
}

export async function addLabel (names: string[]): Promise<void> {
  if (TOKEN === undefined || ISSUE_NUMBER === undefined || REPOSITORY === undefined) {
    throw new GitHubError('Missing GitHub environment variables')
  }
  if (names.length === 0) {
    console.log('Ignoring add label request as parameter is empty or null')
    return;
  }
  const url = new URL(`${API_URL}/repos/${REPOSITORY}/issues/${ISSUE_NUMBER}/labels`)

  try {
    const response = await makeRequest('POST', url, { labels: names })
    if (response.status !== 200) {
      throw new GitHubError(`Failed to add label. HTTP Status: ${response.status}`)
    }
  } catch (error) {
    throw new GitHubError('Failed to add label')
  }
}

export async function setLabel (names: string[]): Promise<void> {
  if (TOKEN === undefined || ISSUE_NUMBER === undefined || REPOSITORY === undefined) {
    throw new GitHubError('Missing GitHub environment variables')
  }
  const url = new URL(`${API_URL}/repos/${REPOSITORY}/issues/${ISSUE_NUMBER}/labels`)

  try {
    const response = await makeRequest('PUT', url, { labels: names })
    if (response.status !== 200) {
      throw new GitHubError(`Failed to set label. HTTP Status: ${response.status}`)
    }
  } catch (error) {
    throw new GitHubError('Failed to set label')
  }
}

export async function resetLabels (): Promise<void> {
  await setLabel([])
}

export async function sendComment (body: string): Promise<void> {
  if (TOKEN === undefined || ISSUE_NUMBER === undefined || REPOSITORY === undefined) {
    throw new GitHubError('Missing GitHub environment variables')
  }
  const url = new URL(`${API_URL}/repos/${REPOSITORY}/issues/${ISSUE_NUMBER}/comments`)

  try {
    const response = await makeRequest('POST', url, { body })
    if (response.status !== 201) {
      throw new GitHubError('Failed to send comment')
    }
  } catch (error) {
    throw new GitHubError('Failed to send comment')
  }
}
