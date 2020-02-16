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
                //alert(input[i+1]);
                if(input[i+1] !== ' ') {
                    //this is where parser goes on to next key/value pair
                    let prunedKey = key.split(' ').join('');
                    if(prunedKey === 'Package') {
                        //Each element starts with key package, so instantiate new element should key be "Package"
                        if(element !== null){
                            elements.push(element);
                        }
                        element = new Object();
                    }
                    element[prunedKey] = value;

                    key = "";
                    value = "";
                    isKey = true;
                    break;
                }
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
    }
    console.log(elements);
    return elements;
}