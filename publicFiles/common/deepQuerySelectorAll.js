export function deepQuerySelectorAll(selector, root = document) {
    const results = [...root.querySelectorAll(selector)];

    const pushNestedResults = (root) => {
        for (const element of deepQuerySelectorAll(selector, root))
            if (!results.includes(element)) results.push(element);
    };

    if (root.shadowRoot) pushNestedResults(root.shadowRoot);

    for (const element of root.querySelectorAll('*'))
        if (element.shadowRoot) pushNestedResults(element.shadowRoot);

    return results;
}