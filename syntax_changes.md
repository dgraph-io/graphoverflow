Hi,

@Micheldiz herer,

Any help is welcome.

TODO - Need to fix some bugs like "Vote".

Right now (4th of July, 2018) this project is working with Dgraph V1.0.6. We are using Dgraph-JS and Dgraph-JS-HTTP.

**Well Dgraph-js is a working in progress - You can use it, there are only conflicts to solve. Create a Fake user first if you do not want to  generate an RDF as the README tells.**

**This text is not just about syntax, there are other things I want to explain.**

---------------------------------------

## We no longer use the syntax below
for schema changes theres no mutation block anymore.
```JSON
mutation {
  schema {
  /** some schema here **\
  }
}
```

So the file called "schema.txt" is kind of wrong, the schema is right tho. Copy the schema and
use Ratel in the field "Alter". Or alter youself by Raw HTTP. https://docs.dgraph.io/clients/#alter-the-database-1

curl -X POST localhost:8080/alter -d 'name: string @index(term) .'

-------------------------------------------------------------------------------------

Be aware that some things in this project are in two languages (go and JS), and may still be in the old syntax.

-------------------------------------------------------------------------------------

## We no longer use the syntax below

 ` _uid_  ` 

uid syntax has chance since Dgraph v0.9.0 Release listed in https://github.com/dgraph-io/dgraph/releases?after=v0.9.4

Queries
Queries, mutations and schema updates are done through separate endpoints. Queries can no longer have a mutation block.
Queries can be done via Query Grpc endpoint (it was called Run before) or the /query HTTP handler.
_uid_ is renamed to uid. So queries now need to request for uid. 

Example:
```JSON
{
  bladerunner(func: eq(name@en, "Blade Runner")) {
    uid
    name@en
  }
}
```

-------------------------------------------------------------------------------------

## If you want to use this project for testing 

create at least one user manually using Ratel. And also copy the schema.txt and run it against alter ou bulk edit on Ratel's schema painel.
Or generate RDF correctly as the README indicates.

Below we have a mutation template that you can use to create your user, fill in the fields if necessary.
```javascript
{  set {
    <_:user> <DisplayName> "micheldiz" .
    <_:user> <GitHubAccessToken> "${accessToken}" .
    <_:user> <GitHubID> "${GitHubID}" .
    <_:user> <Reputation> "0" .
    <_:user> <CreationDate> "0" .
    <_:user> <LastAccessDate> "0" .
    <_:user> <Location> "Earth" .
    <_:user> <Type> "User" .
  }}
```

  -------------------------------------------------------------------------------------
## Windows usage

  So, On Windows I had few problems to run this PJ, some issue with deprecated usage of NodeJS.
  But can work anyway.

  We have a file called ".env.dev" there is a GitHubClientID, GitHubClientSecret and a CookieSecret.
  Copy them.

  First go to auth.js:
```javascript
 new GitHubStrategy(
      {
        clientID: "17819057342d73375cf7",
        clientSecret: "89617a432f8dc31bb581ec8582e928be15a9685c",
        callbackURL: `${callbackURL}/api/auth/github/callback`
      },
```

and then go to api.js:

change only:
```javascript
app.use(cookieParser("aa4f902do5d98810d7ae1119ac551a12"));
```
This is a silly manual solution.

I had to start separately the server and the client. I think it was some problem with Windows itself, I still do not know.

-------------------------------------------------------------------------

Maybe you will need to add ` /* eslint-disable */ ` to a bunch of code to build the JS.