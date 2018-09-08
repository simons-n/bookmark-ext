document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({type: "makeList"});
});

function makeButtons(retrievedList) {

  var idLst = retrievedList.idList;
  var lstLen = idLst.length;

  //Create a document fragment to append links & buttons to
  var frag = document.createDocumentFragment();

  //Add each bookmark to the document fragment
  for (i=0; i<lstLen; i++) {

    //Each bookmark title is a link
    var textNode = document.createTextNode(idLst[i].title);
    var url = idLst[i].url;
    var lnk = document.createElement('a');
    lnk.setAttribute('href', url);
    lnk.appendChild(textNode);
    frag.appendChild(lnk);

    //Give each bookmark an 'add reminder' button
    var but = document.createElement('input');
    but.type = 'button';
    but.id = idLst[i].id + 'edit';
    but.value = 'edit reminder';
    frag.appendChild(but);

    var but = document.createElement('input');
    but.type = 'button';
    but.id = idLst[i].id + 'rmv';
    but.value = 'remove bookmark';
    frag.appendChild(but);

    var brk = document.createElement('br');
    frag.appendChild(brk);
  }

  //Add the document fragment to the html body
  document.body.appendChild(frag);
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {
  //Listen for a message from background confirming that list of bookmarks has been stored
  switch (msg.type) {
    case 'listMade':
      chrome.storage.local.get(['idList'], function(result){
        //Proceed to populate page with links & buttons
        makeButtons(result)
      });
      break;
    default:
      response('unknown request from background');
      break;
  }
});
