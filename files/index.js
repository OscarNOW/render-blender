const file = document.getElementById('file');
const form = document.getElementById('form');
const code = document.getElementById('code');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = new URL(form.action);
    const formData = new FormData(form);

    url.searchParams.set('code', code.value);
    url.searchParams.set('fileName', file.files[0].name);

    console.log(url);

    const fetchOptions = {
        method: form.method,
        body: formData
    };

    await fetch(url, fetchOptions);

    console.log('Done')

});