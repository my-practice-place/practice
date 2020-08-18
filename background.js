let promiseMap = new Map();
var checkResult = [];
var pattern = "@.*gmail\.(com|co\.jp)"
browser.composeAction.disable();


// "name <email address>" format convert to "email address" format
function stripname(email, length) {
    for (let i=0; i<length; i++) {
        let lastsignal;
        let firstsignal;
        lastsignal = email[i].lastIndexOf('>');
        if (lastsignal == -1) {
            //just email address only, so no updated
            //console.log("just email only: " + email);    
        } else {
            //format [name <email>]: so format strip name(transfer just only email address)
            firstsignal = email[i].lastIndexOf('<', email[i].length - 1);
            email[i] = email[i].substring(firstsignal+1, lastsignal);
        }
    }
    return email;
}


//onBeforeSend address strip and domain confirm
browser.compose.onBeforeSend.addListener(async (tab, details) => {

    let to, cc, bcc = [];
    to = stripname(details.to, details.to.length);
    cc = stripname(details.cc, details.cc.length);
    bcc = stripname(details.bcc, details.bcc.length);
    browser.compose.setComposeDetails(tab.id, { to: to, cc: cc, bcc: bcc });
    browser.compose.getComposeDetails(tab.id).then((d) => {
        //if not exist "getComposeDetails", setComposeDetails can not reflect.
        //console.log("details of after setComposeDetails: ", d);
    });
   
   
    let popupFlag = false;
    checkResult = [];
   
    email=to.concat(cc);
    email=email.concat(bcc);
   
    for (let i = 0; i < email.length; i++) {
        if (email[i].match(pattern) === null) {
            popupFlag = true;
            checkResult.push(email[i]);
        }
    }
   
    //let date = new Date();
    //console.log(date + "] checkResult: " + checkResult);
   
    if (popupFlag) {
        browser.composeAction.enable(tab.id);
        browser.composeAction.openPopup();
       
        // Do NOT lose this Promise. Most of the compose window UI will be locked
        // until it is resolved. That's a very good way to annoy users.
        return new Promise(resolve => {
            promiseMap.set(tab.id, resolve);
        });
    }

});


//when popup is opend, send response address confirm result
browser.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        if (message.msg == "OPENPOPUP"){
            sendResponse(
                {msg:"CHECKRESULT", checkResult}
            );
            let date = new Date();
            console.log(date + "] initConnect:" + checkResult);
            return true;
        }
    }
);


//send or cancel
browser.runtime.onMessage.addListener(message => {
    let resolve = promiseMap.get(message.tabId);
    if (!resolve) {
        // How did we get here?
        return;
    }
   
    browser.composeAction.disable(message.tabId);    
    if (message.send) {
        resolve();
    } else {
        resolve({ cancel: true });
    }
});
