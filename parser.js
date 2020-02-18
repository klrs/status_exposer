function parse(input) {
    //Returns the status packages in an array of objects format with key-value pairs
    //Argument input is the file contents in a string format

    //array of packages
    let elements = [];

    //one package
    let element = null;

    //flag which tells the parser below to read characters either as a key or a value
    let isKey = true;

    let key = "";
    let value = "";

    for (let i = 0; i < input.length; i++) {

        //SYNTAX PARSER
        switch(input[i]) {
            case ':':
                isKey = false;
                break;
            case '\n':
                if(input[i+1] !== ' ') {
                    //this is where parser goes on to next key/value pair
                    let prunedKey = key.trim();
                    switch(prunedKey) {
                        case 'Depends':
                            element[prunedKey] = parseDepends(value);
                            break;
                        case 'Package':
                            //Each element starts with key package, so instantiate new element should key be "Package"
                            //Push old element to elements array
                            if(element !== null){
                                elements.push(element);
                            }
                            element = new Object();
                            value = value.trim();
                            //falls to default...
                        default:
                            element[prunedKey] = value;
                    }

                    key = "";
                    value = "";
                    isKey = true;
                    break;
                }
                //else fall to default
            default:
                switch(isKey) {
                    case true:
                        key = key + input[i];
                        break;
                    case false:
                        value = value + input[i];
                        break;
                }
        }

        //if end-of-file, push element to array.
        //This is to make sure no package is left out
        if(i === input.length-1){
            elements.push(element);
        }
    }
    console.log(elements);
    return elements;
}

function parseDepends(input) {
    //parses the Depends section of status file.
    //called from parse

    //dependencies array
    //containes string and arrays (if there are optionals)
    let dependsArr = [];

    //name of a single dependency
    let dependsName = "";

    //array of alternative packages
    let optionals = [];

    //if true parser omits characters
    let skip = false;

    for(let i = 0; i < input.length; i++) {
        switch(input[i]) {
            case '|':
                optionals.push(dependsName.trim());
                dependsName = "";
                break;
            case ',':
                if(optionals.length !== 0) {
                    optionals.push(dependsName.trim());
                    dependsArr.push([...optionals]);
                    optionals = [];
                }
                else {
                    dependsArr.push(dependsName.trim());
                }
                dependsName = "";
                break;
            case '(':
                skip = true;
                break;
            case ')':
                skip = false;
                break;
            default:
                if(!skip) {
                    dependsName = dependsName + input[i];
                }
                break;
        }

        if(i === input.length-1){
            if(optionals.length !== 0) {
                optionals.push(dependsName.trim());
                dependsArr.push([...optionals]);
                optionals = [];
            }
            else {
                dependsArr.push(dependsName.trim());
            }
        }
    }
    //console.log(dependsArr);
    return dependsArr;
}