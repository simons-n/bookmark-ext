(function () {
  var myConfig = config;
  const app = firebase.initializeApp(myConfig);
  var uId = new Promise(function (resolve, reject) {
    chrome.identity.getProfileUserInfo(function(result) {
      var user = result.id;
      console.log('current user id is ' + user);
      chrome.storage.local.set({['userId']: user}, function() {
        //get and print the data just stored to ensure that it was stored correctly
        chrome.storage.local.get(['userId'], function(storedObj) {
          console.log('newly stored userId is ' + storedObj.userId);
        });
      });
      console.log('user in getUser is ' + user);
      resolve(user);
    });
  });
  var userId = '000001101';
  var appDb = null;
  uId.then(function(user){
    console.log('userId in then is ' + user);
    userId = user;
    appDb = app.database().ref("Users/"+userId);

    appDb.on('child_added', snapshot => {
      applicationState.values.push({
        id: snapshot.key,
        value: snapshot.val()
      });
      console.log('child added');
      updateState(applicationState);
    });

    appDb.on('child_removed', snapshot => {
      const childPosition = getChildIndex(applicationState, snapshot.key)
      if (childPosition === -1) return
      applicationState.values.splice(childPosition, 1);
      console.log('child removed');
      updateState(applicationState);
    });

    appDb.on('child_changed', snapshot => {
      const childPosition = getChildIndex(applicationState, snapshot.key)
      if (childPosition === -1) return
      applicationState.values[childPosition] = snapshot.val();
      console.log('child changed');
      updateState(applicationState);
    });
  });
  chrome.storage.local.set({ state: 0 }, function() {
    console.log('clearing previous state in case user was switched');
  });

  function setRef() {
    console.log('userId in setRef: ' + userId);
    return app.database().ref("Users/"+userId);
  }

  function setSnapRef() {
    return firebase.database().ref().child("Users/" + userId +"/Bookmarks");
  }

  // instantiate global application state object for Chrome Storage and feed in firebase data
  // Chrome Storage will store our global state as a a JSON stringified value.

  const applicationState = { values: [] };
  /*
  appDb.on('child_added', snapshot => {
    applicationState.values.push({
      id: snapshot.key,
      value: snapshot.val()
    });
    updateState(applicationState);
  });

  appDb.on('child_removed', snapshot => {
    const childPosition = getChildIndex(applicationState, snapshot.key)
    if (childPosition === -1) return
    applicationState.values.splice(childPosition, 1);
    updateState(applicationState);
  });

  appDb.on('child_changed', snapshot => {
    const childPosition = getChildIndex(applicationState, snapshot.key)
    if (childPosition === -1) return
    applicationState.values[childPosition] = snapshot.val();
    updateState(applicationState);
  });*/

  // updateState is a function that writes the changes to Chrome Storage
  function updateState(applicationState) {
    chrome.storage.local.set({ state: JSON.stringify(applicationState) }, function() {
      console.log('updating state');
    });
  }

  // getChildIndex will return the matching element in the object
  function getChildIndex(appState, id) {
    return appState.values.findIndex(element => element.id == id)
  }

  // if your Chrome Extension requires any content scripts that will manipulate data,
  // add a message listener here to access appDb:

  chrome.runtime.onMessage.addListener((msg, sender, response) => {
    switch (msg.type) {
      case 'updateValue':
        chrome.storage.local.get(['userId'], function(result) {
          appDb.once("value", function(snapshot) {
            //if bookmark is new, add it to db
            if (!(snapshot.child("Users").child(result.userId).child("Bookmarks").hasChild(msg.opts.id))) {
              appDb.child("Bookmarks").child(msg.opts.id).set({ url: msg.opts.url, title: msg.opts.title, id: msg.opts.id, dateAdded: msg.opts.dateAdded, reminders: msg.opts.reminders });
            }//else, skip it
            else {
              console.log("Bookmark Id: " + msg.opts.id + ' already exists');
            }
          });
        });
        response('success');
        break;
      case 'makeList':
        var idList = [];
        appDb.once('value', function(snapshot) {
          //console.log('snapshot is ' + snapshot.child);
          chrome.identity.getProfileUserInfo(function(result) {
            //console.log('result is ' + result.id);
            snapshot.child("Bookmarks").forEach(function(child) {
              //console.log('in foreach');
              var value = child.val();
              //console.log('value: ' + JSON.stringify(value));
              idList.push(value);
            });
            chrome.storage.local.set({['idList']: idList}, function() {
              chrome.storage.local.get(['idList'], function(justStored) {
                //console.log('idList is ' + JSON.stringify(justStored.idList));
                if (msg.opts.buttonsMade == "no") {
                  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {type: "listMade"}, function(response) {
                      console.log("message sent from background (makeList)");
                    });
                  });
                }
              });
            });
          });
        });
        break;
      case 'remove':
        var id = msg.opts.id;
        appDb.child("Bookmarks").child(id).remove();
        //updateState();
        //var removingBookmark = chrome.bookmarks.remove(id);
        //removingBookmark.then(onRemoved, onRejected);
        chrome.bookmarks.remove(id);
        break;
      default:
        response('unknown request');
        break;
    }
  });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    console.log("Got an alarm!", alarm);
  });
})();
