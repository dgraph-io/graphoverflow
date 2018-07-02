export function getSearchResultQuery(searchTerm) {
  return `
    var(func: alloftext(Text, "${searchTerm}")) @cascade {
    	p as Post {
        ~Post(orderdesc: Timestamp, first: 1) @filter(anyoftext(Text, "${searchTerm}"))
      }
    }

    posts(func: uid(p), first: 25) {
      uid

      Type

      # question will be fetched if this post is an answer
      question: ~Has.Answer {
        uid
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
