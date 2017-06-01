package main

import (
	"bytes"
	"encoding/xml"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sync"
)

var (
	dir = flag.String("dir", "", "Directory which holds Tags.xml file")
)

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

type Tags struct {
	Rows []Row `xml:"row"`
}

type Row struct {
	Id      string `xml:",attr"`
	TagName string `xml:",attr"`
	Count   string `xml:",attr"`
}

func main() {
	flag.Parse()

	data, err := ioutil.ReadFile(*dir + "/Tags.xml")
	check(err)
	var tags Tags
	check(xml.Unmarshal(data, &tags))

	limiter := make(chan struct{}, 100)
	var wg sync.WaitGroup
	for _, t := range tags.Rows {
		var b bytes.Buffer
		b.WriteString("mutation { set { ")
		b.WriteString(fmt.Sprintf("<t%s> <TagName> %q .\n", t.Id, t.TagName))
		b.WriteString(fmt.Sprintf("<t%s> <PostCount> %q .\n", t.Id, t.Count))
		b.WriteString("}}")
		wg.Add(1)
		go func(b *bytes.Buffer) {
			limiter <- struct{}{}
			fmt.Println(b.String())
			resp, err := http.Post("http://localhost:8080/query", "", b)
			check(err)
			body, err := ioutil.ReadAll(resp.Body)
			check(err)
			fmt.Printf("%q\n", body)
			check(resp.Body.Close())
			wg.Done()
			<-limiter
		}(&b)
	}

	wg.Wait()
	fmt.Println(len(tags.Rows), "processed")
}
