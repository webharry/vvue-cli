#!/usr/bin/env node
const program = require('commander');
const download = require('download-git-repo')
const inquirer = require('inquirer')
const handlebars = require('handlebars');
const fs = require("fs")
const ora = require('ora')
const chalk = require('chalk');
const symbols = require('log-symbols');


//下载模板
program.version('1.0.0', '-v, --version')
    .command('init <templateName> <name>')
    .action((templateName, name) => {
        if (!fs.existsSync(name)) {
            //命令行交互
            inquirer.prompt([
                {
                    name: 'description',
                    message: 'Project description'
                },
                {
                    name: 'author',
                    message: 'Author'
                }
            ]).then((answers) => {
                const spinner = ora('Downloading template...')
                spinner.start()

                download('github:webharry/'+ (templateName ? templateName : 'webpack'), name, { clone: true }, (err) => {
                    if(err){
                        spinner.fail();
                        console.log(symbols.error, chalk.red('create project failed:',err));
                    }else{
                        spinner.succeed()
                        const fileName = `${name}/package.json`

                        const meta = {
                            name,
                            description: answers.description,
                            author: answers.author
                        }
                        if(fs.existsSync(fileName)){
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                        }
                        console.log(symbols.success, chalk.green('Project initialization completed'));
                    }
                })
            })
        }else{
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('Project already exists'));
        }
    });

program.parse(process.argv);
