export default interface ImportService<T = URL> {
  scan(vam: URL): Promise<void>
  import(data: T): Promise<void>
}
