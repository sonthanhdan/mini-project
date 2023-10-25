# mini-project
Technical Assessments

Frontend Using [Next.js](https://nextjs.org/)
Backend Using [Nest.js](https://nestjs.com/)
Main programming language typescript
###  Require:
- [Docker](https://www.docker.com/products/docker-desktop/) or [Orbstack](https://orbstack.dev)
- Nodejs version v18

### Installation
```
docker-compose up -d
```
```
cd frontend && yarn install
```
```
cd backend && yarn install
```

### Start Application

```
cd frontend && yarn dev
```
```
cd backend && yarn start:dev
```
Apps:
Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.
```
    # frontend
    localhost:4000

    # api backend
    localhost:3000
```
### Todo
[x] Initial project
[x] Upload a CSV file with appropriate feedback to the user on the upload progress.
[] List the data uploaded with pagination.
[] Search data from the uploaded file. The web application should be responsive while listing of data and searching of data.
[] Write unit tests with complete test cases including edge cases

### Roadmap
[] Handle large csv files
[] Scale for multiple users upload at the same time
[] Build ui components for maintainable and reuseable
[] Write CI-CD deployment
