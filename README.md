# Graphoverflow

A blazingly fast Stack Overflow clone running the real Stack Exchange dataset.

**NOTE: The repository is no longer being actively maintained by the Dgraph team. If something is broken, we'd happily accept a pull request from you, but won't fix anything ourselves.**

**UPDATE: This project is properly updated to work with version 1.0.14 of Dgraph. It's working as expected on MacOS and Linux. There are some problems running the project on Windows, that can be solved by starting JS server and JS client separately. See "syntax_changed.md" for detailed instructions**

[Live](https://graphoverflow.dgraph.io)

## Running locally

### First Thing first

Before starting, make sure that Dgraph is running on default ports (8080, 9080 ...)
Then go to Ratel UI or by cURL and set the Schema in the schema.txt file. Without this
it won't work.

### Node

1. Run `npm install` in the root directory
2. Run `npm install` in the `/client` directory
3. In the root directory, run `npm run dev`

> You can also instead just run sh ./run.sh

### Dgraph

This app is currently compatible with Dgraph v1.0.14

1. Run Docker

       docker run -it -p 8080:8080 -p 9080:9080 -v ~/dgraph:/dgraph --name dgraph dgraph/dgraph:v1.0.14 dgraph alpha --bindall=true --memory_mb 2048

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
