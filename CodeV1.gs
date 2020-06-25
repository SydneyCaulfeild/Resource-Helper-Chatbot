// This file contains the first version of the code for the Code.gs file of my chatbot. This chatbot currently only works in DMs. 



/**
 * Creates an interactive card to return to the user.
 *
 * @param {Object} widgets to be included in the card
 */
function createCardResponse(widgets) {
  return {
    cards: [{
      sections: [{
        widgets: widgets
      }]
    }]
  };
}

/**
 * Responds to a MESSAGE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onMessage(event) {
  str = event.message.text;
  strLowerCase = str.toLowerCase();
  
  // If the user needs help
  if (str.includes("help")) {
    var message = " Here is a list of my features. Please note, all document and folder names must be enclosed in single quotes:" + "\n1. To create a new document and add it to your Drive, write <New doc: 'DocName' >  " + 
      "\n2. To create a new document and add it to an existing Drive folder, write <New doc: 'DocName' Folder: 'FolderName' >" + "\n3. To create a new folder in drive, write <New folder: 'FolderName'>. \nWrite <help> if you need to view this message again.";
    return { "text": message };
  }
  
  // If the user wants to create a new document and add it to an existing unique folder
  else if (strLowerCase.includes("new doc:") && strLowerCase.includes("folder:")) {
    var fileName = str.match(/\'(.*?)\'/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var folderName = str.match(/\'(.*?)\'/g)[1];
    folderName = folderName.substring(1, folderName.length-1);
    
    var folder = DriveApp.getFoldersByName(folderName).next();
    var folderId = folder.getId();
    var newDoc = DocumentApp.create(fileName).getId();
    var file = DriveApp.getFileById(newDoc);
    var fileId = file.getId();
    folder.addFile(file);
    
    var widgets = [{
    "textParagraph": {
      "text": "I have created a file named \"" + fileName + "\" and added it to your folder named \""+ folderName +"\"."
    },
    "buttons": [
      {
        "textButton": {
          "text": "Open new file",
          "onClick": {
            "openLink": {
              "url": "https://docs.google.com/document/d/" + fileId + "/edit"
            }
          }
        }
      },
      {
        "textButton": {
          "text": "Open your folder",
          "onClick": {
            "openLink": {
              "url": "https://drive.google.com/corp/drive/folders/" + folderId
            }
          }
        }
      }
    ]
  }];

  return createCardResponse(widgets);
  }
  
  // If the user wants to create a new document but NOT add it to a folder (leave it in drive's main folder)
  else if (strLowerCase.includes("new doc:")) {
    var fileName = str.match(/\'(.*?)\'/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var file = DocumentApp.create(fileName);
    var fileId = file.getId();
    
    var widgets = [{
    "textParagraph": {
      "text": "I have created a file named \"" + fileName +"\"."
    },
    "buttons": [{
      "textButton": {
        "text": "Open new file",
        "onClick": {
          "openLink": {
            "url": "https://docs.google.com/document/d/" + fileId + "/edit"
          }
        }
      }
    }]
  }];

  return createCardResponse(widgets);    
  }
  
  // If the user wants to create a new folder
  else if (strLowerCase.includes("new folder:")) {
    var folderName = str.match(/\'(.*?)\'/g)[0];
    folderName = folderName.substring(1, folderName.length-1);
    var folder = DriveApp.createFolder(folderName);
    var folderId = folder.getId();

    var widgets = [{
    "textParagraph": {
      "text": "I have created a folder named \"" + folderName + "\"."
    },
    "buttons": [{
      "textButton": {
        "text": "Open new folder",
        "onClick": {
          "openLink": {
            "url": "https://drive.google.com/corp/drive/folders/" + folderId
          }
        }
      }
    }]
  }];

  return createCardResponse(widgets);
  }  
}

/**
 * Responds to an ADDED_TO_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onAddToSpace(event) {
  var message = "";

  if (event.space.type == "DM") {
    message = "Thank you for adding me to a DM, " + event.user.displayName + "!";
  } else {
    message = "Thank you for adding me to " + event.space.displayName + "!";
  }

    message = message + " Here is a list of my features. Please note, all document and folder names must be enclosed in single quotes:" + "\n1. To create a new document and add it to your Drive, write <New doc: 'DocName' >  " + 
      "\n2. To create a new document and add it to an existing Drive folder, write <New doc: 'DocName' Folder: 'FolderName' >" + "\n3. To create a new folder in drive, write <New folder: 'FolderName'>. \nWrite <help> if you need to view this message again.";

  return { "text": message };
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onRemoveFromSpace(event) {
  console.info("Bot removed from ", event.space.name);
}


