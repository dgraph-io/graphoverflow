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
	dir    = flag.String("dir", "", "Directory which holds Tags.xml file")
	output = flag.String("output", "tags.rdf.gz", "Output rdf.gz file")
)

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

type Tag struct {
	Id      string `xml:",attr"`
	TagName string `xml:",attr"`
	Count   string `xml:",attr"`
}

func main() {
	flag.Parse()

	err := os.RemoveAll(*output)
	check(err)

	o, err := os.OpenFile(*output, os.O_WRONLY|os.O_CREATE, 0755)
	check(err)

	f, err := os.Open(*dir + "/Tags.xml")
	check(err)

	w := gzip.NewWriter(o)

	log.Println("1/2 Reading tags file")
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
				var t Tag
				decoder.DecodeElement(&t, &se)

				str = fmt.Sprintf("<t%s> <TagName> %q .\n", t.Id, t.TagName)
				w.Write([]byte(str))
				str = fmt.Sprintf("<t%s> <PostCount> %q .\n", t.Id, t.Count)
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
