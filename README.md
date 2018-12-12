# Graphoverflow

A blazingly fast Stack Overflow clone running the real Stack Exchange dataset.

[Live](https://graphoverflow.dgraph.io)

## Running locally

### Node

1. Run `npm install` in the root directory
2. Run `npm install` in the `/client` directory
3. In the root directory, run `npm run dev`

### Dgraph

This app is currently compatible with Dgraph v1.0.6

1. Run Docker

   docker run -it -p 8080:8080 -p 9080:9080 -v ~/dgraph:/dgraph --name dgraph dgraph/dgraph:v1.0.6 dgraph --bindall=true --memory_mb 2048

   PS. You can also run this project with Dgraph binaries instead of Docker.

1. Choose, download and unarchive a data dump from https://archive.org/details/stackexchange, for example [lifehacks.stackexchange.com.7z](https://archive.org/download/stackexchange/lifehacks.stackexchange.com.7z)

1. Convert stackexchange data from relation to graph. From the current directory:

   for category in comments posts tags users votes; do go run $category/main.go -dir="/users/$USER/Downloads/lifehacks.stackexchange.com" -output="/users/\$USER/dgraph"; done

1. Run the [schema mutation](https://github.com/dgraph-io/graphoverflow/blob/master/schema.txt)

1. Load graph data files into Dgraph. From the current directory:

   for category in comments posts tags users votes; do docker exec -it dgraph dgraphloader -r \$category.rdf.gz; done

## Stack

- React
- node.js
- Dgraph

## Attribution

Using [Stack Exchange data dump](https://archive.org/details/stackexchange) under [Attribution-Share Alike 3.0](http://creativecommons.org/licenses/by-sa/3.0/)

## License

MIT
