# Graphoverflow

A blazingly fast Stack Overflow clone running the real Stack Exchange dataset.

**NOTE: The repository is no longer being actively maintained by the Dgraph team. If something is broken, we'd happily accept a pull request from you, but won't fix anything ourselves.**

**UPDATE: This project is properly updated to work with version 20.xx.x of Dgraph. It's working as expected on macOS and Linux. There are some problems running the project on Windows, that can be solved by starting JS server and JS client separately. See "syntax_changed.md" for detailed instructions**

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

### Docker Compose

We have a dockerized env so you can run this project.

1. Run Docker-composer

The first build will take time.
```
docker-compose up            # In the first time
or
docker-compose up --build    # If you wanna rebuild it
```
The compose has a script that will prepare everything for you. You might wait for the deployment to be done and updated the page if so.

2. Now go to localhost:3000 or the IP if you are running docker in a VM.

### If anything goes wrong

If the page loads but keeps showing the animated loader. It means that something goes wrong. You should see a loaded site with empty questions.

>You don't need to do much when running this docker-compose. In general, if you are running docker in a VM the IP is 192.168.99.100 (between 99 and 199, you can check it via docker-machine). In that case, you gonna need to change all addresses in the code from localhost or 127.0.0.1 to the VM IP.

>Paths you might change: \
app/client/src/lib/helpers.js \
app/helpers.js

>Pay attention that this docker-composer will create a volume in your docker env.

>If your docker is binded to localhost. Don't change anything.

### Clean up docker.

```
docker-compose down
or
docker-compose rm
```
and
```
docker stop $(docker ps -a -q)

docker rm $(docker ps -a -q)

docker volume ls

docker volume rm graphoverflow_dgraph
```

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
