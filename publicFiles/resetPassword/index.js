/*

--fetchPriority--: high

--fileRequirements--
/sdk/auth.js
/js/login.js
/js/analytics.js
--endFileRequirements--

*/

import {
    login
} from '/sdk/auth.js';

import {
    sendPasswordResetEmail
} from '/js/login.js';

import { logEvent } from '/js/analytics.js';

const emailInput = document.getElementById('emailInput');
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('redirect'))
    document.getElementById('loginBackButton').href += `?redirect=${encodeURIComponent(urlParams.get('redirect'))}`;

window.sendResetEmail = async () => {
    if (emailInput.value === '') {
        return window.Toastify({
            text: 'Please enter your email address.',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            backgroundColor: '#f44336'
        }).showToast();
    }

    try {
        await sendPasswordResetEmail(emailInput.value);
        logEvent('password_rest_email_sent');
        emailInput.value = '';
        window.Toastify({
            text: 'Password reset email sent! Please check your inbox.',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            backgroundColor: '#4caf50',
            //when done, redirect to login page
            callback: () => {
                login();
            }
        }).showToast();
    } catch (error) {
        window.Toastify({
            text: 'An error occurred while sending the password reset email.',
            duration: 3000,
            gravity: 'top',
            position: 'center',
            backgroundColor: '#f44336'
        }).showToast();
    }
}

emailInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter')
        window.sendResetEmail();

    //check if email is valid
    if (emailInput.value.includes('@') && emailInput.value.includes('.'))
        document
            .getElementById('sendResetEmailButton')
            .classList.remove('disabled');
    else
        document
            .getElementById('sendResetEmailButton')
            .classList.add('disabled');
});

document
    .getElementById('sendResetEmailButton')
    .addEventListener('mousedown', () => {
        if (
            document
                .getElementById('sendResetEmailButton')
                .classList.contains('disabled') === true
        )
            return window.Toastify({
                text: 'Please enter a valid email address.',
                duration: 3000,
                gravity: 'top',
                position: 'center',
                backgroundColor: '#f44336'
            }).showToast();
        else
            window.sendResetEmail();
    });
