var myConfig = config;
const app = firebase.initializeApp(myConfig);
const appDb = app.database().ref();


// instantiate global application state object for Chrome Storage and feed in firebase data
// Chrome Storage will store our global state as a a JSON stringified value.

const applicationState = { values: [] };

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
});

// updateState is a function that writes the changes to Chrome Storage
function updateState(applicationState) {
  chrome.storage.local.set({ state: JSON.stringify(applicationState) });
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
            appDb.child("Users").child(result.userId).child("Bookmarks").child(msg.opts.id).set({ url: msg.opts.url, title: msg.opts.title, id: msg.opts.id, dateAdded: msg.opts.dateAdded, reminders: msg.opts.reminders });
          }//else, skip it
          else {
            console.log("Bookmark Id: " + msg.opts.id + ' already exists');
          }
        });
      });
      response('success');
      break;
    default:
      response('unknown request');
      break;
  }
});
