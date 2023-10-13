import fs from 'fs'
import path from 'path'
import { compile } from './godbolt.js'
import { sendComment } from './github.js'
import { type Compiler, type TestResult, GenericError } from '../types.js'

function getTestData (parentTestPath: string, testName: string): { stdout: string, stdin: string } {
  const currentTestPath = path.resolve(parentTestPath, testName)
  const testStdin = path.resolve(currentTestPath, 'stdin.txt')
  const testStdout = path.resolve(currentTestPath, 'stdout.txt')

  if (!fs.existsSync(testStdin) || !fs.existsSync(testStdout)) {
    throw new GenericError('Stdin/stdout test does not exists')
  }

  if (!fs.lstatSync(testStdin).isFile() || !fs.lstatSync(testStdout).isFile()) {
    throw new GenericError('Stdin/stdout is not file')
  }

  const testStdinContent = fs.readFileSync(testStdin, 'utf-8')
  const testStdoutContent = fs.readFileSync(testStdout, 'utf-8')

  return {
    stdin: testStdinContent,
    stdout: testStdoutContent
  }
}

async function sendReportMessage (successes: TestResult[], failures: TestResult[]): Promise<void> {
  const message: string = '# Report\n' +
    `## Successes:\n${
      successes.map((result) => `- ${result.test}`).join('\n')
    }\n` +
    '## Failures:\n' +
      failures.map((result) => `- ${result.test}\n` +
        `  - Expected: "${result.expected}"\n` +
        `  - Actual: "${result.actual}"\n` +
        `  - stdin: "${result.stdin}"\n` +
        ((result.stderr.length > 0) ? `  - stderr:\n\`\`\`\n${result.stderr}\n\`\`\`` : '') +
        '\n------'
      ).join('\n') +
    '\n' +
    '## Summary:\n' +
    `Successes: ${successes.length}\nFailures: ${failures.length}\nTotal: ${successes.length + failures.length}`

  await sendComment(message)
}

export async function runTests (challenge: string, compiler: Compiler, sourceCode: string): Promise<void> {
  const parentTestPath = path.resolve('challenges', challenge, '.tests')
  const testDirectoryNames = fs.readdirSync(parentTestPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  const failures: TestResult[] = []
  const successes: TestResult[] = []

  for (const test of testDirectoryNames) {
    const testData = getTestData(parentTestPath, test)
    const { stdout, stderr } = await compile(testData.stdin, compiler, sourceCode)
    const testResult: TestResult = {
      test,
      stdin: testData.stdin,
      expected: testData.stdout,
      actual: stdout,
      stderr
    }
    if (testResult.expected !== testResult.actual) {
      console.error(`# Test '${test}': failed\nExpected: "${testResult.expected}"\nActual: "${testResult.actual}"`)
      if (testResult.stderr.length > 0) {
        console.error(`\nstderr:\n"${testResult.stderr}"`)
      }
      failures.push(testResult)
    } else {
      console.log(`# Test '${test}': success`)
      successes.push(testResult)
    }
  }

  console.log(`Total: ${successes.length + failures.length} - Successes: ${successes.length} - Failures: ${failures.length}`)
  await sendReportMessage(successes, failures)
  if (failures.length > 0) {
    throw new GenericError('Code testing failed')
  }
}
