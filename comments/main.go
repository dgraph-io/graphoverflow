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
	"os"
)

var (
	dir    = flag.String("dir", "", "Directory which holds Comments.xml file")
	output = flag.String("output", "comments.rdf.gz", "Output rdf.gz file")
)

type Comment struct {
	Id           string `xml:",attr"`
	PostId       string `xml:",attr"`
	Score        string `xml:",attr"`
	Text         string `xml:",attr"`
	CreationDate string `xml:",attr"`
	UserId       string `xml:",attr"`
}

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	flag.Parse()

	err := os.RemoveAll(*output)
	check(err)

	o, err := os.OpenFile(*output, os.O_WRONLY|os.O_CREATE, 0755)
	check(err)

	f, err := os.Open(*dir + "/Comments.xml")
	check(err)

	w := gzip.NewWriter(o)

	log.Println("1/2 Reading comments file")
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
				var c Comment
				decoder.DecodeElement(&c, &se)

				node := "c" + c.Id

				str = fmt.Sprintf("<%v> <Author> <u%v> .\n", node, c.UserId)
				w.Write([]byte(str))
				str = fmt.Sprintf("<p%v> <Comment> <%v> .\n", c.PostId, node)
				w.Write([]byte(str))
				str = fmt.Sprintf("<%v> <Score> \"%v\" .\n", node, c.Score)
				w.Write([]byte(str))
				str = fmt.Sprintf("<%v> <Text> %q .\n", node, c.Text)
				w.Write([]byte(str))
				str = fmt.Sprintf("<%v> <Timestamp> %q .\n", node, c.CreationDate)
				w.Write([]byte(str))
				str = fmt.Sprintf("<%v> <Type> \"Comment\" .\n", node)
				w.Write([]byte(str))
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
}
