# Graphoverflow

A blazingly fast Stack Overflow clone running the real Stack Exchange dataset.

[Live](https://graphoverflow.dgraph.io)

## Running locally

### Node

1. Run `npm install` in the root directory
2. Run `npm install` in the `/client` directory
3. In the root directory, run `npm run dev`

### Dgraph

This app is currently compatible with latest Dgraph (v1.0.11 as of this)

1. Run Docker (Recommended)

   `docker-compose up --force-recreate`

   > PS. You can also run this project with Dgraph binaries instead of Docker.

1. Download any number of data dumps from https://archive.org/details/stackexchange
   and save in directory `data/`.

   For example [lifehacks.stackexchange.com.7z](https://archive.org/download/stackexchange/lifehacks.stackexchange.com.7z):

   ```sh
   # using wget
   wget -P data/ https://archive.org/download/stackexchange/lifehacks.stackexchange.com.7z

   # using curl
   (mkdir data ; cd data && curl -L -O https://archive.org/download/stackexchange/lifehacks.stackexchange.com.7z)
   ```

1. Run the setup script (it expects all data in `data/` dir at base):

   ```sh
   go run setup.go
   ```

## Stack

- Dgraph
- Go
- React
- node.js

## Attribution

Using [Stack Exchange data dump](https://archive.org/details/stackexchange) under [Attribution-Share Alike 3.0](http://creativecommons.org/licenses/by-sa/3.0/)

## License

MIT
