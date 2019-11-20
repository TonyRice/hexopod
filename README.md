# Hexopod

![Microservice](https://img.shields.io/badge/microservice-ready-brightgreen.svg?style=for-the-badge)

An OMG Microservice for deploying a Hexo based blog

Storyscript Usage
-----

```coffee
TonyRice/hexopod init repo: "https://github.com/TonyRice/hexoblog.git"

when http server listen method: "get" path: "/*" as r
    r set_header key: "Content-Type" value: get_content_type(path: r.path)
    r write content: get_content(path: r.path)                            

function clean_path path: any returns string
    return (path to string).replace(item: "/blog/" by: "/")

function get_content_type path: any returns string
    path = clean_path(path: path)
    content_type = (TonyRice/hexopod content_type path: path) to string

    if content_type == null
         content_type = "application/octet-stream"

    return content_type          

function retrieve_blog_content path: any returns any
    return TonyRice/hexopod get_resource path: clean_path(path: path)
```
