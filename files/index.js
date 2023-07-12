const file = document.getElementById('file');
const form = document.getElementById('form');
const code = document.getElementById('code');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = new URL(form.action);

    url.searchParams.set('code', code.value);
    url.searchParams.set('fileName', file.files[0].name);

    console.log(url);

    const fetchOptions = {
        method: form.method,
        body: file.files[0]
    };

    await fetch(url, fetchOptions);

    alert('Done');

    return;
});