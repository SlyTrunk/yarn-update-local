# yarn-update-local

Update all instances of a local workspace package's dependencies with an exact version. This makes it easy to bump versions of packages and allow for your workspace to still use local workspace packages rather than those packages getting installed through node_modules.

## Usage

Use it on the command line:

```
$ yarn-update-local my-package 0.1.1
```

It also works great with `postversion` in package.json when used with `yarn version`:

```
"name": "my-package",
"scripts": {
    "postversion": "yarn-update-local my-package $npm_package_version"
}
```

```
$ yarn workspace my-package version --patch
```
