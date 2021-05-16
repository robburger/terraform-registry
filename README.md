# terraform-registry

An AWS SAM-based Terraform Module and Provider Registry

## Overview

This AWS serverless-based Terraform Registry implements the required API endpoints for privately hosting:

- [Terraform Modules](https://registry.terraform.io/browse/modules)
- [Terraform Providers](https://registry.terraform.io/browse/providers) (coming...)

## Installation

The recommended way to set up your own, private Terraform Registry is by using the pre-configured CloudFormation Template. Management of the Stack is also possible using Terraform.

### Versions

Each release of this Stack is versioned. Wherever you see the template URL `https://sam-terraform-registry.s3.amazonaws.com/latest.json`, you can replace `latest` with `<version>/template.json`. e.g. `https://sam-terraform-registry.s3.amazonaws.com/1.2.3/template.json`

### CloudFormation

[![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=terraform-registry&templateURL=https://sam-terraform-registry.s3.amazonaws.com/latest.json)

1. Log in to your AWS account/role and switch to your desired region. The user performing the installation will need to have the
1. Click the "Launch Stack" button above.
1. Fill in the `prefix` parameter. All other parameters are optional.
1. Click the `[Create stack]` button and wait for the CloudFormation Stack creation to complete.

### Terraform

```hcl
resource "aws_cloudformation_stack" "terraform_registry" {
  name         = "terraform-registry"
  capabilities = ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
  parameters   = {
    Prefix = "my-company-name"
  }
  template_url = "https://sam-terraform-registry.s3.amazonaws.com/latest.json"
}

```

### Upgrading

1. Find the [terraform-registry](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringText=terraform-registry) CloudFormation Stack, if you didn't rename it.
1. ...

### Deleting

1. Find the [terraform-registry](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringText=terraform-registry) CloudFormation Stack, if you didn't rename it.
1. ...

## Contrubuting

I love contributors!

### Requirements

To enable platform-agnostic development, this repo makes use of VSCode's Dev-Container feature to ensure that development environments are consistent. You'll need:

- [VSCode](https://code.visualstudio.com/)
- [Docker](https://www.docker.com/products/docker-desktop)

When opening the cloned repo in VSCode, you'll be prompted to "Reopen in dev-container". This will pull the required Docker images and set up the VSCode environment for development.

### Building

```shell
yarn build
```

### Invoking

When developing endpoints, you can invoke the Lambda commands using the following:

```shell
yarn invoke <domain>/<function-name> Lambda<function-name>
```

e.g.

```shell
yarn invoke file/createPreSignedURL LambdaCreatePreSignedURL
yarn invoke serviceDiscovery/serviceDiscovery LambdaServiceDiscovery
```

Each invocation needs to be passed an `event` - these are JSON documents matching the `APIGatewayProxyEvent` TypeScript type, and are saved in `test > events` under the domain and function name.

### Testing

`jest` is used at the test-runner and the suite can be run with `yarn test`. The same JSON documents used for invoking the function can be used for testing; simply duplicate the document and modify it to match what you're testing for.
