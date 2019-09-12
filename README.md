# Hexopod

![Microservice](https://img.shields.io/badge/microservice-ready-brightgreen.svg?style=for-the-badge)
[![Build status](https://img.shields.io/travis/com/microservices/node/master.svg?style=for-the-badge)](https://travis-ci.com/microservices/node)

An OMG Microservice for deploying a Hexo blog

Storyscript Usage
-----

```coffee

status = TonyRice/hexopod deployBlog

resource = TonyRice/hexopod getBlogResource path: "/"

log info msg: "deployed {status}"

```
