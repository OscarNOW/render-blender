/*

--fileRequirements--
/js/firebase.js
/sdk/language.js
/sdk/auth.js
/common/getHeaders.js
/api/getUserRoles
--endFileRequirements--

*/

import {
    getAnalytics,
    logEvent as analyticsLogEvent,
    setUserProperties
} from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-analytics.js';

import { app } from '/js/firebase.js';
import { getHeaders } from '/common/getHeaders.js';

export const analytics = getAnalytics(app);

export function updateEffectiveLanguage(effectiveLanguage) {
    setUserProperties(analytics, { effectiveLanguage });
}

export function logEvent(name, params) {
    analyticsLogEvent(analytics, name, params);
}

(async () => { //to avoid import loops

    const { onStateChange } = await import('/sdk/auth.js');

    onStateChange(async (user) => {
        setUserProperties(analytics, { user: user?.id ?? null });

        const response = await fetch('/api/getUserRoles', {
            headers: {
                ...await getHeaders()
            }
        });

        if (!response.ok)
            throw new Error(`${response.status} ${response.statusText}`);

        const userRoles = await response.json();

        setUserProperties(analytics, { userRoles: userRoles.join(' ') });
    });

})();