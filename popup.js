var send = document.getElementById("send");
var cancel = document.getElementById("cancel");

//for connection background.js
browser.runtime.sendMessage({msg:"OPENPOPUP"}, TableDraw);


//html draw
function TableDraw(message) {
    if (message.msg=="CHECKRESULT"){
        let date1=new Date();
        checkResult = message.checkResult;
        //console.log(date1 + "] popup: " + checkResult);
        if (checkResult.length > 0 ) {
            for (let i = 0; i < checkResult.length; i++) {
                table = document.getElementById("addressList");
                newRow = table.insertRow(-1);
                //#
                newCell = newRow.insertCell(0);
                newText = document.createTextNode(i);
                newCell.appendChild(newText);
                //email
                newCell = newRow.insertCell(1);
                newText = document.createTextNode(checkResult[i]);
                newCell.appendChild(newText);
            }
        }
    }
};


//send email
send.addEventListener("click", async (evnet) => {
 
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    let tabId = tabs[0].id;
    let send = true;
    browser.runtime.sendMessage({ tabId, send });
    window.close();

}, false);


//cancel sending email
cancel.addEventListener("click", async (event) => {

    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    let tabId = tabs[0].id;
    let send = false;
    browser.runtime.sendMessage({ tabId, send });
    window.close();

}, false);
