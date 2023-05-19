/*

--fetchPriority--: low

--fileRequirements--
/common/getHeaders.js
/sdk/auth.js
--endFileRequirements--

*/

import {
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js';

import { getHeaders } from '/common/getHeaders.js';
import { auth } from '/sdk/auth.js';

import {
    logout
} from '/sdk/auth.js';
const { updateUserObject, onStateChangeCallbacks } = (await import('/sdk/auth.js'))._;

export const setDisplayName = async (displayName) => {
    if (!window.auth.user)
        throw new Error('User is not logged in')

    await updateProfile(auth.currentUser, {
        displayName
    });
    updateUserObject(auth.currentUser);
    for (const callback of onStateChangeCallbacks)
        callback(window.auth.user);
};

export const setPicture = async (picture) => {
    if (!window.auth.user)
        throw new Error('User is not logged in')

    await updateProfile(auth.currentUser, {
        photoURL: picture
    });
    updateUserObject(auth.currentUser);
    for (const callback of onStateChangeCallbacks)
        callback(window.auth.user);
};

export const deleteUser = async () => {
    if (!window.auth.user)
        throw new Error('User is not logged in')

    await fetch('/api/deleteUser', {
        headers: {
            ...await getHeaders()
        }
    });

    await logout();
};