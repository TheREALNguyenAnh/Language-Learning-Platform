# Language Learning Platform - Dragonlingo
### Setup
First run `npm i`\
Then run `npm run setup:dev` to setup your database\
Create an .env in the style of env_sample\
API keys are needed and should be stored in keys.json\
`npm run start:dev` to start the server

### External API Documentation
[Meriam Webster](https://dictionaryapi.com/products/json)\
[Google Cloud Translation](https://cloud.google.com/translate/docs/reference/rest)

### Endpoint Documentation
`GET /random-word`  returns a single string consisting of a random word selected from the array contained in sample-words.json\
`GET /mwd/:word`    returns JSON consisting of the short definition, pronounciation audio URL extracted from the full JSON response from the Meriam Webster Collegiate Dictionary API in the format
`{'shortdef': shortdef, 'audiourl': audiourl}`