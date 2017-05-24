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
	"math/rand"
	"net/http"
	"sync"
	"time"
)

var (
	dir    = flag.String("dir", "", "Directory which holds Votes.xml file")
	dryRun = flag.Bool("dryrun", true, "Only show mutations.")
)

// random generates a random integer given a range
func random(min, max int) int {
	return rand.Intn(max-min) + min
}

func init() {
	rand.Seed(time.Now().Unix())
}

type Vote struct {
	Id           string `xml:",attr"`
	PostId       int    `xml:",attr"`
	VoteTypeId   int    `xml:",attr"`
	CreationDate string `xml:",attr"`
}

type Votes struct {
	Rows []Vote `xml:"row"`
}

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	flag.Parse()

	data, err := ioutil.ReadFile(*dir + "/Votes.xml")
	check(err)
	var votes Votes
	check(xml.Unmarshal(data, &votes))

	var wg sync.WaitGroup
	limiter := make(chan struct{}, 1000)
	if *dryRun {
		limiter = make(chan struct{}, 1)
	}

	for _, v := range votes.Rows {
		var b bytes.Buffer

		node := "v" + v.Id
		b.WriteString("mutation { set { ")

		// We generate userId for the user that casted the vote, because dataset is anonymized
		// and does not always contain userId
		author_id := random(3, 20000)
		b.WriteString(fmt.Sprintf("<%v> <Author> <u%v> .\n", node, author_id))
		b.WriteString(fmt.Sprintf("<p%v> <Vote> <%v> .\n", v.PostId, node))
		b.WriteString(fmt.Sprintf("<%v> <Timestamp> %q .\n", node, v.CreationDate))
		b.WriteString(fmt.Sprintf("<%v> <Type> \"Vote\" .\n", node))

		if v.VoteTypeId == 2 { // upvote
			b.WriteString(fmt.Sprintf("<%v> <Score> \"1\" .\n", node))
		} else if v.VoteTypeId == 3 { // downvote
			b.WriteString(fmt.Sprintf("<%v> <Score> \"-2\" .\n", node))
		}

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
	fmt.Println(len(votes.Rows), "processed")
}
