# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.166.1/containers/typescript-node/.devcontainer/base.Dockerfile

# [Choice] Node.js version: 14, 12, 10
ARG VARIANT="14-buster"
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        e2fsprogs \
        iptables \
        xfsprogs \
        xz-utils

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node packages
# RUN su node -c "npm install -g <your-package-list -here>"

# Install AWS-CLI and AWS-SAM
RUN set -e \
    && curl -sSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip -q awscliv2.zip \
    && ./aws/install \
    && curl -sSL "https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip" -o "awssamcli.zip" \
    && unzip -q "awssamcli.zip" -d "awssam" \
    && ./awssam/install \
    && rm -rf ./aws*

# Install Docker
ARG DOCKER_VERSION
RUN set -e \
    && curl -sSL "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_VERSION}.tgz" -o docker.tgz \
    && tar --extract --file docker.tgz --strip-components 1 --directory /usr/local/bin/ \
    && rm docker.tgz \
    && addgroup dockremap \
    && addgroup docker \
    && useradd -g dockremap dockremap \
    && echo 'dockremap:165536:65536' >> /etc/subuid \
    && echo 'dockremap:165536:65536' >> /etc/subgid \
    && update-alternatives --set iptables /usr/sbin/iptables-legacy \
    && curl -sSL "https://github.com/docker/compose/releases/latest/download/docker-compose-Linux-x86_64" > /usr/local/bin/docker-compose \
    && chmod +x /usr/local/bin/docker-compose \
    && usermod -g docker node

# Copy DockerD Startup
COPY ./dockerd-start.sh /dockerd-start.sh
