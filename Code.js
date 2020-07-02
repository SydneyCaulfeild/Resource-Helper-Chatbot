// Id for a team's template doc. The owner of this doc must first share it with a user before that user can make a copy
var templateDocId = "1AodNqugPXANOPvgI4VCPIpFRfxUT6Qe7mxmX33ip45A";

// Emails of team members who will be given access to files or folders when you say share with team
var teamEmails = ["scaulfeild@google.com", "tonyshen@google.com", "miasya@google.com"];


/**
 * Responds to a MESSAGE event in Hangouts Chat
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
  
  // If the user wants to create a new document and add it to an existing unique folder
  else if (strLowerCase.includes("new doc:") && strLowerCase.includes("folder:")) {
    // Get the name of the file and folder
    var fileName = str.match(/"(.*?)"/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var folderName = str.match(/"(.*?)"/g)[1];
    folderName = folderName.substring(1, folderName.length-1);
    // Find the folder
    var folder = DriveApp.getFoldersByName(folderName).next();
    var folderId = folder.getId();
    // Create a new doc
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
  
  // If the user wants to create a new doc (not in any folder) or a new folder
  else if (strLowerCase.includes("new folder:") || strLowerCase.includes("new doc:")) {
    // Get the name of the new folder or doc
    var Name = str.match(/"(.*?)"/g)[0];
    Name = Name.substring(1, Name.length-1);
    
    // If the user wants a new folder, create a new folder
    if (strLowerCase.includes("folder")) {
      var folder = DriveApp.createFolder(Name);
      var Id = folder.getId();
      var type = "folder";
      var url = "https://drive.google.com/corp/drive/folders/" + Id;
    }
    // Else if the user wants a new doc, create a new file
    else {
      var file = DocumentApp.create(Name);
      var fileId = file.getId();
      var type = "file";
      var url = "https://docs.google.com/document/d/" + fileId + "/edit";
    }

    var widgets = [{
    "textParagraph": {
      "text": "I have created a " + type + " named " + Name + "."
    },
    "buttons": [{
      "textButton": {
        "text": "Open new " + type + ": " + Name,
        "onClick": {
          "openLink": {
            "url": url
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
    // Get file name
    var fileName = str.match(/"(.*?)"/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    // Find the file and the parent folders
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
  
  // If the user wants to give editing or commenting access to a document
  else if (strLowerCase.includes("give comment access to file:") || strLowerCase.includes("give edit access to file:")) {
    // Find the file
    var fileName = str.match(/"(.*?)"/g)[0];
    fileName = fileName.substring(1, fileName.length-1);
    var file = DriveApp.getFilesByName(fileName).next();
    var fileId = file.getId();
    // Get the list of people mentioned in the message
    var requests = event.message.annotations;
    
    // if the user wants to give editing access
    if (strLowerCase.includes("edit")) {
      var type = "editors";
    }  
    // Else if the user wants to give commenting access
    else {
      var type = "commenters";
    }  
    
    var message = "I have added the following users as " + type + " to " + fileName + ":";
    // Start index at 1 to skip the annotation for the bot
    for (var i = 1; i < requests.length; i++){
      // If they want to give edit access
      if (type == "editors") {
        file.addEditor(requests[i].userMention.user.email); 
      }
      // Else if they want to give comment access
      else {
        file.addCommenter(requests[i].userMention.user.email);
      }          
      message += "\n- " + requests[i].userMention.user.displayName;
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
  
  // If a user wants to be added as an editor or a viewer to an entire folder.
  else if (strLowerCase.includes("give edit access to folder:") || strLowerCase.includes("give view access to folder:")) {
    // Get the folder name and find the folder
    var folderName = str.match(/"(.*?)"/g)[0];
    folderName = folderName.substring(1, folderName.length-1);
    var folder = DriveApp.getFoldersByName(folderName).next();
    var folderId = folder.getId();
    
    // If the user wants to give editing access
    if (strLowerCase.includes("edit")) {
      var type = "editors";
    }  
    // Else if the user wants to give viewing access
    else {
      var type = "viewers";
    }
    
    var requests = event.message.annotations;
    var message = "I have added the following users as " + type + " to " + folderName + ":";
    // Start index at 1 to skip the annotation for the bot
    for (var i = 1; i < requests.length; i++){
      if (type == "editors") {
        folder.addEditor(requests[i].userMention.user.email);   
      }
      else {
        folder.addViewer(requests[i].userMention.user.email);
      }        
      message += "\n- " + requests[i].userMention.user.displayName;
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
  
    // If a user wants a new doc with their team's template
  else if (strLowerCase.includes("new doc with template")) { 
    var widgets = [{
    "textParagraph": {
      "text": "I have made you a new file with your team's template."
    },
    "buttons": [{
      "textButton": {
        "text": "Open new file",
        "onClick": {
          "openLink": {
            "url": "https://docs.google.com/document/d/" + templateDocId + "/copy"
          }
        }
      }
    }]
    }];

    return createCardResponse(widgets);
  }  
  
  // Give your team edit access to a doc or folder
  else if (strLowerCase.includes("give team edit access to doc:") || strLowerCase.includes("give team edit access to folder:")) {
    var Name = str.match(/"(.*?)"/g)[0];
    Name = Name.substring(1, Name.length-1);
    
    if (strLowerCase.includes("doc")) {
      var file = DriveApp.getFilesByName(Name).next();
      var Id = file.getId();
      file.addEditors(teamEmails);
      var type = "file";
      var url = "https://docs.google.com/document/d/" + Id + "/edit";
    }
    else {
      var folder = DriveApp.getFoldersByName(Name).next();
      var Id = folder.getId();
      folder.addEditors(teamEmails);
      var type = "folder";
      var url = "https://drive.google.com/corp/drive/folders/" + Id; 
    }
        
    var message = "I have added the following users as editors to " + Name + ":";
    for (var i = 0; i < teamEmails.length; i++){          
      message += "\n- " + teamEmails[i];
    }
    
    var widgets = [{
    "textParagraph": {
      "text": message
    },
    "buttons": [{
      "textButton": {
        "text": "Open the " + type + ": " + Name,
        "onClick": {
          "openLink": {
            "url": url
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