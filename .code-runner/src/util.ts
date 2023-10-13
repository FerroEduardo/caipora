import fs from 'fs'
import { sendComment, addLabel } from './services/github.js'
import { type CodeData, type Language, compilers, languages, type Compiler, GenericError } from './types.js'

const challengeRegex = /^challenges\/(?<challenge>[\w-]*)\/(?<username>[^/]*)\/(?<filename>.*)$/

export function getChallengeFromPath (filePath: string): string {
  const regexResult = challengeRegex.exec(filePath)
  if (regexResult?.groups === undefined || !Object.hasOwn(regexResult.groups, 'challenge')) {
    throw new GenericError(`Could not find challenge in path: ${filePath}`)
  }
  const { challenge } = regexResult.groups

  return challenge
}
async function validateModifiedFiles (modifiedFiles: string[]): Promise<void> {
  const challenges = new Set()

  modifiedFiles.forEach((filePath) => {
    const challenge = getChallengeFromPath(filePath)

    challenges.add(challenge)
  })

  if (challenges.size > 1) {
    const challengeNames = [...challenges.values()]
    const message = `More than 1 challenge sent. Found: ${challengeNames.join(', ')}`
    await sendComment(message)
    throw new GenericError(message)
  }
}

export async function getModifiedFiles (): Promise<string[]> {
  const modifiedFiles = fs.readFileSync('modified-files.txt', 'utf-8')
    .split('\n')
    .filter((i) => i)

  await validateModifiedFiles(modifiedFiles)

  return modifiedFiles
}

function validateChallengeCodeFilePath (filePath: string): { extension: string, language: Language, compiler: Compiler } {
  if (!fs.existsSync(filePath)) {
    throw new GenericError(`File does not exists: ${filePath}`)
  }

  if (!fs.lstatSync(filePath).isFile()) {
    throw new GenericError(`Path is not file: ${filePath}`)
  }

  const extension = filePath.split('.').pop()
  if (extension === undefined) {
    throw new GenericError(`File extension not found: ${filePath}`)
  }

  const language = languages.find(language => language.extension === extension)
  if (language === undefined) {
    throw new GenericError(`Unknown code extension: ${filePath} - Extension: ${extension}`)
  }

  const compiler = compilers.find(compiler => compiler.language === language.name)
  if (compiler === undefined) {
    throw new GenericError(`Unknown language compiler: ${filePath} - Language: ${language.name}`)
  }

  return {
    extension,
    language,
    compiler
  }
}

export async function getChallengeCodeData (modifiedFiles: string[]): Promise<CodeData> {
  const codeFilePaths = modifiedFiles.filter((filePath) => languages.find((language) => filePath.endsWith(language.extension)))
  if (codeFilePaths.length > 1) {
    await sendComment(`Only one code must be sent.\n- Found: ${codeFilePaths.map((codePath) => `  - ${codePath}\n`).toString()}`)
    await addLabel(['multiple-codes'])
  }
  if (codeFilePaths.length === 0) {
    await sendComment('Code not found')
    await addLabel(['missing-code'])
  }
  const codeFilePath = codeFilePaths[0]

  const { extension, language, compiler } = validateChallengeCodeFilePath(codeFilePath)

  return {
    filePath: codeFilePath,
    extension,
    language,
    compiler,
    getSourceCode: () => fs.readFileSync(codeFilePath, 'utf-8')
  }
}
