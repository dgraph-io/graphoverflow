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
	dir = flag.String("dir", "", "Directory which holds Users.xml file")
)

func check(err error) {
	if err != nil {
		log.Fatal(err)
	}
}

type Users struct {
	Rows []Row `xml:"row"`
}

type Row struct {
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

	data, err := ioutil.ReadFile(*dir + "/Users.xml")
	check(err)
	var users Users
	check(xml.Unmarshal(data, &users))

	limiter := make(chan struct{}, 100)
	var wg sync.WaitGroup
	for _, u := range users.Rows {
		var b bytes.Buffer
		b.WriteString("mutation { set { ")
		b.WriteString(fmt.Sprintf("<u%s> <Reputation> %q .\n", u.Id, u.Reputation))
		b.WriteString(fmt.Sprintf("<u%s> <CreationDate> %q .\n", u.Id, u.CreationDate))
		b.WriteString(fmt.Sprintf("<u%s> <LastAccessDate> %q .\n", u.Id, u.LastAccessDate))
		b.WriteString(fmt.Sprintf("<u%s> <DisplayName> %q .\n", u.Id, u.DisplayName))
		b.WriteString(fmt.Sprintf("<u%s> <Location> %q .\n", u.Id, u.Location))
		b.WriteString(fmt.Sprintf("<u%s> <AboutMe> %q .\n", u.Id, u.AboutMe))
		b.WriteString(fmt.Sprintf("<User> <Instance> <u%s> .\n", u.Id))
		b.WriteString("}}")
		wg.Add(1)
		go func(b *bytes.Buffer) {
			limiter <- struct{}{}
			fmt.Println(b.String())
			resp, err := http.Post("http://localhost:8080/query", "", b)
			check(err)
			body, err := ioutil.ReadAll(resp.Body)
			check(err)
			fmt.Printf("%q\n\n", body)
			check(resp.Body.Close())
			wg.Done()
			<-limiter
		}(&b)
	}

	wg.Wait()
	fmt.Println(len(users.Rows), "processed")
}
