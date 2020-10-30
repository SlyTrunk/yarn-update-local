#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const sade = require("sade");
const chalk = require("chalk");
const glob = require("glob");
const findWorkspaceRoot = require("find-yarn-workspace-root");
const pkg = require("./package.json");
const { read } = require("fs");

function readPackageJSON(file) {
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  }
  return null;
}

process.on("unhandledRejection", (err) => {
  throw err;
});

const prog = sade(pkg.name, true);

sade(`${pkg.name} <package> <version>`, true)
  .version(pkg.version)
  .describe(
    "Update dependencies in your workspace to the exact version of the local package"
  )
  .example("yarn-update-local my-package 0.1.0")
  .action((package, version) => {
    main(package, version).then(() => {
      console.log("");
      console.log(chalk.green("Done!"));
    });
  })
  .parse(process.argv);

async function main(package, version) {
  console.log(`Updating ${package} to version ${version}...`);

  const workspaceRoot = findWorkspaceRoot();
  if (!workspaceRoot) throw new Error("Unable to locate package root");

  const workspacePackage = readPackageJSON(`${workspaceRoot}/package.json`);
  const packages = [`${workspaceRoot}/package.json`];

  workspacePackage.workspaces.forEach((workspacePattern) => {
    const pattern = `${workspacePattern}/package.json`;
    packages.push(...glob.sync(pattern));
  });

  packages.forEach((filePath) => {
    const packageJson = readPackageJSON(filePath);

    let dependencies = packageJson.dependencies || {};
    let devDependencies = packageJson.devDependencies || {};
    let peerDependencies = packageJson.peerDependencies || {};

    let hasChanged = false;

    if (dependencies[package]) {
      dependencies[package] = version;
      hasChanged = true;
    }

    if (devDependencies[package]) {
      devDependencies[package] = version;
      hasChanged = true;
    }

    if (peerDependencies[package]) {
      peerDependencies[package] = version;
      hasChanged = true;
    }

    if (hasChanged) {
      fs.writeFileSync(filePath, JSON.stringify(packageJson, null, 2), "utf-8");
      console.log(chalk.green(`✔ Updated version in ${filePath}`));
    }
  });
}
