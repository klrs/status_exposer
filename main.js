(function() {
    window.onload = function() {
        let client = new XMLHttpRequest();

        //status.real is a mock file. The real one can be found at /var/lib/dpkg/status on Debian and Ubuntu systems.
        client.open('GET', 'status.real');
        client.onreadystatechange = function() {
            if (client.readyState === 4) {
                //alert(xmlhttp.status);
                if (client.status === 200) {
                    parse(client.responseText);
                }
                //alert(client.responseText);
            }
        };

        client.send();
    };
})();