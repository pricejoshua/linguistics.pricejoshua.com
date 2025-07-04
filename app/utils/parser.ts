// takes in html files from phonology assistant and returns a list of all the phones in the chart
export function extractPhonesFromHtml(html: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const phones: string[] = [];

    // Only extract <span lang=...> inside <td> (IPA phones)
    const tdElements = doc.querySelectorAll("table tr td");
    tdElements.forEach(td => {
        const span = td.querySelector('span[lang]');
        const text = span?.textContent?.trim();
        if (text && text.length > 0 && !phones.includes(text)) {
            phones.push(text);
        }
    });

    return phones;
}