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
- Build and test
```
npm run test
```
- Commit, push and tag with the version from package.json (prepended with v, so: v1.0.0 for package.json 1.0.0)
- Execute:
```
npm login
npm publish --dry-run
```
- If above is OK, execute:
```
# first publication:
npm publish --access=public
# next publications:
npm publish
```
