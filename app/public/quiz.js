
/*fetch('/translate', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({q: 'I see a beautiful sunrise', source: 'en', target: 'fr', format: 'text'}),
}).then(response => {
    return response.json();
}).then(body => {
    let p = document.getElementById('pp');
    p.textContent = body.data.translations[0].translatedText;
}).catch(error => {
    console.log(error);
});*/

async function main() {
    let quizOptions = [];
    let quizWord = await getWord();
    
    let header = document.getElementById('header');
    let str = header.textContent.slice(0, 25) + quizWord + header.textContent.slice(25);
    header.textContent = str;
    quizOptions.push(quizWord);
    while(quizOptions.length < 3) {
        let quizOption = await getWord();
        if(!quizOptions.includes(quizOption))
            quizOptions.push(quizOption);
    };

    let quizOptionsTranslated = await translateWords(quizOptions);
    let quizWordTranslated = quizOptionsTranslated[0].translatedText;
    let index = quizOptionsTranslated.length;
    while (index != 0) {
        let random = Math.floor(Math.random() * index);
        index--;
        [quizOptionsTranslated[index], quizOptionsTranslated[random]] = [quizOptionsTranslated[random], quizOptionsTranslated[index]];
    }

    let q1 = document.getElementById('q1');
    q1.children[0].textContent = quizOptionsTranslated[0].translatedText;
    let q2 = document.getElementById('q2');
    q2.children[0].textContent = quizOptionsTranslated[1].translatedText;
    let q3 = document.getElementById('q3');
    q3.children[0].textContent = quizOptionsTranslated[2].translatedText;

    function onClick(event) {
        if(this.textContent.trim() === quizWordTranslated)
            this.style.backgroundColor = '#5bd123';
        else
            this.style.backgroundColor = '#e74c3c';
    }

    q1.addEventListener('click', onClick);
    q2.addEventListener('click', onClick);
    q3.addEventListener('click', onClick);
};

async function getWord() {
    try {
        const response = await fetch('/random-word');
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const text = await response.text();
        return text;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

async function translateWords(quizOptions) {
    const urlParams = new URLSearchParams(window.location.search);
    let targetLang = urlParams.get('lang');
    try {
        const response = await fetch('/translate', {
            method: 'POST',
            body: JSON.stringify({q: quizOptions, source: 'en', target: targetLang, format: 'text'}),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const json = await response.json();
        return json.data.translations;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

main().catch(console.log);