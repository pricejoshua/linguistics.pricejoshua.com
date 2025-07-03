// takes in html files from phonology assistant and returns a list of all the phones in the chart
export function extractPhonesFromHtml(html: string): string[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const phones: string[] = [];

    // Assume phones are in <td> elements within a chart/table
    const tdElements = doc.querySelectorAll("table tr td");
    tdElements.forEach(td => {
        const text = td.textContent?.trim();
        if (text && text.length > 0 && !phones.includes(text)) {
            phones.push(text);
        }
    });

    return phones;
}