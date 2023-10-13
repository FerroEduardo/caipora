export interface Language {
  readonly extension: string
  readonly name: string
}

export const languages: Language[] = [
  { extension: 'java', name: 'java' },
  { extension: 'py', name: 'python' },
  { extension: 'c', name: 'c' },
  { extension: 'cpp', name: 'c++' },
  { extension: 'c++', name: 'c++' }
]

export interface Compiler {
  readonly language: string
  readonly name: string
}

export const compilers: Compiler[] = [
  { language: 'java', name: 'java2100' },
  { language: 'c', name: 'cg132' },
  { language: 'c++', name: 'g132' },
  { language: 'python', name: 'python311' }
]

export class GenericError extends Error {};
export class GitHubError extends GenericError {};
export class GodBoltError extends GenericError {};

export interface TestResult {
  test: string
  stdin: string
  expected: string
  actual: string
  stderr: string
}

export interface CodeData {
  filePath: string
  extension: string
  language: Language
  compiler: Compiler
  getSourceCode: () => string
}
