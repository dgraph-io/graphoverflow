installServer (){
        echo "install Server"
        cd ./app
        npm install
        cd ..
        echo "Finished"
}
installClient (){
        echo "install Client"
        cd ./app/client
        npm install
        cd ../..
        echo "Finished"
}

RunDev (){
        echo "Running Dev"
        cd ./app
        npm run dev
}



installServer
installClient
RunDev