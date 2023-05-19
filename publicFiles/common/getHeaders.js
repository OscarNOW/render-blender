/*

//todo: rename to getRequestHeaders

--fileRequirements--
/sdk/auth.js
/js/appCheck.js
--endFileRequirements--

*/

import { _ } from '/js/appCheck.js';

export const getHeaders = async () => {
    return {
        ...await _.getAppCheckHeaders()
        //todo: why aren't auth headers includes
    };
}