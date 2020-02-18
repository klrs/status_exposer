(function() {
    window.onload = function() {
        let client = new XMLHttpRequest();

        //status.real is a mock file. The real one can be found at /var/lib/dpkg/status on Debian and Ubuntu systems.
        client.open('GET', 'status.real');
        client.onreadystatechange = function() {
            if (client.readyState === 4) {
                if (client.status === 200) {

                    //parses the file and gets a package array
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
                    //displayElement(elements[0]);
                }
            }
        };

        client.send();
    };
})();

function createIds(elements) {
    //create id's for all elements

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

                    if(dependency == null) {
                        pushDependency(rawDependencies[j]);
                    }
                    else {
                        pushDependency(dependency);
                        pushReverseDependency(dependency, e);
                    }
                }
                else if(Array.isArray(rawDependencies[j])) {
                    //if element is array it means that it has pipe dependency (optionals)

                    //dependency array
                    let dArr = [];

                    for(let k = 0; k < rawDependencies[j].length; k++) {

                        //find the correct dependency
                        let dependency = elements.find((element) => {
                            //console.log(element.Package+' '+rawDependencies[j][k]+' areSame:'+(element.Package == rawDependencies[j][k]));
                            return element.Package.trim() === rawDependencies[j][k].trim();
                        });

                        if(dependency == null) {
                            //if system knows no such dependency, push it to array as a string
                            //console.log(rawDependencies[j][k]);
                            dArr.push(rawDependencies[j][k]);
                        } else {
                            dArr.push(dependency);
                            pushReverseDependency(dependency, e);
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

        function pushReverseDependency(dependee, dependency) {

            if(dependee != null) {
                //check if revDependencies attribute exists in dependee
                if(!('revDependencies' in dependee)) {
                    dependee.revDependencies = [];
                }

                if(dependency != null) {
                    dependee.revDependencies.push(dependency);
                }
            }

            //console.log('pushReverseDependency:'+dependee.revDependencies)
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

    createDependencyTable();
    createRevDependencyTable();

    function createDependencyTable() {
        let table = document.getElementById("p-depends");
        table.innerHTML = "";

        //make a table of dependencies
        for(let j = 0; j < element.Dependencies.length; j++) {
            //console.log('element.Dependencies:'+element.Dependencies);

            //element.Dependencies[j] can be either array or reference
            if (Array.isArray(element.Dependencies[j])) {
                //in this case it is an array
                //which means it has alternative dependencies

                //add parantheses for alternative dependencies (optionals)
                createFillRow('(');

                for (let k = 0; k < element.Dependencies[j].length; k++) {

                    let tr = table.insertRow();
                    let name = tr.insertCell(0);

                    if (typeof element.Dependencies[j][k] === 'string') {
                        //if the system knows no such package the dependency is in string format

                        name.innerHTML = element.Dependencies[j][k];
                    } else {
                        //if element is a reference

                        name.appendChild(createAnchor(element.Dependencies[j][k]));
                    }
                }

                //add parantheses for pipe dependencies (optionals)
                createFillRow(')');
            } else {
                let tr = table.insertRow();
                let name = tr.insertCell(0);

                if (typeof element.Dependencies[j] === 'string') {
                    //if the system knows no such package the dependency is in string format

                    name.innerHTML = element.Dependencies[j];
                } else {
                    //if element is a reference

                    name.appendChild(createAnchor(element.Dependencies[j]));
                }
            }

            function createFillRow(char) {
                //inserts a row with given parameter to dependsTable with p
                let fillTr = table.insertRow();
                let fillName = fillTr.insertCell(0);
                fillName.innerHTML = char;
            }
        }
    }

    function createRevDependencyTable() {
        let table = document.getElementById("p-rev-depends");
        table.innerHTML = "";

        if(element.revDependencies != null) {
            for(let j = 0; j < element.revDependencies.length; j++) {
                let tr = table.insertRow();
                let name = tr.insertCell(0);

                //name.innerHTML = element.revDependencies[j].Package;
                name.appendChild(createAnchor(element.revDependencies[j]));
            }
        }
    }

    function createAnchor(element) {
        //creates anchor element with appropriate attributes
        let dependsA = document.createElement('a');
        dependsA.title = element.Package;
        dependsA.appendChild(document.createTextNode(element.Package));

        dependsA.href = "error.html";
        dependsA.onclick = () => {
            displayElement(element);
            return false;
        };
        return dependsA;
    }
}