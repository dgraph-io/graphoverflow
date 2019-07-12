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
	dir    = flag.String("dir", "", "Directory which holds Users.xml file")
	output = flag.String("output", "posts.rdf.gz", "Output rdf.gz file")
)

type PostHistory struct {
	Id                int    `xml:",attr"`
	PostHistoryTypeId int    `xml:",attr"`
	PostId            string `xml:",attr"`
	UserId            string `xml:",attr"`
	CreationDate      string `xml:",attr"`
	Text              string `xml:",attr"`
}

type Post struct {
	Id               string `xml:",attr"`
	CreationDate     string `xml:",attr"`
	PostTypeId       int    `xml:",attr"`
	ParentId         string `xml:",attr"`
	AcceptedAnswerId string `xml:",attr"`
	Score            int    `xml:",attr"`
	ViewCount        int    `xml:",attr"`

	Body             string `xml:",attr"`
	Title            string `xml:",attr"`
	Tags             string `xml:",attr"`
	LastEditorUserId string `xml:",attr"`
	LastEditDate     string `xml:",attr"`
	LastActivityDate string `xml:",attr"`
	OwnerUserId      string `xml:",attr"`
}

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func parseTags(tagString string) []string {
	var ret []string
	var currentTag string
	var reading bool

	for _, char := range tagString {
		if char == '<' {
			reading = true
			continue
		} else if char == '>' {
			reading = false
		}

		if !reading && currentTag != "" {
			ret = append(ret, currentTag)
			currentTag = ""
		}
		if reading {
			currentTag += string(char)
		}
	}

	return ret
}

func main() {
	flag.Parse()

	err := os.RemoveAll(*output)
	check(err)

	o, err := os.OpenFile(*output, os.O_WRONLY|os.O_CREATE, 0755)
	check(err)

	pf, err := os.Open(*dir + "/Posts.xml")
	check(err)
	phf, err := os.Open(*dir + "/PostHistory.xml")
	check(err)
	w := gzip.NewWriter(o)

	log.Println("1/2 Reading posts and posthistory file")
	pc := bufio.NewReader(pf)
	pcd := xml.NewDecoder(pc)

	phc := bufio.NewReader(phf)
	phd := xml.NewDecoder(phc)

	var str string
	postHistoryIdx := 0

	// First generate all the versions.
	for {
		t, _ := pcd.Token()
		if t == nil {
			break
		}

		switch se := t.(type) {
		case xml.StartElement:
			if se.Name.Local == "row" {
				var p Post
				pcd.DecodeElement(&p, &se)

				node := "p" + p.Id

				if len(p.LastEditDate) == 0 {
					p.LastEditDate = p.LastActivityDate
				}
				if len(p.LastEditorUserId) == 0 {
					p.LastEditorUserId = p.OwnerUserId
				}
				if len(p.LastEditorUserId) == 0 || len(p.LastEditDate) == 0 {
					continue
				}

				// First create the versions correctly, and attach them to the node.
				{
					str = fmt.Sprintf("<ph%v> <Timestamp> %q .\n", postHistoryIdx, p.LastEditDate)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Author> <u%s> .\n", postHistoryIdx, p.LastEditorUserId)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Post> <%s> .\n", postHistoryIdx, node)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Text> %q .\n", postHistoryIdx, p.Title)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Type> \"Title\" .\n", postHistoryIdx)
					w.Write([]byte(str))
					str = fmt.Sprintf("<%s> <Title> <ph%v> .\n", node, postHistoryIdx)
					w.Write([]byte(str))
					postHistoryIdx++
				}

				// Generate tag node for each tag in the tag string
				tagList := parseTags(p.Tags)
				for _, tag := range tagList {
					str = fmt.Sprintf("<t-%v> <Timestamp> %q .\n", tag, p.LastEditDate)
					w.Write([]byte(str))
					//			str = fmt.Sprintf("<t-%v> <Post> <%s> .\n", tag, node)
					//			w.Write([]byte(str))
					str = fmt.Sprintf("<t-%v> <Tag.Text> %q .\n", tag, tag)
					w.Write([]byte(str))
					str = fmt.Sprintf("<t-%v> <Type> \"Tag\" .\n", tag)
					w.Write([]byte(str))
					str = fmt.Sprintf("<%s> <Tag> <t-%v> .\n", node, tag)
					w.Write([]byte(str))
				}

				{
					str = fmt.Sprintf("<ph%v> <Timestamp> %q .\n", postHistoryIdx, p.LastEditDate)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Author> <u%s> .\n", postHistoryIdx, p.LastEditorUserId)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Post> <%s> .\n", postHistoryIdx, node)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Text> %q .\n", postHistoryIdx, p.Body)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Type> \"Body\" .\n", postHistoryIdx)
					w.Write([]byte(str))
					str = fmt.Sprintf("<%s> <Body> <ph%v> .\n", node, postHistoryIdx)
					w.Write([]byte(str))
					postHistoryIdx++
				}

				// Now create the actual post.
				str = fmt.Sprintf("<%s> <Id> %q .\n", node, p.Id)
				w.Write([]byte(str))

				if p.PostTypeId == 1 {
					str = fmt.Sprintf("<%s> <Type> \"Question\" .\n", node)
					w.Write([]byte(str))

					// Relation from question to accepted answer.
					if len(p.AcceptedAnswerId) > 0 {
						str = fmt.Sprintf("<%s> <Chosen.Answer> <p%s> .\n", node, p.AcceptedAnswerId)
						w.Write([]byte(str))
						str = fmt.Sprintf("<%s> <Has.Answer> <p%s> .\n", node, p.AcceptedAnswerId)
						w.Write([]byte(str))
					}

				} else if p.PostTypeId == 2 {
					str = fmt.Sprintf("<%s> <Type> \"Answer\" .\n", node)
					w.Write([]byte(str))

					// Relation from question to answer.
					if len(p.ParentId) > 0 {
						str = fmt.Sprintf("<p%s> <Has.Answer> <%s> .\n", p.ParentId, node)
						w.Write([]byte(str))
					}
				} else {
					// Not sure what this is. It isn't documented.
					continue
				}

				if len(p.OwnerUserId) > 0 {
					str = fmt.Sprintf("<%s> <Owner> <u%s> .\n", node, p.OwnerUserId)
					w.Write([]byte(str))
				}
				//b.WriteString(fmt.Sprintf("<%s> <Score> \"%d\" .\n", node, p.Score))
				str = fmt.Sprintf("<%s> <ViewCount> \"%d\" .\n", node, p.ViewCount)
				w.Write([]byte(str))
				str = fmt.Sprintf("<%s> <Timestamp> %q .\n", node, p.CreationDate)
				w.Write([]byte(str))
			}
		}
	}

	for {
		t, _ := phd.Token()
		if t == nil {
			break
		}

		switch se := t.(type) {
		case xml.StartElement:
			if se.Name.Local == "row" {
				var l PostHistory
				phd.DecodeElement(&l, &se)

				if l.PostHistoryTypeId > 9 {
					// Ignore for this demo.
					continue
				}

				str = fmt.Sprintf("<ph%v> <Timestamp> %q .\n", postHistoryIdx, l.CreationDate)
				w.Write([]byte(str))
				str = fmt.Sprintf("<ph%v> <Author> <u%s> .\n", postHistoryIdx, l.UserId)
				w.Write([]byte(str))
				str = fmt.Sprintf("<ph%v> <Post> <p%s> .\n", postHistoryIdx, l.PostId)
				w.Write([]byte(str))

				tid := l.PostHistoryTypeId % 3

				switch tid {
				case 0: // Tags
					str = fmt.Sprintf("<ph%v> <Text> %q .\n", postHistoryIdx, l.Text)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Type> \"Tags\" .\n")
					w.Write([]byte(str))
				case 1: // Title
					str = fmt.Sprintf("<ph%v> <Text> %q .\n", postHistoryIdx, l.Text)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Type> \"Title\" .\n")
					w.Write([]byte(str))
				case 2: // Body
					str = fmt.Sprintf("<ph%v> <Text> %q .\n", postHistoryIdx, l.Text)
					w.Write([]byte(str))
					str = fmt.Sprintf("<ph%v> <Type> \"Body\" .\n")
					w.Write([]byte(str))
				}

				postHistoryIdx++
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
