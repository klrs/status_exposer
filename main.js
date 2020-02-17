(function() {
    window.onload = function() {
        let client = new XMLHttpRequest();

        //status.real is a mock file. The real one can be found at /var/lib/dpkg/status on Debian and Ubuntu systems.
        client.open('GET', 's.real');
        client.onreadystatechange = function() {
            if (client.readyState === 4) {
                if (client.status === 200) {
                    let elements = parse(client.responseText);

                    //sort alphabetically
                    elements.sort((a, b) => {
                        if(a.Package < b.Package) { return -1; }
                        if(a.Package > b.Package) { return 1; }
                        return 0;
                    });
                    createTable(elements);
                }
            }
        };

        client.send();
    };
})();

function createTable(elements) {
    //creates table for html from elements array
    let table = document.getElementById("packages");

    for(let i = 0; i < elements.length; i++) {
        let tr = table.insertRow();
        let name = tr.insertCell(0);

        let elem = document.createElement('a');
        elem.title = elements[i].Package;
        elem.appendChild(document.createTextNode(elements[i].Package));

        //href will link to error page should onclick function fail for some reason
        elem.href = "error.html";
        elem.onclick = () => {
            document.getElementById("p-package").innerHTML = elements[i].Package;
            document.getElementById("p-description").innerHTML = elements[i].Description;
            document.getElementById("p-depends").innerHTML = elements[i].Depends;
            return false;
        };
        name.appendChild(elem);
        //name.innerHTML = elem;
    }
}