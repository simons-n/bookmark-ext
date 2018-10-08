# Book Mk. 2
![](img/bkmk128.png)
Book Mk. 2 is a simple extention meant to provide an alternative way to view and interact with your Chrome bookmarks (while also providing me with some web development practice!)  Look out for upcoming features, including bookmark reminders.

### Tech

Book Mk. 2 utilizes some helpful technologies:

* [Google Firebase](https://firebase.google.com/) - Really nifty cloud-based backend
* [Chrome Extension APIs](https://developer.chrome.com/extensions/api_index) - chrome.bookmarks, chrome.storage, and others help with accessing, manipulating, and storing a user's bookmarks
* [jQuery] - will be useful for event handling, setting reminders

### Installation
Book Mk. 2 isn't available on the Chrome Web Store yet, but you can still install and run it!

1. Clone this repository.
```
$ git clone https://github.com/simons-n/bookmark-ext.git
```
2. Visit chrome://extensions
3. Ensure that Developer Mode is enabled using the button at the top right of the page.
![](figures/devmode.xcf)
4. Click the *Load unpacked* button at the top left of the page.
![](figures/loadunpacked.xcf)
5. Select the directory to which you cloned this repository, and click *Open*.  
6. Use Book Mk. 2!

### Usage
![](figures/icon.xcf)
Click on the Book Mk. 2 extension icon, circled in red above.
![](figures/popup.xcf)
***The first time you use the extension*** and ***whenever you create a new bookmark***, you should click **Sync with Bookmarks** to synchronize your existing Chrome bookmarks with Book Mk. 2.

Click **View Bookmarks** to open a new tab that lists all of your bookmarks.

![](figures/bkmklist.xcf)
On this page, you will see a list of your bookmarks.

To ***delete a bookmark***, click the **Remove Bookmark** button below that bookmark's title.

***NOTE:*** the **Edit Reminder** button currently has no functionality.

### Todos

 - Add Reminders feature (allow users to set date & time to be notified to revisit a bookmark)
 - Improve UI
 - Refactor
 - Clean up legacy code
