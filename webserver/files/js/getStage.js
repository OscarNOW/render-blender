export async function getStage({ code, id }) {
    const resp = await fetch(`/api/getStage?code=${code}&id=${id}`);
    if (resp.status === 403)
        return null;

    const stage = await resp.text();

    return stage;
}