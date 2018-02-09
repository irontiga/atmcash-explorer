function burstapi(params){
    return new Promise(function(resolve, reject){
        params = Object.keys(params).map(function (k) {
            return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
        }).join('&');

        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function(){
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200){

                    var result = JSON.parse(httpRequest.responseText);

                    resolve(result);
                }
            }
        };
        httpRequest.open("GET", API_URL + "?" + params);
        httpRequest.send();
    });
}