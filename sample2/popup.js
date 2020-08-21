
var emailList = [];

function getHeaderList(message){
    
    // look for author
    emailList.push({
        "to_or_cc":"from",
        "email":message.author,
        "department":"no department",
        "job" : "no job title"
    });
    
    // loop for recpient
    for (let i=0; i<message.recipients.length; i++) {
        emailList.push({
            "to_or_cc":"to",
            "email":message.recipients[i],
            "department":"no department",
            "job" : "no job title"
        });
    }
    
    // loop for ccList
    for (let i=0; i<message.ccList.length; i++) {

        emailList.push({
            "to_or_cc":"cc",
            "email":message.ccList[i],
            "department":"no department",
            "job" : "no job title"
        });          
    }
    
    return emailList;
}


function stripeEmailAddress(emailList){
    //display address name e.t.c
    for (let i=0; i<emailList.length; i++) {

        //strip email address
        let lastsignal;
        lastsignal = emailList[i].email.lastIndexOf('>');
        if (lastsignal == -1) {
   
            //just emamil only, so no updated

        } else {

            //format [name <email>]: so format strip name(transfer just only email address)
            let firstsignal;
            firstsignal = emailList[i].email.lastIndexOf('<', emailList[i].length - 1);
            emailList[i].email = emailList[i].email.substring(firstsignal+1, lastsignal);

        }
    }
    
    return emailList;
}


function getContactInfo(result, emailList){

    emailList.email = result[0].properties.DisplayName;
    emailList.department = result[0].properties.Department;
    if (result[0].properties.JobTitle) {
        emailList.job = result[0].properties.JobTitle; // avoid undefined
    } else {
        emailList.job = "";
    }    

    return emailList;
}


function drawHTML(to_cc, email, department, job){

    table = document.getElementById("table");
    newRow = table.insertRow(-1);
    //to or cc
    newCell = newRow.insertCell(0);
    newText = document.createTextNode(to_cc);
    newCell.appendChild(newText);

    //e-mail address or displayName(if addressbook search true)
    newCell = newRow.insertCell(1);
    newText = document.createTextNode(email);
    newCell.appendChild(newText);

    //department address
    newCell = newRow.insertCell(2);
    newText = document.createTextNode(department);
    newCell.appendChild(newText);

    //job address
    newCell = newRow.insertCell(3);
    newText = document.createTextNode(job);                    
    newCell.appendChild(newText);

}



function drawHTMLTable(emailList, result){
    for (let i=0; i<emailList.length; i++) {
        let flag=false;
        for (let j=0; j<result.length; j++) {
            if (emailList[i].email == result[j].properties.PrimaryEmail){
                flag=true
                if (result[j].properties.DisplayName.indexOf(" [") != -1) {
                    emailList[i].email = result[j].properties.DisplayName.substring(0, result[j].properties.DisplayName.indexOf(" ["));
                }
                if (!result[j].properties.JobTitle) {
                    result[j].properties.JobTitle=""; //avoid undefined
                }
                drawHTML(emailList[i].to_or_cc, emailList[i].email, result[j].properties.Department, result[j].properties.JobTitle);
                break;
            }
        }
        if (flag==false){
            drawHTML(emailList[i].to_or_cc, emailList[i].email, emailList[i].department, emailList[i].job);
        }
    }
}


browser.tabs.query({
   active: true,
   currentWindow: true,
}).then(tabs => {
    let tabId = tabs[0].id;
    let addressbookid="";
    
    //lookup address
    browser.addressBooks.list(false).then((list) => {
        for(let i = 0; i < list.length; i++) {
            if (list[i].name == "個人用アドレス帳") {
                addressbookid = list[i].id;
            }
        }
    }).then(() => {

        browser.messageDisplay.getDisplayedMessage(tabId).then((message) => {
        
            emailList = getHeaderList(message);
            
        }).then(() => {
    
            emailList = stripeEmailAddress(emailList);
            
        }).then(() => {
            
            // all contacts search
            browser.contacts.quickSearch(parentId=addressbookid, PrimaryEmail="@").then((result) => {
                
                drawHTMLTable(emailList, result); 

            });   
        });
    });
});
