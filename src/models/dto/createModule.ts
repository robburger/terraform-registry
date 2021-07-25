export interface CreateModuleDTO {
  id: string
  owner: string
  namespace: string
  name: string
  version: string
  provider: string
  description: string
  location: string
  checksum: string
  published_at: number
  downloads: number
}
