import satori, { init } from 'satori/standalone'
import yogaWasm from 'satori/yoga.wasm?module'

await init(yogaWasm)

export default satori
