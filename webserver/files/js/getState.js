export async function getState({ code, id }) {
    const resp = await fetch(`/api/getState?code=${code}&id=${id}`);
    if (resp.status === 403)
        return null;

    const state = await resp.text();

    return state;
}