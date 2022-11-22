# Extra information for developers

## Development

### Installation (for development)
- Clone this repository
- `cd` into the cloned directory
- Install dependencies: `npm i`
- Build: `npm run build`

### Usage (for development)
See [public usage](README.md#usage), however:
- execute in the repository root directory
- replace the command `graphql-ld-querying` with `node ./dist/bin/cli.js`.
- the `examples` directory is already at the right place: nothing to do here

## Publishing

- Update version in package.json
- Commit, push and tag with the version from package.json
- Execute:
```
npm login
npm publish --dry-run
```
- If above is OK, execute:
```
npm publish
```
