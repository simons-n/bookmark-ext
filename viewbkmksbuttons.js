document.addEventListener('DOMContentLoaded', function() {
  //create a list of all bookmark IDs so that buttons may be made
  chrome.runtime.sendMessage({type: "makeList", opts: {buttonsMade: "no"}});
});

function makeButtons(retrievedList) {

  var idLst = retrievedList.idList;
  var lstLen = idLst.length;

  //Create a document fragment to append links & buttons to
  var frag = document.createDocumentFragment();

  //Add each bookmark to the document fragment
  for (i=0; i<lstLen; i++) {

    //Each bookmark title is a link
    var newDiv = document.createElement('div');
    newDiv.id = 'div_' + idLst[i].id;
    newDiv.className = 'pull-left';
    var textNode = document.createTextNode(idLst[i].title);
    var url = idLst[i].url;
    var lnk = document.createElement('a');
    lnk.setAttribute('href', url);
    lnk.id = 'lnk_' + idLst[i].id
    lnk.appendChild(textNode);
    frag.appendChild(lnk);
    frag.appendChild(newDiv);

    //Give each bookmark an 'add reminder' button
    //var newDiv = document.createElement('div');
    //newDiv.id = 'div_' + idLst[i].id;
    //newDiv.className = 'wrapper';
    var but = document.createElement('button');
    but.type = 'button';
    but.id = 'edit_' + idLst[i].id;
    but.addEventListener('click', edit);
    //but.value = 'edit reminder';
    var textNode = document.createTextNode('edit reminder');
    but.appendChild(textNode);
    //frag.appendChild(newDiv);
    frag.appendChild(but);

    var but = document.createElement('button');
    but.type = 'button';
    but.id = 'rmv_' + idLst[i].id;
    but.addEventListener('click', remove);
    //but.value = 'remove bookmark';
    var textNode = document.createTextNode('remove bookmark');
    but.appendChild(textNode);
    frag.appendChild(but);

    var brk = document.createElement('br');
    frag.appendChild(brk);
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

function remove(ev) {
  var id = ev.currentTarget.id;
  var strippedId = id.split('_').pop();
  var rmvbtn = document.getElementById(id);
  var editbtn = document.getElementById('edit_'+strippedId);
  var curDiv = document.getElementById('div_'+strippedId);
  var curLnk = document.getElementById('lnk_'+strippedId);
  rm = window.confirm("Are you sure you want to remove" )
  if (rm) {
    chrome.runtime.sendMessage({type: "remove", opts: {id: strippedId}});
    //remake the idList sans the removed bookmark. buttons were already made
    chrome.runtime.sendMessage({type: "makeList", opts: {buttonsMade: "yes"}});
    if (rmvbtn.style.display != "none") {
      rmvbtn.style.display = "none";
    } if (curLnk.style.display != "none") {
      curLnk.style.display = "none";
    } if (editbtn.style.display != "none") {
      editbtn.style.display = "none";
    }
  }
}

function edit(ev) {
  var id = ev.currentTarget.id;
  var strippedId = id.split('_').pop();
}
