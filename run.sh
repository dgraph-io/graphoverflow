#!/bin/sh

installServer (){
        echo "install Server"
        cd ./app
        yarn
        cd ..
        echo "Finished"
}
installClient (){
        echo "install Client"
        cd ./app/client
        yarn
        yarn build
        cd ../..
        echo "Finished"
}

RunDev (){
        echo "Running Dev"
        cd ./app
        yarn dev
}



installServer
installClient
RunDev