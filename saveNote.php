<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';


 
if  ($_SESSION['logged_in'] == true) {
  $UserID=$_SESSION['UserID']; 
  $isNewNote=$mysqli->escape_string($_POST['isNewNote']);
   $noteID=$mysqli->escape_string($_POST['noteID']);
    $LocalTimeString=$mysqli->escape_string($_POST['LocalTimeString']);
    $note=$mysqli->escape_string($_POST['note']);
    $ToAN=$mysqli->escape_string($_POST['ToAN']);
    $toGroup=$mysqli->escape_string($_POST['toGroup']);
    $tagType=$mysqli->escape_string($_POST['tagType']);
    $tag=$mysqli->escape_string($_POST['tag']);
    $purpose=$mysqli->escape_string($_POST['purpose']);
    $titleAN=$mysqli->escape_string($_POST['titleAN']);
  
  if ($isNewNote=="true") {  //new note so insert
    $result = $mysqli->query("INSERT INTO `Notes`(`ID`, `UserID`, `title`,`ToAN`, `GroupID`,`tagType`, `tagValue`, `purpose`,`createDate`, `modifyDate`, `note`) VALUES (".$noteID.",".$UserID.",'".$titleAN."','".$ToAN."','".$toGroup."','".$tagType."','".$tag."','".$purpose."',STR_TO_DATE('".$LocalTimeString."','%m-%d-%Y %H:%i'),STR_TO_DATE('".$LocalTimeString."','%m-%d-%Y %H:%i'),'".$note."')");
    echo "Saved new ".str_replace("AN","",$purpose).".";
  }
  else { //update current note
    $result = $mysqli->query("UPDATE `Notes` SET `title`='".$titleAN."',`ToAN`='".$ToAN."',`GroupID`='".$toGroup."',`tagType`='".$tagType."',`tagValue`='".$tag."',`purpose`='".$purpose."',`modifyDate`=STR_TO_DATE('".$LocalTimeString."','%m-%d-%Y %H:%i'),`note`='".$note."' WHERE `ID`=".$noteID." and `UserID`=".$UserID);
    echo " Updated ".str_replace("AN","",$purpose)."."; 
    //"NoteID:".$noteID." UserID:".$UserID." isNewNote:".$isNewNote;
  }  
} else { echo "Cannot add or edit writings without being logged in.";
}
?> 