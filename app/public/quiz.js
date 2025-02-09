async function main() {
    const urlParams = new URLSearchParams(window.location.search);
    let targetlang = urlParams.get('lang');
    let userid = await getUserID();
    let lastQuiz = await getRecentQuiz(userid);
    console.log(lastQuiz);
    let quizWord = await getWord();
    if (lastQuiz.length == 0) {
        let hh = document.getElementById('hh');
        hh.textContent = 'Let\'s add a new word to your vocabulary';
        takeQuiz(quizWord, targetlang, userid, 'quizcd.html', false);
    }
    const timestamp = Date.now();
    const lastQuizTimestamp = Date.parse(lastQuiz[0].taken_at);
    console.log(timestamp - lastQuizTimestamp);
    if (window.location.href.indexOf('requiz') == -1) {
        if (timestamp - lastQuizTimestamp < 86400000) {
            window.location.href = 'quizcd.html'
        }
        let previousWords = [];
        let requestData = await getPreviousWords(userid);
        for (const entry of requestData) {
            previousWords.push(entry.word);
        }
        while (previousWords.includes(quizWord)) {
            quizWord = await getWord();
        }
        takeQuiz(quizWord, targetlang, userid, 'quizcd.html', false);
    }
    else {
        takeQuiz(lastQuiz[0].word, lastQuiz[0].lang, userid, "quiz.html?lang=" + lastQuiz[0].lang, true);
    }
};

async function takeQuiz(quizWord, targetlang, userid, redirect, isReQuiz) {
    let succeses = 0;
    let attempts = 0;
    let quizOptions = [];

    let header = document.getElementById('header');
    let str = header.textContent.slice(0, 25) + quizWord + header.textContent.slice(25);
    header.textContent = str;
    quizOptions.push(quizWord);
    while(quizOptions.length < 3) {
        let quizOption = await getWord();
        if(!quizOptions.includes(quizOption))
            quizOptions.push(quizOption);
    };

    let quizOptionsTranslated = await translateWords(quizOptions, targetlang);
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
        if(this.textContent.trim() === quizWordTranslated) {
            q1.removeEventListener('click', onClick);
            q2.removeEventListener('click', onClick);
            q3.removeEventListener('click', onClick);
            q1.className = 'question-clicked';
            q2.className = 'question-clicked';
            q3.className = 'question-clicked';
            this.style.backgroundColor = '#5bd123';
            succeses++;
            attempts++;
            if (!isReQuiz)
                insertQuiz(userid, quizWord, targetlang, succeses, attempts);
            setTimeout(() => { 
                window.location.href = redirect;
            }, 1000);
        }
        else {
            this.className = 'question-clicked';
            this.style.backgroundColor = '#e74c3c';
            this.removeEventListener('click', onClick);
            attempts++;
        }
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

async function translateWords(quizOptions, targetlang) {
    try {
        const response = await fetch('/translate', {
            method: 'POST',
            body: JSON.stringify({q: quizOptions, source: 'en', target: targetlang, format: 'text'}),
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
};

async function getUserID() {
    try {
        const response = await fetch('/user-data', {
            method: 'GET',
            credentials: 'include',
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const { username } = await response.json();

        const response2 = await fetch('/userid', {
            method: 'POST',
            body: JSON.stringify({username: username}),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const { userid } = await response2.json();
        if(!response2.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        return userid;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

async function getPreviousWords(userid) {
    try {
        const response = await fetch('/get-quiz-words', {
            method: 'POST',
            body: JSON.stringify({userid: userid}),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        return response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

async function getRecentQuiz(userid) {
    try {
        const response = await fetch('/get-recent-quiz', {
            method: 'POST',
            body: JSON.stringify({userid: userid}),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        return response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

async function insertQuiz(userid, word, lang, successes, attempts) {
    try {
        const response = await fetch('/insert-quiz', {
            method: 'POST',
            body: JSON.stringify({userid: userid, word: word, lang: lang, successes: successes, attempts: attempts}),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        } 
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

main().catch(console.log);