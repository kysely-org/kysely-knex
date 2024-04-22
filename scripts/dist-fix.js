// @ts-check
const {readdir, writeFile, readFile} = require('node:fs/promises')
const path = require('node:path')

;(async () => {
  const distPath = path.join(__dirname, '../dist')
  const dist = await readdir(distPath)

  // Inject type declarations for deno.
  // See https://docs.deno.com/runtime/manual/advanced/typescript/types
  await Promise.all([
    ...dist
      .filter((filePath) => filePath.match(/\.m?js$/))
      .filter((filePath) => !filePath.startsWith('chunk-'))
      .map(async (filename) => {
        const distFilePath = path.join(distPath, filename)

        const dtsFilePath = filename.replace(/\.(m?)js$/, '.d.$1ts')
        const denoFriendlyJsFileContents =
          `/// <reference types="${dtsFilePath}" />\n` +
          (await readFile(distFilePath)).toString()

        await writeFile(distFilePath, denoFriendlyJsFileContents)
      }),
  ])
})()
