<?php
if(!isset($_SESSION)) 
{ 
  session_start(); 
}
require 'db.php';

if ($_SESSION['logged_in'] == true) {
  $UserID=$_SESSION['UserID']; 
  $FileID=$mysqli->escape_string($_POST['FileID']);
  $Timing=$mysqli->escape_string($_POST['Timing']);
 $ChapRef=$mysqli->escape_string($_POST['ChapRef']);
 $VerRef=$mysqli->escape_string($_POST['VerRef']);
  $WordRef=$mysqli->escape_string($_POST['WordRef']);
 
  $result = $mysqli->query("INSERT INTO `AudioFileTiming`(`FileID`, `Timing`, `TimingBy`, `ChapterRef`, `VerseRef`, `WordRef`) VALUES (".$FileID.",".$Timing.",".$UserID.",'".$ChapRef."','".$VerRef."','".$WordRef."')");
}  
else { 
  echo "Cannot add or edit without being logged in.";
}

//$result2 = $mysqli->query("INSERT INTO `AudioFileTracking` (`FileOrder`, `FileID`, `Reference`, `Timing`, `TimingBy`, `WordRef`) VALUES (99,1,'".$Reference."010101',60,1,'01');");
echo $result;
?> 