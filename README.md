# Backend

Back end code repository for SENG499 Summer 2022 project.

## Develop

To run the backend locally you need to run a Postgres database and the GraphQL server separately. After cloning the repo, follow these steps to get things up and running:

1. Run `npm ci` to install the project's dependencies
2. Run `docker-compose up` to boot up a Docker container running the Postgres database
3. Run `./setup.sh` to start the GraphQL server at [`http://localhost:4000/`](localhost:4000). This script does the following:
   - Runs necessary database migrations
   - Seeds the database with dummy data for testing
   - Runs the server (automatically reloads with changes to codebase)

## Contributors

- Keith Radford (@keithradford)
- Anmol Monga (@a-mon)
- Finn Morin (@rcrossf)
- Eduardo Szeckir (@szeckirjr)
- Peter Wilson (@peterrwilson99)
