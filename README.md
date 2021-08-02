# terraform-registry

An AWS SAM-based Terraform Module and Provider Registry

## Overview

This AWS serverless-based Terraform Registry implements the required API endpoints for privately hosting:

- [Terraform Modules](https://registry.terraform.io/browse/modules)
- [Terraform Providers](https://registry.terraform.io/browse/providers) (coming...)

## Installation

The recommended way to set up your own, private Terraform Registry is by using the pre-configured CloudFormation Template. Management of the Stack is also possible using Terraform.

### Versions

Each release of this Stack is versioned. Wherever you see the template URL `https://sam-terraform-registry.s3.eu-west-1.amazonaws.com/latest.yaml`, you can replace `latest` with `<version>/template.json`. e.g. `https://sam-terraform-registry.s3.eu-west-1.amazonaws.com/1.2.3/template.json`

### CloudFormation

[![Launch Stack](https://cdn.rawgit.com/buildkite/cloudformation-launch-stack-button-svg/master/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/new?stackName=terraform-registry&templateURL=https://sam-terraform-registry.s3.eu-west-1.amazonaws.com/latest.yaml)

1. Log in to your AWS account/role and switch to your desired region. The user performing the installation will need to have sufficient IAM permissions to do so.
1. Click the "Launch Stack" button above.
1. Fill in the `Prefix` and `CustomDomainName` parameters, and select the `HostedZoneID` from the dropdown. All other parameters are optional.
1. Click the `[Create stack]` button and wait for the CloudFormation Stack creation to complete.

### Terraform

```hcl
resource "aws_cloudformation_stack" "terraform_registry" {
  name         = "terraform-registry"
  capabilities = ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"]
  parameters   = {
    Prefix           = "my-company-name"
    CustomDomainName = "t-reg.my-company-name.com"
    HostedZoneID     = data.aws_route53_zone.this.zone_id
  }
  template_url = "https://sam-terraform-registry.s3.eu-west-1.amazonaws.com/latest.yaml"
}
```

### Upgrading

1. Find the [terraform-registry](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringText=terraform-registry) CloudFormation Stack, if you didn't rename it.
1. Click the `[Update]` button.
1. Select the `Replace current template` option.
1. Enter the URL of the template, either `https://sam-terraform-registry.s3.eu-west-1.amazonaws.com/latest.yaml` or a version-specific one, then click `[Next]`.
1. Update any additional parameters you wish to change, then click `[Next]`.
1. Update any stack tags and options, then click `[Next]`.
1. Wait for the "Change set preview" to complete, review it and click `[Update stack]`.

### Deleting

1. Find the [terraform-registry](https://console.aws.amazon.com/cloudformation/home#/stacks?filteringText=terraform-registry) CloudFormation Stack, if you didn't rename it.
1. Click the `[Delete]` button.
1. Click the `[Delete stack]` button.

## Usage

Once the CloudFormation Stack has been successfully deployed, the Terraform Registry API will be available at https://t-reg.my-company-name.com/, the custom domain name you provided.

### Uploading a module

1. In your CI pipeline, or locally, zip your module directory (the directory that contains your `.tf` files):

   ```bash
   $ cd my-terraform-module
   # The following zip command will place the compressed file in the parent folder
   $ zip -r ../module.zip *
   ```

1. Get a pre-signed URL where you can upload the module to:
   ```bash
   $ PUT_URL=$(curl -X POST -ssL https://t-reg.my-company-name.com/pre-sign?type=module -d '{"namespace":"my-company","name":"bucket","provider":"aws","version":"1.0.0"}' | jq -r '.url')
   ```
1. Upload the module:
   ```bash
   $ curl -sSL $PUT_URL -T ../module.zip
   ```

Once uploaded, an event will be triggered and a DynamoDB record will be created with the module metadata.

### Using a module

1. In your Terraform config, specify your custom URL as the source for a module:

   ```hcl
   module "my_bucket" {
     source  = "t-reg.my-company-name.com/my-company/bucket/aws"
     version = "~> 1.0"

     ...
   }
   ```

Additional documentation can be found on the Terraform website: [Private Registry Module Sources](https://www.terraform.io/docs/registry/modules/use.html#private-registry-module-sources)

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

Each invocation needs to be passed an `event` - these are JSON documents matching the data received from the service sending it, in this case, either the `APIGatewayProxyEvent` or `SQSEvent` TypeScript type, and are saved in `test > events` under the domain and function name.

### Testing

`jest` is used at the test-runner and the suite can be run with `yarn test`. The same JSON documents used for invoking the function can be used for testing; simply duplicate the document and modify it to match what you're testing for.
