//Nick Simons, 8/28/18

document.addEventListener('DOMContentLoaded', function() {
  //Sets userId to current user
  var userInfo = chrome.identity.getProfileUserInfo(function(result) {
    var userId = result.id;
    chrome.storage.local.get(['userId'], function(prevStoredObj) {
      console.log('previously stored userId is ' + prevStoredObj.userId);
    });
    console.log('current user id is ' + userId);
    chrome.storage.local.set({['userId']: userId}, function() {
      //get the data just stored to ensure that it was stored correctly
      chrome.storage.local.get(['userId'], function(storedObj) {
        console.log('newly stored userId is ' + storedObj.userId);
      });
    });
  });

  var openPage = document.getElementById("open-page")
  openPage.onclick = function() {
    console.log("View Bookmarks button clicked");
  }
  var sync = document.getElementById("sync");
  sync.onclick = function() {
    console.log("Sync button clicked");
    getBookmarkInfo();
    /*//CODE BELOW demonstrates how to extract firebase data from local storage
      chrome.storage.local.get(["state"], function(result) {
      console.log('state result is: ' + JSON.stringify(result));
      var cats = JSON.parse(result.state).values[0].id;
      console.log('Users is ' + cats);
    });*/
  };
});

function getBookmarkInfo () {
  //iterates through the bookmark tree (contains both folder and bookmark nodes)
  chrome.bookmarks.getTree(function(bmTree){
    bmTree.forEach(function(node){
      getNodeInfo(node);
    });
  });
}

function getNodeInfo(node) {
  if (node.children) { //checks if node is a folder. if so, recursively calls this method
    node.children.forEach(function(child) { getNodeInfo(child); });
  }
  if (node.url) { //ensures that node has a url (folder nodes do not)
    var nodeUrl = node.url;
    var nodeTitle = node.title;
    var nodeId = node.id;
    var nodeDateAdded = node.dateAdded;
    var nodeReminders = [];

    chrome.runtime.sendMessage({type: "updateValue", opts: {id: nodeId, url: nodeUrl, title: nodeTitle, dateAdded: nodeDateAdded, reminders: nodeReminders}});
  }
}
