#!/usr/bin/env node
const Koa = require('koa');
const router = require('koa-router')();
const body = require('koa-json-body');
const path = require('path');
const extname = path.extname;
const fs = require('fs');

const mime = require('mime-types');

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


let REPO_INITIALIZED = false;

router.post('/init', (ctx, next) => {
    let repo = ctx.request.body["repo"]
    return deployment.build(repo).then((path) =>{
        ctx.body = 'OK';
        REPO_INITIALIZED = true;
        next();
    }).catch(() => {
        ctx.body = 'FAILED';
        next();
    });
});

async function getResourceFromPath(rpath){

    rpath = rpath ? rpath : "/index.html";

    rpath = rpath === '/' ? "/index.html" : rpath;

    let fpath = path.join(__dirname, "../blog/public", rpath);

    let fstat = await stat(fpath);

    if (fstat.isDirectory()) {
        let index = path.join(fpath, "index.html");
        if (fs.existsSync(index)) {
            fpath = index;
            fstat = await stat(fpath)
        }
    }

    if (fstat.isFile()) {
        return fpath
    }

    return null
}


// This allows us to create a simple proxy
// interface in the cloud.
router.post('/content_type', (ctx, next) => {
    return new Promise(async (resolve) => {
        try {
            if (!REPO_INITIALIZED) {
                ctx.body = "blog not initialized.";
                return resolve();
            }

            let rpath = ctx.request.body["path"];

            const fpath = await getResourceFromPath(rpath);

            if (fpath !== null) {
                ctx.body = mime.lookup(extname(fpath))
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

// This allows us to create a simple proxy
// interface in the cloud.
router.post('/get_resource', (ctx, next) => {
    return new Promise(async (resolve) => {
        try {
            if (!REPO_INITIALIZED) {
                ctx.body = "blog not initialized.";
                return resolve();
            }

            let rpath = ctx.request.body["path"];

            const fpath = await getResourceFromPath(rpath);

            if (fpath !== null) {
                ctx.body = fs.readFileSync(fpath)
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
