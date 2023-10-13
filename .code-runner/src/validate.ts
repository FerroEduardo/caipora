import {
  getModifiedFiles, getChallengeCodeData
} from './util'
import { GenericError, languages, compilers } from './types'

import { resetLabels, addLabel } from './services/github'

console.log('Found languages:', languages)
console.log('Found compilers:', compilers)

async function run (): Promise<void> {
  await resetLabels()

  const modifiedFiles = await getModifiedFiles()
  console.log('Modified files:', modifiedFiles)

  const codeData = await getChallengeCodeData(modifiedFiles)
  console.log({ codeData })

  const label = `language-${codeData.language.name}`
  await addLabel([label])
}

run()
  .catch(error => {
    const message: string = (error instanceof GenericError) ? error.message : 'Unexpected error'
    console.error(message)
    process.exit(1)
  })
