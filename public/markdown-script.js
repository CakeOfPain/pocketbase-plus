

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('th').forEach(header => {
        header.addEventListener('click', () => {
            sortTable(header);
        });
    });
});

function sortTable(header) {
    const table = header.closest('table');
    const index = Array.prototype.indexOf.call(header.parentNode.children, header);
    const currentDirection = header.dataset.sortDirection;
    const direction = currentDirection === 'asc' ? 'desc' : 'asc';

    // Clear sort direction on all headers
    header.parentNode.querySelectorAll('th').forEach(th => {
        th.dataset.sortDirection = '';
    });

    // Set sort direction on the clicked header
    header.dataset.sortDirection = direction;

    const rows = Array.from(table.querySelectorAll('tbody > tr'));
    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[index].textContent.trim();
        const cellB = rowB.children[index].textContent.trim();

        if (direction === 'asc') {
            return cellA > cellB ? 1 : -1;
        } else {
            return cellA < cellB ? 1 : -1;
        }
    });

    rows.forEach(row => table.querySelector('tbody').appendChild(row));
}




document.addEventListener('DOMContentLoaded', () => {
    const navigation = document.getElementById('navigation');
    const content = document.getElementById('markdown-content');
    let links = [];
    const html_links = content.getElementsByTagName('a');
    for(let i = 0; i < html_links.length; i++) {
        if(!html_links[i].href.includes('#'))
            links.push([html_links[i].href, html_links[i].text]);
    }

    const html = links.map(link =>`<div><a href="${link[0]}">${link[1]}</a></div>`).join('');
    console.log(html);

    navigation.innerHTML = html;
});