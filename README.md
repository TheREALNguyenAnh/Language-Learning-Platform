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
`GET /mwd/:word`    returns a JSON body consisting of the short definition & audio URL provided by the Meriam Webster Collegiate Dictionary API.\
Response format:

    {'shortdef': shortdef, 'audiourl': audiourl}`
`POST /translate`   request should be a JSON body formatted as such:

    {
        q: "The Great Pyramid of Giza"
        source: "en",
        target: "es",
        format: "text"
    }
where source and target correspond to the [ISO 639](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes) lanugage codes for the source and target languages, respectively.\
Response format:

    {
        "data": {
            "translations": [{
                "translatedText": "La Gran Pirámide de Giza"
            }]
        }
    }
You can also batch multiple strings together in order to reduce the number of requests to the Google Cloud API:

    {
        "q": ["Hello world", "My name is Jeff"],
        "target": "de"
    }
Response format:

    {
        "data": {
            "translations": [
                {
                    "translatedText": "Hallo Welt",
                    "detectedSourceLanguage": "en"
                },
                {
                    "translatedText": "Mein Name ist Jeff",
                    "detectedSourceLanguage": "en"
                }
            ]
        }
    }