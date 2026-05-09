declare module '*.wasm?module' {
  const mod: WebAssembly.Module | Promise<WebAssembly.Module>
  export default mod
}
