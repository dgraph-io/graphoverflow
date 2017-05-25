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
	dir    = flag.String("dir", "", "Directory which holds Users.xml file")
	dryRun = flag.Bool("dry", true, "Only show mutations.")
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

type Posts struct {
	Rows []Post `xml:"row"`
}

type Logs struct {
	Rows []PostHistory `xml:"row"`
}

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

func main() {
	flag.Parse()

	data, err := ioutil.ReadFile(*dir + "/Posts.xml")
	check(err)
	var posts Posts
	check(xml.Unmarshal(data, &posts))

	data, err = ioutil.ReadFile(*dir + "/PostHistory.xml")
	check(err)
	var logs Logs
	check(xml.Unmarshal(data, &logs))

	fmt.Println("dryrun: ", *dryRun)
	var wg sync.WaitGroup
	limiter := make(chan struct{}, 1000)
	if *dryRun {
		limiter = make(chan struct{}, 1)
	}

	send := func(b *bytes.Buffer) {
		limiter <- struct{}{}
		fmt.Println(b.String())
		if *dryRun == false {
			fmt.Println("POSTing")
			resp, err := http.Post("http://localhost:8080/query", "", b)
			check(err)
			body, err := ioutil.ReadAll(resp.Body)
			check(err)
			fmt.Printf("%q\n\n", body)
			check(resp.Body.Close())
		}
		wg.Done()
		<-limiter
	}

	// First generate all the versions.
	for _, p := range posts.Rows {
		var b bytes.Buffer

		node := "p" + p.Id
		b.WriteString("mutation { set { ")

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
			b.WriteString(fmt.Sprintf("_:newTitle <Timestamp> %q .\n", p.LastEditDate))
			b.WriteString(fmt.Sprintf("_:newTitle <Author> <u%s> .\n", p.LastEditorUserId))
			b.WriteString(fmt.Sprintf("_:newTitle <Post> <%s> .\n", node))
			b.WriteString(fmt.Sprintf("_:newTitle <Text> %q .\n", p.Title))
			b.WriteString(fmt.Sprintf("_:newTitle <Type> \"Title\" .\n"))

			b.WriteString(fmt.Sprintf("<%s> <Title> _:newTitle .\n", node))
		}
		{
			b.WriteString(fmt.Sprintf("_:newTags <Timestamp> %q .\n", p.LastEditDate))
			b.WriteString(fmt.Sprintf("_:newTags <Author> <u%s> .\n", p.LastEditorUserId))
			b.WriteString(fmt.Sprintf("_:newTags <Post> <%s> .\n", node))
			b.WriteString(fmt.Sprintf("_:newTags <Text> %q .\n", p.Tags))
			b.WriteString(fmt.Sprintf("_:newTags <Type> \"Tags\" .\n"))

			b.WriteString(fmt.Sprintf("<%s> <Tags> _:newTags .\n", node))
		}
		{
			b.WriteString(fmt.Sprintf("_:newBody <Timestamp> %q .\n", p.LastEditDate))
			b.WriteString(fmt.Sprintf("_:newBody <Author> <u%s> .\n", p.LastEditorUserId))
			b.WriteString(fmt.Sprintf("_:newBody <Post> <%s> .\n", node))
			b.WriteString(fmt.Sprintf("_:newBody <Text> %q .\n", p.Body))
			b.WriteString(fmt.Sprintf("_:newBody <Type> \"Body\" .\n"))

			b.WriteString(fmt.Sprintf("<%s> <Body> _:newBody .\n", node))
		}

		// Now create the actual post.
		if p.PostTypeId == 1 {
			b.WriteString(fmt.Sprintf("<%s> <Type> \"Question\" .\n", node))

			// Relation from question to accepted answer.
			if len(p.AcceptedAnswerId) > 0 {
				b.WriteString(fmt.Sprintf("<%s> <Chosen.Answer> <p%s> .\n", node, p.AcceptedAnswerId))
				b.WriteString(fmt.Sprintf("<%s> <Has.Answer> <p%s> .\n", node, p.AcceptedAnswerId))
			}

		} else if p.PostTypeId == 2 {
			b.WriteString(fmt.Sprintf("<%s> <Type> \"Answer\" .\n", node))

			// Relation from question to answer.
			if len(p.ParentId) > 0 {
				b.WriteString(fmt.Sprintf("<p%s> <Has.Answer> <%s> .\n", p.ParentId, node))
			}
		} else {
			// Not sure what this is. It isn't documented.
			continue
		}

		b.WriteString(fmt.Sprintf("<%s> <Score> \"%d\" .\n", node, p.Score))
		b.WriteString(fmt.Sprintf("<%s> <ViewCount> \"%d\" .\n", node, p.ViewCount))
		b.WriteString(fmt.Sprintf("<%s> <Timestamp> %q .\n", node, p.CreationDate))

		b.WriteString("}}")
		wg.Add(1)
		go send(&b)
	}

	for _, l := range logs.Rows {
		if l.PostHistoryTypeId > 9 {
			// Ignore for this demo.
			continue
		}
		var b bytes.Buffer

		b.WriteString("mutation { set { ")
		b.WriteString(fmt.Sprintf("_:new <Timestamp> %q .\n", l.CreationDate))
		b.WriteString(fmt.Sprintf("_:new <Author> <u%s> .\n", l.UserId))
		b.WriteString(fmt.Sprintf("_:new <Post> <p%s> .\n", l.PostId))

		tid := l.PostHistoryTypeId % 3

		switch tid {
		case 0: // Tags
			b.WriteString(fmt.Sprintf("_:new <Text> %q .\n", l.Text))
			b.WriteString(fmt.Sprintf("_:new <Type> \"Tags\" .\n"))
		case 1: // Title
			b.WriteString(fmt.Sprintf("_:new <Text> %q .\n", l.Text))
			b.WriteString(fmt.Sprintf("_:new <Type> \"Title\" .\n"))
		case 2: // Body
			b.WriteString(fmt.Sprintf("_:new <Text> %q .\n", l.Text))
			b.WriteString(fmt.Sprintf("_:new <Type> \"Body\" .\n"))
		}
		b.WriteString("}}")
		wg.Add(1)
		go send(&b)
	}
	wg.Wait()
}
