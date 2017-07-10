export function getSearchResultQuery(searchTerm) {
  return `
{
  questions(func: eq(Type, "Question")) @cascade {
    _uid_

    Title @filter(anyoftext(Text, "${searchTerm}")) {
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

  //   return `
  // {
  //   var(func: anyoftext(Text, "${searchTerm}")) @cascade {
  //   	p as Post {
  //       ~Post(orderdesc: Timestamp, first: 1)@filter(anyoftext(Text, "${searchTerm}"))
  //     }
  //   }
  //
  //   posts(func: var(p), first: 1) {
  //     Title {
  //       Text
  //     }
  //     Body {
  //       Text
  //     }
  //     Type
  //   }
  // }
  // `;
}
