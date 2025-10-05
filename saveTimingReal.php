<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';


 
if  ($_SESSION['logged_in'] == true) {
  $UserID=$_SESSION['UserID']; 
  $FileOrder=$mysqli->escape_string($_POST['FileOrder']);
  $FileID==$mysqli->escape_string($_POST['FileID']);
  $Reference=$mysqli->escape_string($_POST['Reference']);
  $Timing=$mysqli->escape_string($_POST['Timing']);
  $WordRef=$mysqli->escape_string($_POST['WordRef']);
 
  $result = $mysqli->query("INSERT INTO `AudioFileTracking` (`FileOrder`, `FileID`, `Reference`, `Timing`, `TimingBy`, `WordRef`) VALUES (".$FileOrder.",".$FileID.",'".$Reference."',".$Timing.",".$UserID.",'".$WordRef."');");
   echo $result;
  //echo "INSERT INTO `AudioFileTracking` (`FileOrder`, `FileID`, `Reference`, `Timing`, `TimingBy`, `WordRef`) VALUES (".$FileOrder.",".$FileID.",'".$Reference."',".$Timing.",".$UserID.",'".$WordRef."')"
  // echo "Saved new ".str_replace("AN","",$purpose).".";
  //}
  //else { //update current note
 //   $result = $mysqli->query("UPDATE `Notes` SET `title`='".$titleAN."',`ToAN`='".$ToAN."',`GroupID`='".$toGroup."',`tagType`='".$tagType."',`tagValue`='".$tag."',`purpose`='".$purpose."',`modifyDate`=STR_TO_DATE('".$LocalTimeString."','%m-%d-%Y %H:%i'),`note`='".$note."' WHERE `ID`=".$noteID." and `UserID`=".$UserID);
  //  echo " Updated ".str_replace("AN","",$purpose)."."; 
    //"NoteID:".$noteID." UserID:".$UserID." isNewNote:".$isNewNote;
  //}  
} else { echo "Cannot add or edit without being logged in.";
}
?> 