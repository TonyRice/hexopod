#!/usr/bin/env node

const GIT_REPO = process.env.GIT_REPO ? process.env.GIT_REPO : 'https://github.com/TonyRice/hexoblog.git';

const Koa = require('koa');
const router = require('koa-router')();
const body = require('koa-json-body');

// This tells us that the service is currently
// deploying the latest version of the blog.
const mount = require('koa-mount')
const serve = require('koa-static')
const deployment = require('./deployment_service')

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
    })
});

const app = new Koa();

const blog = new Koa();

blog.use(serve('./blog/public'));

app.use(body());
app.use(router.routes());

blog.listen(5556)

app.listen(5555);


console.log(`Listening on localhost:5555`);