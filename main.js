// clipper is a function to determine which clipboard item to pick from clipboard
// if we can get a file(s) out of the clipboard, then it will be an upload
// if we get plain text, we will see if it is a URL and we will make it a link item
// if we get plain text but not a URL, then we will make it a note item
var clipper = function() {

  // data this object needs to retain as it evaluates the clipboard
  var data = { items : [], clipboardData : null };

  var getItems = function(clipboardData) {
    // reset the items
    data.items = [];
    // set to the new clipboard data
    data.clipboardData = clipboardData;
    // first try to get items from files,then from binary data
    // finally get them from text
    getItemsFromFiles() || getItemsFromBinaryFile() || getItemsFromText();
    // return the list of items
    return data.items;
  };

  // if we have files in the clipboard iterate over them
  // and add them to the items array
  var getItemsFromFiles = function() {
    var files = data.clipboardData.files;
    if(files.length > 0) {
      for(var i=0; i < files.length; i++) {
        data.items.push( {type: 'upload', file: files[i], content_type: files[i].type, size: files[i].size });
      }
      return true;
    }
    // no files data in the clipboard
    else {
      return false;
    }
  };

  var getItemsFromBinaryFile = function() {
    var clipboardItems = data.clipboardData.items;
    var blob = null;
    // see if we get a file from any of the items in the clipboard
    for(var i=0; i < clipboardItems.length; i++) {
      // try to get the blob from the item
      // only applicable for images
      blob = clipboardItems[i].getAsFile();
      if((blob != null) && (allowedContentType(clipboardItems[i].type))) {
        // we got a blob add it for the upload
        data.items.push( { type: 'upload', file: blob, content_type : blob.type, size: blob.size } );
        // get out of the iteration, we got our file
        break;
      }
    }
    // return true if we have a blob
    return blob != null;
  };

  var allowedContentType = function(type) {
    return type.indexOf("image") == 0;
  };

  var getItemsFromText = function() {
    // it is not a file, so let's examine the text
    // for now we only support URLs
    var text = data.clipboardData.getData('text');
    // is it a URL
    if(isURL(text)) {
      data.items.push({ type: 'link', url: text });
    }
  };

  var isURL = function(string) {
    return ((string.indexOf('http') == 0) && (string.indexOf(' ') == -1));
  };

  return { getItems : getItems };
}();

// listen for the paste event
window.addEventListener("paste", function(pasteEvent){
  // send the clipboardData
  var items = clipper.getItems(pasteEvent.clipboardData);
  // show what we got
  console.log(items);
  $("#log").html(JSON.stringify(items));
}, false);

