import satori, { init } from 'satori/standalone'
import yogaWasm from 'satori/yoga.wasm?module'

await init(await yogaWasm)

export default satori
