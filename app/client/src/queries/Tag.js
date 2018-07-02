export function getQuestionByTagNameQuery(tagName) {
  return `
var(func: eq(Tag.Text, "${tagName}")) {
	p	as ~Tag(first: 25)
}

questions(func: uid(p)) {
  uid

  Title {
    Text
  }

  Owner {
    DisplayName
    Reputation
    uid
  }

  Tag {
    TagName: Tag.Text
  }

  Has.Answer(orderdesc: Timestamp, first: 1) {
    Owner {
      DisplayName
      Reputation
      uid
    }
    Timestamp
  }

  ChosenAnswerCount: count(Chosen.Answer)
  UpvoteCount: count(Upvote)
  DownvoteCount: count(Downvote)
  AnswerCount: count(Has.Answer)
  ViewCount
  Timestamp
}
`;
}

export function getRelatedTags(tagName) {
  // for 0.7.8
  //   return `
  //  {
  //    var(func: eq(Tag.Text, "${tagName}")) {
  //      ~Tag {
  //        n as math(1)
  //        Tag {
  //          sc as math(n)
  //        }
  //      }
  //    }
  //
  //    tags(func: uid(sc), orderdesc: val(sc)) {
  //      TagName: Tag.Text
  //      val(sc)
  //    }
  //  }
  // `;

  return `
me as var(func: eq(Tag.Text, "${tagName}")) {
  ~Tag {
    n as math(1)
    Tag {
      m as math(1)
      sc as math(n*m)
    }
  }
}

relatedTags(func: uid(sc), orderdesc: val(sc)) @filter(not uid(me)) {
	TagName: Tag.Text
  OverlapCount: val(sc)
}
`;
}
