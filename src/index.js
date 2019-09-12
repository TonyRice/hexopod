#!/usr/bin/env node

const GIT_REPO = process.env.GIT_REPO ? process.env.GIT_REPO : 'https://github.com/TonyRice/hexoblog.git';

const Koa = require('koa');
const router = require('koa-router')();
const body = require('koa-json-body');
const path = require('path');
const extname = path.extname;
const fs = require('fs');

// This tells us that the service is currently
// deploying the latest version of the blog.
const deployment = require('./deployment_service');

function stat(file) {
    return new Promise(function(resolve, reject) {
        fs.stat(file, function(err, stat) {
            if (err) {
                reject(err);
            } else {
                resolve(stat);
            }
        });
    });
}

router.get('/health', ctx => {
    ctx.body = 'OK';
});

router.post('/deploy', (ctx, next) => {
    return deployment.build(GIT_REPO).then((path) =>{
        ctx.body = 'OK';
        next();
    }).catch(() => {
        ctx.body = 'FAILED';
        next();
    });
});

// This allows us to create a simple proxy
// interface in the cloud.
router.post('/get_resource', (ctx, next) => {
    return new Promise(async (resolve) => {
        try {

            let rpath = ctx.request.body["path"];

            rpath = rpath ? rpath : "/index.html";

            rpath = rpath === '/' ? "/index.html" : rpath;

            const fpath = path.join(__dirname, "../blog/public", rpath);

            const fstat = await stat(fpath);

            if (fstat.isFile()) {
                let data = fs.readFileSync(fpath.toString())
                ctx.body = {
                    'data': data.toString(),
                    'type': extname(fpath)
                }
            } else {
                ctx.body = "not found"
            }
        } catch (e) {
            ctx.body = e.toString()
        }

        resolve();
    }).then(() => {
        next();
    });
});

const app = new Koa();

app.use(body());

app.use(router.routes());

app.listen(5555);


console.log(`Listening on localhost:5555`);