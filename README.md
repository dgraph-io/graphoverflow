# Graphoverflow

A blazingly fast Stack Overflow clone running the real Stack Exchange dataset.

**NOTE: The repository is no longer being actively maintained by the Dgraph team. If something is broken, we'd happily accept a pull request from you, but won't fix anything ourselves.**

**UPDATE: This project is properly updated to work with version 20.xx.x of Dgraph. It's working as expected on macOS and Linux. There are some problems running the project on Windows, that can be solved by starting JS server and JS client separately. See "syntax_changed.md" for detailed instructions**

[Live](https://graphoverflow.dgraph.io)

## Running locally

### First Thing first

Before starting, make sure that Dgraph is running on default ports (8080, 9080 ...)
Then go to Ratel UI or by cURL and set the Schema in the schema.txt file. Without this
it won't work.

> Avoid to use ACL with this project.

### Node

0. You have to open Ratel UI, go to the panel schema. Then click in "Bulk Edit". And paste the file "schema.txt" in this repository.
1. You may also have to read the `syntax_changes.md`. Cuz you may need to create a fake user if you don't wanna import the dataset we provide. You gonna run a "clean" GraphOverflow. And also workaround some bugs in Windows.
2. Run `npm install` in the root directory.
3. Run `npm install` in the `/client` directory.
4. In the root directory, run `npm run dev`.

> You can also instead of steps 2, 3, and 4, you can just run sh ./run.sh

### Dgraph

This app is currently compatible with Dgraph v20.xx.x

1. Run Docker

       docker run -it -p 8080:8080 -p 9080:9080 \
       -v ~/dgraph:/dgraph --name dgraph dgraph/dgraph:v20.03.1 \
       dgraph alpha --bindall=true

    PS. You can also run this project with Dgraph binaries instead of Docker.

2. Choose, download and unarchive a data dump from https://archive.org/details/stackexchange, for example [lifehacks.stackexchange.com.7z](https://archive.org/download/stackexchange/lifehacks.stackexchange.com.7z)

3. Convert stackexchange data from relation to graph. From the current directory:

       for category in comments posts tags users votes; do go run $category/main.go -dir="$HOME/Downloads/lifehacks.stackexchange.com" -output="/$HOME/dgraph/$category.rdf.gz"; done

4. Run the [schema mutation](https://github.com/dgraph-io/graphoverflow/blob/master/schema.txt)

5. Load graph data files into Dgraph. From the current directory:

       for category in comments posts tags users votes; do docker exec -it dgraph dgraphloader -r $category.rdf.gz; done


## Stack

* React
* node.js
* Dgraph

## Attribution

Using [Stack Exchange data dump](https://archive.org/details/stackexchange) under [Attribution-Share Alike 3.0](http://creativecommons.org/licenses/by-sa/3.0/)

## License

MIT
