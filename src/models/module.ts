export interface Module {
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
  last_downloaded_at: number
  verified: boolean
  root: ModuleDetail | Record<string, never>
  submodules: ModuleDetail[] | []
  examples: ModuleDetail[] | []
  providers: string[] | []
  versions: string[] | []
}

export interface ModuleDetail {
  path: string
  name: string
  readme: string
  empty: boolean
  inputs: ModuleInput[]
  outputs: ModuleOutput
  dependencies: string[]
  provider_dependencies: ModuleProviderDependency[]
  resources: ModuleResource[]
}

export interface ModuleInput {
  name: string
  type: string
  description: string
  default: string
  required: boolean
}

export interface ModuleOutput {
  name: string
  description: string
}

export interface ModuleProviderDependency {
  name: string
  namespace: string
  source: string
  version: string
}

export interface ModuleResource {
  name: string
  type: string
}
