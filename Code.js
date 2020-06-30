/**
 * Returns an interactive card with widgets to Hangouts Chat.
 *
 * @param {Object} widgets that will be displayed in the card.
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
  
  // If the user needs help.
  if (str.includes("help")) {
    var message = " Here is a list of my features. Please note, all document and folder names must be enclosed in double quotes:" + "\n1. To create a new document and add it to your Drive, write *<New doc: \"DocName\" >*  " + 
      "\n2. To create a new document and add it to an existing Drive folder, write *<New doc: \"DocName\" Folder: \"FolderName\" >*" + "\n3. To create a new folder in drive, write *<New folder: \"FolderName\">*." +
      "\n4. To open an existing folder, write *<Open folder: \"FolderName\">* \n5. To see a list of parent folders of a document with a unique name, write *<Find doc: \"DocName\">*" + 
      "\n6. To give editing access to a file, write *<Give edit access to file: \"FileName\" @user1, @user2...>* \n7. To give commenting access to a file, write *<Give comment access to file: \"FileName\" @user1, @user2...>*" + 
      "\n8. To give editing access to a folder, write *<Give edit access to folder: \"FolderName\" @user1, @user2...>* \n9. To give viewing access to a folder, write *<Give view access to folder: \"FolderName\" @user1, @user2...>*" + 
      "\nWrite <help> if you need to view this message again.";
    return { "text": message };
  }
  
  // If the user wants to create a new document and add it to an existing unique folder.
  else if (strLowerCase.includes("new doc:") && strLowerCase.includes("folder:")) {
    var fileName = str.match(/"(.*?)"/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var folderName = str.match(/"(.*?)"/g)[1];
    folderName = folderName.substring(1, folderName.length-1);
    
    var folder = DriveApp.getFoldersByName(folderName).next();
    var folderId = folder.getId();
    var newDoc = DocumentApp.create(fileName).getId();
    var file = DriveApp.getFileById(newDoc);
    var fileId = file.getId();
    folder.addFile(file);
    
    var widgets = [{
    "textParagraph": {
      "text": "I have created a file named " + fileName + " and added it to your folder named "+ folderName +"."
    },
    "buttons": [
      {
        "textButton": {
          "text": "Open new file: " + fileName,
          "onClick": {
            "openLink": {
              "url": "https://docs.google.com/document/d/" + fileId + "/edit"
            }
          }
        }
      },
      {
        "textButton": {
      "text": "Open your folder: " + folderName,
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
  
  // If the user wants to create a new document but NOT add it to a folder (leave it in drive's main folder).
  else if (strLowerCase.includes("new doc:")) {
    var fileName = str.match(/"(.*?)"/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var file = DocumentApp.create(fileName);
    var fileId = file.getId();
    
    var widgets = [{
    "textParagraph": {
      "text": "I have created a file named " + fileName +"."
    },
    "buttons": [{
      "textButton": {
        "text": "Open new file: " + fileName,
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
  
  /// If the user wants to create a new folder.
  else if (strLowerCase.includes("new folder:")) {
    var folderName = str.match(/"(.*?)"/g)[0];
    folderName = folderName.substring(1, folderName.length-1);
    var folder = DriveApp.createFolder(folderName);
    var folderId = folder.getId();

    var widgets = [{
    "textParagraph": {
      "text": "I have created a folder named " + folderName + "."
    },
    "buttons": [{
      "textButton": {
        "text": "Open new folder: " + folderName,
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
  
  // If the user wants to open an existing folder.
  else if (strLowerCase.includes("open folder:")) {
    var folderName = str.match(/"(.*?)"/g)[0];
    folderName = folderName.substring(1, folderName.length-1);
    var folder = DriveApp.getFoldersByName(folderName).next();
    var folderId = folder.getId();
    
    var widgets = [{
    "textParagraph": {
      "text": "Open your folder named "+ folderName +"."
    },
    "buttons": [
      {
        "textButton": {
      "text": "Open your folder: " + folderName,
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
  
  // If the user wants to know where to find a doc with a unique name. 
  else if (strLowerCase.includes("find doc:")) {
    var fileName = str.match(/"(.*?)"/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var file = DriveApp.getFilesByName(fileName).next();
    var parentFolders = file.getParents();
    var message = "Here are name(s) of parent folder(s) of "+ fileName + ":";
    
    while (parentFolders.hasNext()) {
      var folder = parentFolders.next();
      message += "\n- " + folder.getName();
    }
    
    message += "\n If you would like to open a folder, please write <Open folder: \"FolderName\"> "
    
    return {"text" : message};
  }
  
  // If a user wants to be added as an editor to a document.
  else if (strLowerCase.includes("give edit access to file:")) {
    var fileName = str.match(/"(.*?)"/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var file = DriveApp.getFilesByName(fileName).next();
    var fileId = file.getId();
    
    var requests = event.message.annotations;
    var message = "I have added the following users as editors to " + fileName + ":";
    
    for (var i = 1; i < requests.length; i++){
      var requestingUser = requests[i].userMention.user;
      file.addEditor(requestingUser.email);          
      message += "\n- " + requestingUser.displayName;
    }
    
    var widgets = [{
    "textParagraph": {
      "text": message
    },
    "buttons": [{
      "textButton": {
        "text": "Open the file: " + fileName,
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
  
  // If a user wants to be added as a commenter to a document.
  else if (strLowerCase.includes("give comment access to file:")) {
    var fileName = str.match(/"(.*?)"/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var file = DriveApp.getFilesByName(fileName).next();
    var fileId = file.getId();
    
    var requests = event.message.annotations;
    var message = "I have added the following users as commenters to " + fileName + ":";
    
    for (var i = 1; i < requests.length; i++){
      var requestingUser = requests[i].userMention.user;
      file.addCommenter(requestingUser.email);         
      message += "\n- " + requestingUser.displayName;
    }
  
    var widgets = [{
    "textParagraph": {
      "text": message
    },
    "buttons": [{
      "textButton": {
        "text": "Open the file: " + fileName,
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
  
  // If a user wants to be added as an editor to an entire folder.
  else if (strLowerCase.includes("give edit access to folder:")) {
    var folderName = str.match(/"(.*?)"/g)[0];
    folderName = folderName.substring(1, folderName.length-1);
    var folder = DriveApp.getFoldersByName(folderName).next();
    var folderId = folder.getId();
    
    var requests = event.message.annotations;
    var message = "I have added the following users as editors to " + folderName + ":";
    
    for (var i = 1; i < requests.length; i++){
      var requestingUser = requests[i].userMention.user;
      folder.addEditor(requestingUser.email);          
      message += "\n- " + requestingUser.displayName;
    }
    
    var widgets = [{
    "textParagraph": {
      "text": message
    },
    "buttons": [{
      "textButton": {
        "text": "Open the folder: " + folderName,
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
  
  // If a user wants to be added as a viewer to an entire folder.
  else if (strLowerCase.includes("give view access to folder:")) {
    var folderName = str.match(/"(.*?)"/g)[0];
    folderName = folderName.substring(1, folderName.length-1);
    var folder = DriveApp.getFoldersByName(folderName).next();
    var folderId = folder.getId();
    
    var requests = event.message.annotations;
    var message = "I have added the following users as viewers to " + folderName + ":";
    
    for (var i = 1; i < requests.length; i++){
      var requestingUser = requests[i].userMention.user;
      folder.addViewer(requestingUser.email);          
      message += "\n- " + requestingUser.displayName;
    }
  
    var widgets = [{
    "textParagraph": {
      "text": message
    },
    "buttons": [{
      "textButton": {
        "text": "Open the folder: " + folderName,
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
  
  
  // If the user did not send an appropriate command.
  return { "text": "I am sorry, that is not one of my commands. Please type <help> to view commands I respond to." };
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

    message = message + " Here is a list of my features. Please note, all document and folder names must be enclosed in double quotes:" + "\n1. To create a new document and add it to your Drive, write *<New doc: \"DocName\" >*  " + 
      "\n2. To create a new document and add it to an existing Drive folder, write *<New doc: \"DocName\" Folder: \"FolderName\" >*" + "\n3. To create a new folder in drive, write *<New folder: \"FolderName\">*." +
      "\n4. To open an existing folder, write *<Open folder: \"FolderName\">* \n5. To see a list of parent folders of a document with a unique name, write *<Find doc: \"DocName\">*" + 
      "\n6. To give editing access to a file, write *<Give edit access to file: \"FileName\" @user1, @user2...>* \n7. To give commenting access to a file, write *<Give comment access to file: \"FileName\" @user1, @user2...>*" + 
      "\n8. To give editing access to a folder, write *<Give edit access to folder: \"FolderName\" @user1, @user2...>* \n9. To give viewing access to a folder, write *<Give view access to folder: \"FolderName\" @user1, @user2...>*" + 
      "\nWrite <help> if you need to view this message again.";

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


