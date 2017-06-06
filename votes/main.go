// Original schema:
// https://ia800500.us.archive.org/22/items/stackexchange/readme.txt

package main

import (
	"bufio"
	"compress/gzip"
	"encoding/xml"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"
	"time"
)

var (
	dir    = flag.String("dir", "", "Directory which holds Votes.xml file")
	output = flag.String("output", "votes.rdf.gz", "Output rdf.gz file")
)

// random generates a random integer given a range
func random(min, max int) int {
	return rand.Intn(max-min) + min

}

func check(err error) {
	if err != nil {
		log.Fatal(err)

	}

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

func main() {
	flag.Parse()

	err := os.RemoveAll(*output)
	check(err)

	o, err := os.OpenFile(*output, os.O_WRONLY|os.O_CREATE, 0755)
	check(err)

	f, err := os.Open(*dir + "/Votes.xml")
	check(err)

	w := gzip.NewWriter(o)

	log.Println("1/2 Reading votes file")
	c := bufio.NewReader(f)
	decoder := xml.NewDecoder(c)

	var str string

	for {
		t, _ := decoder.Token()
		if t == nil {
			break

		}

		switch se := t.(type) {
		case xml.StartElement:
			if se.Name.Local == "row" {
				var v Vote
				decoder.DecodeElement(&v, &se)

				node := "v" + v.Id

				authorId := random(1, 1000)
				str = fmt.Sprintf("<%v> <Author> <u%v> .\n", node, authorId)
				w.Write([]byte(str))
				str = fmt.Sprintf("<%v> <Timestamp> %q .\n", node, v.CreationDate)
				w.Write([]byte(str))

				if v.VoteTypeId == 2 { // upvote
					str = fmt.Sprintf("<p%v> <Upvote> <%v> .\n", v.PostId, node)
					w.Write([]byte(str))
				} else if v.VoteTypeId == 3 { // downvote
					str = fmt.Sprintf("<p%v> <Downvote> <%v> .\n", v.PostId, node)
					w.Write([]byte(str))
				} else {
					continue
				}
			}
		}
	}

	log.Println("Finished generating RDF.")
	err = w.Flush()
	check(err)

	err = w.Close()
	check(err)

	err = o.Close()
	check(err)

	//	log.Println("2/2 Loading RDF using dgraphloader")
	//	cmd := exec.Command("dgraphloader", "-r", *output)
	//	err = cmd.Run()
	//	check(err)
	//
	//	log.Println("Done")
}
