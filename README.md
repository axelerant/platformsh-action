# Platform.sh actions

This action provides deployment feature to platform.sh and clear PR env on PR merge.

## Inputs

### `action`

- `deploy`: Deploys to platform.sh
- `clean-pr-env`: Deactivates and deleted the enviroment from platform.sh which was created on PR open. This should only on `closed` pull_request event.

### `project-id`

The project ID on platform.sh. You can find this using the CLI or the web console.

### `cli-token`

A token to access platform.sh API. See instructions on [platform.sh docs](https://docs.platform.sh/development/cli/api-tokens.html).

### `ssh-private-key` (optional)

The platform.sh CLI generates a temporary certificate for use for deployment. However, you may still choose to provide a private key that lets you push via git. Create a specialized key used _only_ for deployment and use Github secrets to keep your key safe.

### `cli-version`

The Platform.sh CLI version to use. Default: `latest`.

### `force-push`

An option to force push changes to the project repository on Platform.sh. Use with caution as force push overrides your commit history.

### `environment-name`

The name of the platform.sh instance on which to act. Default: The current branch name.

## Outputs

No outputs.

## Example usage

### Deployement

```yaml
uses: zeshanziya/platformsh-actions@v1
with:
  action: 'deploy'
  project-id: ${{ secrets.PlatformProjectId }}
  cli-token: ${{ secrets.PlatformCliToken }}
  ssh-private-key: ${{ secrets.PlatformSshKey }}
  force-push: true
```

### Delete PR Env

```yaml
uses: zeshanziya/platformsh-actions@v1
with:
  action: 'clean-pr-env'
  project-id: ${{ secrets.PlatformProjectId }}
  cli-token: ${{ secrets.PlatformCliToken }}
```
