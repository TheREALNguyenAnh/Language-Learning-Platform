fetch('/translate', {
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
})