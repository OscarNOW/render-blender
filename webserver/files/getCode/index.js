import { setCookie } from '/js/cookie.js';

const form = document.getElementById('form');
const code = document.getElementById('code');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    setCookie('code', code.value);
    window.location.href = '/';
});