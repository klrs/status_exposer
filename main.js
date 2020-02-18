(function() {
    window.onload = function() {
        let client = new XMLHttpRequest();

        //status.real is a mock file. The real one can be found at /var/lib/dpkg/status on Debian and Ubuntu systems.
        client.open('GET', 'status.real');
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

                    createIds(elements);
                    mapDependencies(elements);
                    createTable(elements);
                    displayElement(elements[0]);
                }
            }
        };

        client.send();
    };
})();

function createIds(elements) {
    for(let e = 0; e < elements.length; e++) {
        elements[e].id = e;
    }
}


function mapDependencies(elements) {
    //maps dependencies to all elements (packages) by
    //creating a new array for each element, that holds references to dependency objects

    for(let i = 0; i < elements.length; i++) {
        let e = elements[i];

        //create new Dependencies attribute for element (package)
        e.Dependencies = [];

        if(e.Depends != null) {

            //dependencies in string (or array, if pipe dependency) format from Depends field
            let rawDependencies = e.Depends;

            for(let j = 0; j < rawDependencies.length; j++) {
                if(typeof rawDependencies[j] === 'string') {
                    let dependency = elements.find((element) => {
                        return element.Package === rawDependencies[j];
                    });
                    pushDependency(dependency);
                }
                else if(Array.isArray(rawDependencies[j])) {
                    //if element is array it means that it has pipe dependency (optionals)

                    //dependency array
                    let dArr = [];

                    for(let k = 0; k < rawDependencies[j].length; k++) {
                        let dependency = elements.find((element) => {
                            //console.log(element.Package+' '+rawDependencies[j][k]+' areSame:'+(element.Package == rawDependencies[j][k]));
                            return element.Package.trim() === rawDependencies[j][k].trim();
                        });
                        if(dependency == null) {
                            //if system knows no such dependency, push it to array as a string
                            console.log(rawDependencies[j][k]);
                            dArr.push(rawDependencies[j][k]);
                        }else {
                            dArr.push(dependency);
                        }
                    }
                    pushDependency(dArr);
                }
            }
        }

        function pushDependency(dependency) {
            //pushes dependency to e.Dependencies if it's not null
            if(dependency != null) {
                //console.log('pushDependency:\nElement '+e.Package+' depends on '+dependency.Package);
                e.Dependencies.push(dependency);
            }
        }
    }
}


function createTable(elements) {
    //creates table for html from elements array

    let table = document.getElementById("packages");

    for(let i = 0; i < elements.length; i++) {
        let tr = table.insertRow();
        let name = tr.insertCell(0);

        let a = document.createElement('a');
        a.title = elements[i].Package;
        a.appendChild(document.createTextNode(elements[i].Package));

        //href will link to error page should onclick function fail for some reason
        a.href = "error.html";

        a.onclick = () => {
            displayElement(elements[i]);
            return false;
        };
        name.appendChild(a);
        //name.innerHTML = elem;
    }
}

function displayElement(element) {
    //displays element (package) on the right side of the screen

    //set title & description
    document.getElementById("p-package").innerHTML = element.Package;
    document.getElementById("p-description").innerHTML = element.Description;

    let dependsTable = document.getElementById("p-depends");
    dependsTable.innerHTML = "";

    //make a table of dependencies
    for(let j = 0; j < element.Dependencies.length; j++) {
        //console.log('element.Dependencies:'+element.Dependencies);
        if(Array.isArray(element.Dependencies[j])) {

            //add parantheses for pipe dependencies (optionals)
            createFillRow('(');

            for(let k = 0; k < element.Dependencies[j].length; k++) {

                let dependsTr = dependsTable.insertRow();
                let dependsName = dependsTr.insertCell(0);

                if(typeof element.Dependencies[j][k] === 'string') {
                    //if the system knows no such package the dependency is in string format

                    dependsName.innerHTML = element.Dependencies[j][k];
                }
                else {
                    //if element is a reference

                    dependsName.appendChild(createAnchor(element.Dependencies[j][k]));
                }
            }

            //add parantheses for pipe dependencies (optionals)
            createFillRow(')');
        }
        else {
            let dependsTr = dependsTable.insertRow();
            let dependsName = dependsTr.insertCell(0);

            if(typeof element.Dependencies[j] === 'string') {
                //if the system knows no such package the dependency is in string format

                dependsName.innerHTML = element.Dependencies[j];
            }
            else {
                //if element is a reference

                dependsName.appendChild(createAnchor(element.Dependencies[j]));
            }
        }

        function createFillRow(char) {
            //inserts a row with given parameter to dependsTable with p
            let fillTr = dependsTable.insertRow();
            let fillName = fillTr.insertCell(0);
            fillName.innerHTML = char;
        }
    }

    function createAnchor(dependency) {
        //creates anchor element with appropriate attributes
        let dependsA = document.createElement('a');
        dependsA.title = dependency.Package;
        dependsA.appendChild(document.createTextNode(dependency.Package));

        dependsA.href = "error.html";
        dependsA.onclick = () => {
            displayElement(dependency);
            return false;
        };
        return dependsA;
    }
}