import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { Configuration } from 'webpack'
import { yamlParse } from 'yaml-cfn'

/** Interface for AWS SAM Function */
interface ISamFunction {
  Type: string
  Properties: {
    CodeUri?: string
    Handler?: string
    Runtime?: string
  }
}

// Grab Globals and Resources as objects from template yaml
const { Globals, Resources } = yamlParse(readFileSync(join(__dirname, 'template.yaml'), 'utf-8'))

// We use globals as a fallback, so make sure that object exists
const GlobalFunction = Globals?.Function ?? {}

// Where the function source lives
const handlerPath = './src/lambdas'

const entries = Object.values(Resources)
  // Take only the Lambda function resources
  .filter((resource: ISamFunction) => resource.Type === 'AWS::Serverless::Function')
  // Only nodejs Lambda functions
  .filter((resource: ISamFunction) => (resource.Properties?.Runtime ?? GlobalFunction.Runtime).startsWith('nodejs'))
  // Get filename for each function and output directory (if desired)
  .map((resource: ISamFunction) => ({
    filename: resource.Properties.Handler.split('.')[0],
    domain: resource.Properties.CodeUri.split('/').splice(1, 1).join('/'),
    entryPath: resource.Properties.CodeUri.split('/').splice(2, 1).join('/'),
  }))
  // Create hashmap of filename to file path
  .reduce(
    (resources, resource) =>
      Object.assign(resources, {
        [`${resource.domain}/${resource.entryPath}/${resource.filename}`]: `${handlerPath}/${resource.domain}/${resource.filename}.ts`,
      }),
    {},
  )

const config: Configuration = {
  entry: entries,
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
    path: resolve(__dirname, 'build'),
  },
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  module: {
    rules: [{ test: /\.ts$/, loader: 'ts-loader' }],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  target: 'node',
}

export default config
