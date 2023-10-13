import { runTests } from './services/tests'
import { GenericError, languages, compilers } from './types'
import {
  getModifiedFiles, getChallengeCodeData, getChallengeFromPath
} from './util'

console.log('Found languages:', languages)
console.log('Found compilers:', compilers)

async function run (): Promise<void> {
  const modifiedFiles = await getModifiedFiles()
  console.log('Modified files:', modifiedFiles)

  const codeData = await getChallengeCodeData(modifiedFiles)
  const { compiler } = codeData
  const sourceCode = codeData.getSourceCode()
  const challenge = await getChallengeFromPath(codeData.filePath)
  console.log('Challenge:', challenge)
  console.log('Challenge language:', codeData.language)
  console.log('Compiler:', compiler)

  await runTests(challenge, compiler, sourceCode)
}

run()
  .catch(error => {
    const message: string = (error instanceof GenericError) ? error.message : 'Unexpected error'
    console.error(message)
    process.exit(1)
  })
