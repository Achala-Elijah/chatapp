import path from 'path'
import { fileURLToPath } from 'url'

// debug-path.mjs


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log("dirpath: ", __dirname)
