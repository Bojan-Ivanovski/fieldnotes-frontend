import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import ts from 'typescript'

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name)
      return entry.isDirectory() ? filesIn(file) : [file]
    }),
  )
  return groups.flat()
}

const files = await filesIn('src')
const fileSet = new Set(files)
const errors = []
let styledComponents = 0

for (const file of files.filter((name) => name.endsWith('.tsx'))) {
  const component = path.basename(file, '.tsx')
  const css = path.join(path.dirname(file), `${component}.css`)
  const source = ts.createSourceFile(
    file,
    await readFile(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  let hasLocalStyling = false
  let importsOwnCss = false

  function inspect(node) {
    if (
      ts.isJsxAttribute(node) &&
      ['className', 'style'].includes(node.name.getText(source))
    ) {
      hasLocalStyling = true
    }
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text
      if (specifier === `./${component}.css`) importsOwnCss = true
      if (
        specifier.startsWith('.') &&
        specifier.endsWith('.css') &&
        specifier !== `./${component}.css` &&
        !(file === 'src/main.tsx' && specifier === './index.css')
      ) {
        errors.push(
          `${file}: import local styles from ./${component}.css, not ${specifier}`,
        )
      }
    }
    ts.forEachChild(node, inspect)
  }
  inspect(source)

  if (!hasLocalStyling && !importsOwnCss) continue
  styledComponents++
  if (path.basename(path.dirname(file)) !== component) {
    errors.push(
      `${file}: place the styled component in a ${component}/ directory`,
    )
  }
  if (!fileSet.has(css))
    errors.push(`${file}: missing colocated ${component}.css`)
  if (!importsOwnCss) errors.push(`${file}: import ./${component}.css directly`)
}

for (const file of files.filter(
  (name) => name.endsWith('.css') && name !== 'src/index.css',
)) {
  const component = path.basename(file, '.css')
  const tsx = path.join(path.dirname(file), `${component}.tsx`)
  if (!fileSet.has(tsx) || path.basename(path.dirname(file)) !== component) {
    errors.push(
      `${file}: component styles must live beside ${component}/${component}.tsx`,
    )
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    `Component style structure checked: ${styledComponents} styled TSX files.`,
  )
}
