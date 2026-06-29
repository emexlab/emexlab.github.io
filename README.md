# emexLabs website
[![Discord invite](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fdiscord.com%2Fapi%2Fv9%2Finvites%2FCbeg3gJzC7&query=profile.member_count&suffix=%20Members&style=for-the-badge&logo=discord&logoColor=fff&label=emex%20lab%20Discord&labelColor=000&color=fff
)](https://discord.gg/Cbeg3gJzC7)
[![Deploy test site](https://img.shields.io/github/actions/workflow/status/emexlab/emexlab.github.io/test_deploy.yml?style=for-the-badge&logo=github&label=Deploy%20test%20site&labelColor=000&color=fff
)](https://github.com/emexlab/emexlab.github.io/actions/workflows/test_deploy.yml)
[![Docusaurus Version](https://img.shields.io/github/package-json/dependency-version/emexlab/emexlab.github.io/%40docusaurus%2Fcore?style=for-the-badge&logo=docusaurus&logoColor=fff&label=Docusaurus&labelColor=000&color=fff
)](https://docusaurus.io/)

[emexlabs.org](https://emexlabs.org/) was built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Todo
emexOS:
- [ ] Port it's homepage ([Original](https://emexos.github.io/web/page/0/index.html)|[Source](https://github.com/emexos/web/tree/main/page/0))

emexDE:
- Documentations to write:
    - [ ] nxtool guide
    - [ ] Syscalls
    - [ ] Entitlement system
    - [ ] Kernel explaination

emex64:
- [ ] Write docs

## Quickstart

```bash
./quickstart.sh
```

This script setups everything for you.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

### Github Pages

You can find an automatic build of the newest state at https://emexlab.github.io/emexDE/

### SSH

```bash
./deploy.sh user@host
```

This will build the site and upload it via ssh to the specified host as the specified user.

> [!NOTE]
> It's recommended to set up SSH keys beforehand. Otherwise, you'll be prompted for your SSH password three times during deployment.
