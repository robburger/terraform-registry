export interface ModuleVersionList {
  modules: ModuleVersionListDetail[]
}

export interface ModuleVersionListDetail {
  source: string
  versions: ModuleVersion[]
}

export interface ModuleVersion {
  version: string
  root?: ModuleVersionRoot
  submodules?: ModuleVersionSubModule[]
}

export interface ModuleVersionRoot {
  providers: ModuleVersionProvider[]
  dependencies: string[] | []
}

export interface ModuleVersionSubModule {
  path: string
  providers: ModuleVersionProvider[]
  dependencies: string[] | []
}

export interface ModuleVersionProvider {
  name: string | ''
  namespace: string | ''
  source: string | ''
  version: string | ''
}
