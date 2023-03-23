import Zip from 'adm-zip'

export default async function fromZip(zip: Zip, path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    zip.getEntry(path)?.getDataAsync((data, err) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
