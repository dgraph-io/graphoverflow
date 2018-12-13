// Original schema:
// https://ia800500.us.archive.org/22/items/stackexchange/readme.txt

package comments

import (
	"bufio"
	"encoding/xml"
	"fmt"
	"io"
	"os"
)

type Comment struct {
	Id           string `xml:",attr"`
	PostId       string `xml:",attr"`
	Score        string `xml:",attr"`
	Text         string `xml:",attr"`
	CreationDate string `xml:",attr"`
	UserId       string `xml:",attr"`
}

func Load(file string) error {
	fp, err := os.Open(file)
	if err != nil {
		return err
	}
	defer fp.Close()

	decoder := xml.NewDecoder(bufio.NewReader(fp))
	rdfs := make([]string, 6)
L:
	for {
		t, err := decoder.Token()
		if err != nil {
			return err
		}

		switch se := t.(type) {
		case xml.StartElement:
			if se.Name.Local == "row" {
				var c Comment
				err = decoder.DecodeElement(&c, &se)
				if err != nil {
					if err == io.EOF {
						break L
					}
					return err
				}

				node := "c" + c.Id

				rdfs[0] = fmt.Sprintf("<%v> <Author> <u%v> .", node, c.UserId)
				rdfs[1] = fmt.Sprintf("<p%v> <Comment> <%v> .", c.PostId, node)
				rdfs[2] = fmt.Sprintf("<%v> <Score> \"%q\" .", node, c.Score)
				rdfs[3] = fmt.Sprintf("<%v> <Text> %q .", node, c.Text)
				rdfs[4] = fmt.Sprintf("<%v> <Timestamp> %q .", node, c.CreationDate)
				rdfs[5] = fmt.Sprintf("<%v> <Type> \"Comment\" .", node)
			}
		}
	}

	return nil
}
