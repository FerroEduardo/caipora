import { type Compiler, GodBoltError } from '../types'

async function makeRequest (stdin: string, compiler: Compiler, sourceCode: string): Promise<Response> {
  const url = `https://godbolt.org/api/compiler/${compiler.name}/compile`

  const body = {
    source: sourceCode,
    compiler: compiler.name,
    options: {
      executeParameters: {
        stdin
      },
      compilerOptions: {
        executorRequest: true
      },
      filters: {
        execute: true
      },
      tools: [],
      libraries: []
    }
  }

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    })
  } catch (error) {
    console.error('Execution request failed', error)
    throw new GodBoltError('Execution request failed')
  }

  if (response.status !== 200) {
    const data = await response.text()
    throw new GodBoltError(`Execution request failed. Response: ${data}`)
  }

  return response
}

async function parseResponse (response: Response): Promise<{ stdout: string, stderr: string }> {
  const responseBody = await response.json()
  const stderr = responseBody.stderr.map((out: any) => out.text).join('\n')
  const stdout = responseBody.stdout.map((out: any) => out.text).join('\n')

  // if (responseBody.code !== 0) {
  //   throw new GodBoltError(`Execution failed: ${responseBody}`)
  // }

  return {
    stdout,
    stderr
  }
}

export async function compile (stdin: string, compiler: Compiler, sourceCode: string): Promise<{ stdout: string, stderr: string }> {
  const response = await makeRequest(stdin, compiler, sourceCode)
  const { stdout, stderr } = await parseResponse(response)

  return {
    stdout,
    stderr
  }
}
