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
	dir    = flag.String("dir", "", "Directory which holds Users.xml file")
	output = flag.String("output", "users.rdf.gz", "Output rdf.gz file")
)

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

type User struct {
	Id             string `xml:",attr"`
	Reputation     string `xml:",attr"`
	CreationDate   string `xml:",attr"`
	DisplayName    string `xml:",attr"`
	Location       string `xml:",attr"`
	AboutMe        string `xml:",attr"`
	LastAccessDate string `xml:",attr"`
}

func main() {
	flag.Parse()

	err := os.RemoveAll(*output)
	check(err)

	o, err := os.OpenFile(*output, os.O_WRONLY|os.O_CREATE, 0755)
	check(err)

	f, err := os.Open(*dir + "/Users.xml")
	check(err)

	w := gzip.NewWriter(o)

	log.Println("1/2 Reading users file")
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
				var u User
				decoder.DecodeElement(&u, &se)

				str = fmt.Sprintf("<u%s> <Id> %q .\n", u.Id, u.Id)
				w.Write([]byte(str))
				str = fmt.Sprintf("<u%s> <Reputation> %q .\n", u.Id, u.Reputation)
				w.Write([]byte(str))
				str = fmt.Sprintf("<u%s> <CreationDate> %q .\n", u.Id, u.CreationDate)
				w.Write([]byte(str))
				str = fmt.Sprintf("<u%s> <LastAccessDate> %q .\n", u.Id, u.LastAccessDate)
				w.Write([]byte(str))
				str = fmt.Sprintf("<u%s> <DisplayName> %q .\n", u.Id, u.DisplayName)
				w.Write([]byte(str))
				str = fmt.Sprintf("<u%s> <Location> %q .\n", u.Id, u.Location)
				w.Write([]byte(str))
				str = fmt.Sprintf("<u%s> <AboutMe> %q .\n", u.Id, u.AboutMe)
				w.Write([]byte(str))
				str = fmt.Sprintf("<u%s> <Type> \"User\" .\n", u.Id)
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
