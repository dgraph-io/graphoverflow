// Original schema:
// https://ia800500.us.archive.org/22/items/stackexchange/readme.txt

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
	dir    = flag.String("dir", "", "Directory which holds Comments.xml file")
	dryRun = flag.Bool("dryrun", true, "Only show mutations.")
)

type Comment struct {
	Id           string `xml:",attr"`
	PostId       string `xml:",attr"`
	Score        string `xml:",attr"`
	Text         string `xml:",attr"`
	CreationDate string `xml:",attr"`
	UserId       string `xml:",attr"`
}

type Comments struct {
	Rows []Comment `xml:"row"`
}

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	flag.Parse()

	data, err := ioutil.ReadFile(*dir + "/Comments.xml")
	check(err)
	var comments Comments
	check(xml.Unmarshal(data, &comments))

	var wg sync.WaitGroup
	limiter := make(chan struct{}, 1000)
	if *dryRun {
		limiter = make(chan struct{}, 1)
	}

	// First generate all the versions.
	for _, c := range comments.Rows {
		var b bytes.Buffer

		node := "c" + c.Id
		b.WriteString("mutation { set { ")

		b.WriteString(fmt.Sprintf("<%v> <Author> <u%v> .\n", node, c.UserId))
		b.WriteString(fmt.Sprintf("<p%v> <Comment> <%v> .\n", c.PostId, node))
		b.WriteString(fmt.Sprintf("<%v> <Score> \"%v\" .\n", node, c.Score))
		b.WriteString(fmt.Sprintf("<%v> <Text> %q .\n", node, c.Text))
		b.WriteString(fmt.Sprintf("<%v> <Timestamp> %q .\n", node, c.CreationDate))
		b.WriteString(fmt.Sprintf("<%v> <Type> \"Comment\" .\n", node))

		b.WriteString("}}")
		wg.Add(1)
		go func(b *bytes.Buffer) {
			limiter <- struct{}{}
			fmt.Println(b.String())
			if !*dryRun {
				resp, err := http.Post("http://localhost:8080/query", "", b)
				check(err)
				body, err := ioutil.ReadAll(resp.Body)
				check(err)
				fmt.Printf("%q\n\n", body)
				check(resp.Body.Close())
			}
			wg.Done()
			<-limiter
		}(&b)
	}

	wg.Wait()
	fmt.Println(len(comments.Rows), "processed")
}
