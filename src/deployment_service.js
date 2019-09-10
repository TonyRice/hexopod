GIT_REPO = process.env.GIT_REPO ? process.env.GIT_REPO : 'https://github.com/TonyRice/hexoblog.git';

var Git = require("nodegit");
var npm = require('npm');

const path = require("path");

module.exports = {
    watch: () => {

        // watch for the latest changes!

    },
    build: (repoUrl) => {
        console.log('Cloning', repoUrl)
        const blogPath = path.resolve(__dirname, "../blog/");

        var previous = process.cwd();
        return Git.Clone(repoUrl, blogPath).catch(() => {
            // we'll just ASSUME, the repo already exists.
            return Git.Repository.open(path.resolve(__dirname, blogPath));
        }).then((repo) => {
            console.log('Cloned repo');
            return repo.checkoutBranch('master', {}).then(function () {
                return repo.getReferenceCommit(
                    "refs/remotes/origin/master");
            }).then(function (commit) {
                Git.Reset.reset(repo, commit, 3, {});
            }).catch((er) => {
                console.log('errr', er)
            }).then(() => {
                // it's time to build the blog.

                process.chdir(blogPath);

                return new Promise((resolve, reject) => {
                    npm.load({"prefix": blogPath}, () => {
                        //process.chdir(path.resolve(blogPath, 'node_modules'));

                        npm.commands.install(() => {
                            const { spawn } = require('child_process');
                            try {
                                const child = spawn(
                                    path.resolve(blogPath, 'node_modules/hexo/bin/hexo'), ['generate']
                                );

                                child.stdout.on('data', (chunk) => {
                                    process.stdout.write(chunk)
                                });
                                child.on('close', (code) => {
                                    process.chdir(previous);

                                    if (code !== 0) {
                                        // throw error
                                        return reject('Failed to generate blog files!');
                                    }

                                    resolve(path.resolve(blogPath, 'public'))
                                });
                            } catch (e) {
                                reject(e)
                            }
                        })

                    })
                })
            }).then((path) => {
                return path
            });
        });
    }
};