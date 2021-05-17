#!/bin/bash -e

# Exit if there's no build directory
if [[ ! -d ./build/ ]]; then
  echo "Missing build directory. Have you run 'yarn build'?"
  exit 1
fi

# Cleanup any old CloudFormation templates
rm -rf ./build/*.yaml

# Get the version from package.json and run 'sam package' to upload zipped code to S3 Bucket
VERSION=$(node --eval="process.stdout.write(require('./package.json').version)")
sam package --s3-prefix "$VERSION" "$@"

# Get the config suffix, if any
SUFFIX=$(sed -r 's|\.\/build\/latest(.*)\.yaml|\1|' <<< "$(ls ./build/latest*)")

# Replace the SAM-generated bucket name with the template reference
sed -i -r "s| s3://sam-terraform-registry$SUFFIX/(.*)|\n        Bucket:\n          Ref: S3BucketFunctionCode\n        Key: \1|g" "./build/latest$SUFFIX.yaml"

# Update the 'Version' constant to match package.json
sed -i -r "s|<CODE_VERSION_PLACEHOLDER>|$VERSION|g" "./build/latest$SUFFIX.yaml"

# Upload the modified CloudFomation template to version-specific key and overwite latest.yaml
aws s3 cp "./build/latest$SUFFIX.yaml" "s3://sam-terraform-registry$SUFFIX/latest.yaml" --region eu-west-1
aws s3 cp "./build/latest$SUFFIX.yaml" "s3://sam-terraform-registry$SUFFIX/$VERSION/template.yaml" --region eu-west-1
