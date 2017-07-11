export function getSearchResultQuery(searchTerm) {
  //   return `
  // questions(func: eq(Type, "Question")) @cascade {
  //   _uid_
  //
  //   Title @filter(anyoftext(Text, "${searchTerm}")) {
  // 		Text
  //   }
  //
  //   Owner {
  //     DisplayName
  //     Reputation
  //     _uid_
  //   }
  //
  //   Tag {
  //     TagName: Tag.Text
  //   }
  //
  //   Has.Answer(orderdesc: Timestamp, first: 1) {
  //     Owner {
  //       DisplayName
  //       Reputation
  //       _uid_
  //     }
  //     Timestamp
  //   }
  //
  //   ChosenAnswerCount: count(Chosen.Answer)
  //   UpvoteCount: count(Upvote)
  //   DownvoteCount: count(Downvote)
  //   AnswerCount: count(Has.Answer)
  //   ViewCount
  //   Timestamp
  // }
  // `;
  return `

    var(func: anyoftext(Text, "${searchTerm}")) @cascade {
    	p as Post {
        ~Post(orderdesc: Timestamp, first: 1) @filter(anyoftext(Text, "${searchTerm}"))
      }
    }

    posts(id: var(p), first: 10) {
      _uid_

      Type

      # question will be fetched if this post is an answer
      question: ~Has.Answer {
        _uid_
        Title {
          Text
        }
      }

      Title {
    		Text
      }
      Body {
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
  `;
}
