#!/usr/bin/env node

import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import { execSync } from "child_process";
import path from "path";

const program = new Command();

async function createReactApp(appname) {
  console.log(`Creating a new React app named ${appname}...`);
  execSync(`npx create-react-app ${appname}`, { stdio: "inherit" });
}

async function createViteApp(appname) {
  console.log(`Creating a new Vite app named ${appname}...`);
  execSync(`npm init vite@latest ${appname} -- --template react`, {
    stdio: "inherit",
  });
  process.chdir(appname);
  execSync("npm install", { stdio: "inherit" });
}

async function setupTailwind() {
  console.log("Setting up Tailwind CSS...");
  execSync("npm install -D tailwindcss postcss autoprefixer", {
    stdio: "inherit",
  });
  execSync("npx tailwindcss init -p", { stdio: "inherit" });

  const tailwindConfig = `
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {},
  },
  plugins: [],
};`;
  fs.writeFileSync("tailwind.config.js", tailwindConfig);

  const tailwindCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;`;
  fs.writeFileSync("src/index.css", tailwindCSS);
}

async function createFolders() {
  console.log("Creating folder structure...");
  const folders = [
    "src/app/contexts",
    "src/app/hook",
    "src/app/services",
    "src/assets/icon",
    "src/assets/images",
    "src/components/core",
    "src/components/router",
    "src/components/sections",
    "src/constants",
    "src/lib",
    "src/pages",
    "src/util",
    "public",
  ];

  folders.forEach((folder) => {
    fs.ensureDirSync(folder);
  });
}

program
  .arguments("<appname>")
  .description("Set up a new project with Tailwind CSS")
  .action(async (appname) => {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "projectType",
        message: "Which type of project would you like to create?",
        choices: ["React", "Vite"],
      },
    ]);

    const projectType = answers.projectType.toLowerCase();

    if (projectType === "react") {
      await createReactApp(appname);
      process.chdir(appname);
    } else if (projectType === "vite") {
      await createViteApp(appname);
    } else {
      console.error('Invalid project type. Please specify "react" or "vite".');
      process.exit(1);
    }
    await setupTailwind();
    await createFolders();
  });

program.parse(process.argv);
