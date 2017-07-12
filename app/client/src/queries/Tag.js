export function getQuestionByTagNameQuery(tagName) {
  return `
{
  var(func: eq(Tag.Text, "${tagName}")) {
  	p	as ~Tag(first: 25)
  }

  questions(id: var(p)) {
    _uid_

    Title {
      Text
    }

    Owner {
      DisplayName
      Reputation
      _uid_
    }

    Tag {
      TagName: Tag.Text
    }

    Has.Answer(orderdesc: Timestamp, first: 1) {
      Owner {
        DisplayName
        Reputation
        _uid_
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
}
`;
}
