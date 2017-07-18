export function getSearchResultQuery(searchTerm) {
  return `
    var(func: alloftext(Text, "${searchTerm}")) @cascade {
    	p as Post {
        ~Post(orderdesc: Timestamp, first: 1) @filter(anyoftext(Text, "${searchTerm}"))
      }
    }

    posts(func: uid(p), first: 25) {
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
