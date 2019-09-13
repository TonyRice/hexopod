# Hexopod

![Microservice](https://img.shields.io/badge/microservice-ready-brightgreen.svg?style=for-the-badge)
[![Build status](https://img.shields.io/travis/com/microservices/node/master.svg?style=for-the-badge)](https://travis-ci.com/microservices/node)

An OMG Microservice for deploying a Hexo blog

Storyscript Usage
-----

```coffee

TonyRice/hexopod deploy

http server as server
    # Note: wildcards are currently not supported in the latest
    # Storyscript Cloud
    when server listen method: "get" path: "/*" as r

        path = r.path.replace(item: "/blog/" by: "/")
        
        # we need to retrieve the content-type first
        content_type = TonyRice/hexopod content_type path: r.path.replace(item: "/blog/" by: "/")
        
        if content_type == null
             content_type = "application/octet-stream"

        r set_header key: "Content-Type" value: content_type
        
        # this will allow us to write the data of the resource
        r write content: TonyRice/hexopod get_resource path: r.path.replace(item: "/blog/" by: "/")


```
