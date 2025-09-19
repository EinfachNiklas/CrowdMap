const commander = require("commander");
const { execa } = require("execa");
const fs = require("fs");
const path = require("path");
const ora = require("ora");
const root = path.join(__dirname, "..")
const program = new commander.Command();

program.name("setup").description("Setup CrowdMap Project")

program.command("install-deps").description("Install Dependencies").option("-c, --ci", "use npm clean install").action(async (options) => {
    console.log("Installing Project Dependencies ...");
    let sp;
    try {
        sp = ora(`Installing Dependencies for Root`).start();
        await run("npm", [options.ci ? "ci" : "i"], { cwd: root, stdio: "pipe" });
        sp.succeed("Installation for Root successfull");
        sp = ora("Installing Dependencies for Frontend").start();
        await run("npm", [options.ci ? "ci" : "i"], { cwd: path.join(root, "frontend"), stdio: "pipe" });
        sp.succeed("Installation for Frontend successfull");
        sp = ora("Installing Dependencies for Backend").start();
        await run("npm", [options.ci ? "ci" : "i"], { cwd: path.join(root, "backend"), stdio: "pipe" });
        sp.succeed("Installation for Backend successfull");
    } catch (err) {
        sp.fail("Error while installing Dependencies");
        console.error(err.shortMessage || err.message);
        if (err.stdout) console.error("STDOUT:\n" + err.stdout);
        if (err.stderr) console.error("STDERR:\n" + err.stderr);
        throw err;
    }
});

program.command("copy-env").description("Copy .env.example files to .env in fronden/ und backend/").action(async () => {
    let sp;
    console.log("Copying .env files ...");
    try {
        sp = ora("Copying .env file for Frontend").start();
        let dest = path.join(root, "frontend/.env");
        if (fs.existsSync(dest)) {
            sp.fail(`${dest} already exists`);
        } else {
            fs.copyFileSync(path.join(root, "frontend/.env.example"), dest);
            sp.succeed(`${dest} created`)
        }
        sp = ora("Copying .env file for Backend").start();
        dest = path.join(root, "backend/.env");
        if (fs.existsSync(dest)) {
            sp.fail(`${dest} already exists`);
        } else {
            fs.copyFileSync(path.join(root, "backend/.env.example"), dest);
            sp.succeed(`${dest} created`);
        }
    } catch (err) {
        sp.fail("Error while copying .env files");
        throw err;
    }
});


program.hook("preAction", () => console.log());
program.parseAsync().catch((err) => {
    console.error(err.shortMessage || err.message);
    process.exit(err.exitCode ?? 1);
});


async function run(bin, args = [], opts = {}) {
    return execa(bin, args, {
        stdio: "inherit",
        preferLocal: true,
        ...opts,
    });
}

