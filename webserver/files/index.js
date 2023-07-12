const path = document.getElementById('path');
const form = document.getElementById('form');
const code = document.getElementById('code');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const url = new URL(form.action);

    url.searchParams.set('code', code.value);
    url.searchParams.set('filePath', path.value);

    await fetch(`/api/render?code=${code.value}&filePath=${path.value}`);

    alert('Done')

    return;
});