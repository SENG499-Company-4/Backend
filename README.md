# Backend

Back end code repository for SENG499 Summer 2022 project.

## Develop
To run the backend locally you need to run a Postgres database and the GraphQL server separately. After cloning the repo, follow these steps to get things up and running:
1. Run `npm ci` to install the project's dependencies
1. Run `docker-compose up` to boot up a Docker container running the Postgres database
2. Run `./setup.sh` to start the GraphQL server at [`http://localhost:4000/`](localhost:4000). This script does the following:
   - Runs necessary database migrations
   - Seeds the database with dummy data for testing
   - Runs the server (automatically reloads with changes to codebase)

### Authorization

To run queries and mutations in Apollo Server that rely on authentication, you need to pass a valid token in the `Authorization` request header. You can do that by going to the `Headers` tab near the bottom of Apollo Server:

<img width="532" alt="Screen Shot 2022-06-21 at 10 57 35 AM" src="https://user-images.githubusercontent.com/53020925/174867061-2091eac7-a6bf-4ea6-b346-f3708a76f2cb.png">

The following tokens can be entered for different testing purposes:
* **User**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjM1LCJpYXQiOjE2NTU4MzQyMDJ9.LVAWpkgfM59R1aXVhkjxwMCw9zLlohEKgcxMAunLVn4`
* **Admin**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQwLCJpYXQiOjE2NTU4MzQzNjd9.dzq10dUHj-KGGrAbgpjb3AkfqNTUyHwfBcncrBKYoPA`
## Contributors

- Keith Radford (@keithradford)
- Anmol Monga (@a-mon)
- Finn Morin (@rcrossf)
- Eduardo Szeckir (@szeckirjr)
- Peter Wilson (@peterrwilson99)
