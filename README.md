# Platform.sh Actions

[![GitHub Super-Linter](https://github.com/axelerant/platformsh-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/axelerant/platformsh-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/axelerant/platformsh-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/axelerant/platformsh-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action provides deployment features to Platform.sh and clears PR
environments on PR merge.

## Inputs

### `action`

- `deploy`: Deploys to Platform.sh.
- `clean-pr-env`: Deactivates and deletes the environment on Platform.sh that
  was created when the PR was opened. This should only be used on the `closed`
  pull_request event.

### `project-id`

The project ID on Platform.sh. You can find this using the CLI or the web
console.

### `cli-token`

A token to access the Platform.sh API. See instructions in the
[Platform.sh docs](https://docs.platform.sh/development/cli/api-tokens.html).

### `ssh-private-key` (optional)

The Platform.sh CLI generates a temporary certificate for deployment. However,
you may still choose to provide a private key that lets you push via Git. Create
a specialized key used _only_ for deployment and use GitHub secrets to keep your
key safe.

### `cli-version`

The Platform.sh CLI version to use. Default: `latest`.

### `force-push`

An option to force push changes to the project repository on Platform.sh. Use
with caution as force push overrides your commit history.

### `environment-name`

The name of the Platform.sh instance on which to act. Default: The current
branch name.

### `parent-environment-name`

The name of the Platform.sh instance to branch from.

## Outputs

### `deployed-url`

The environment URL from platform.sh after successful deployment.

## Example Usage

### Deployment

```yaml
- name: Check out repository code
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
- name: Deploy to platform.sh
  uses: axelerant/platformsh-action@v2
  with:
    action: 'deploy'
    project-id: ${{ secrets.PlatformProjectId }}
    cli-token: ${{ secrets.PlatformCliToken }}
    ssh-private-key: ${{ secrets.PlatformSshKey }}
    force-push: true
```

### Delete PR Env

```yaml
uses: axelerant/platformsh-action@v2
with:
  action: 'clean-pr-env'
  project-id: ${{ secrets.PlatformProjectId }}
  cli-token: ${{ secrets.PlatformCliToken }}
```
