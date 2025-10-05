<?php
if(!isset($_SESSION)) 
{ 
  session_start(); 
}
require 'db.php';

if ($_SESSION['logged_in'] == true) {
  $UserID=$_SESSION['UserID']; 
  $FileOrder=$mysqli->escape_string($_POST['FileOrder']);
  $FileID=$mysqli->escape_string($_POST['FileID']);
  $Reference=$mysqli->escape_string($_POST['Reference']);
  $Timing=$mysqli->escape_string($_POST['Timing']);
  $WordRef=$mysqli->escape_string($_POST['WordRef']);
 
  $result = $mysqli->query("INSERT INTO `AudioFileTracking` (`FileOrder`, `FileID`, `Reference`, `Timing`, `TimingBy`, `WordRef`) VALUES (".$FileOrder.",".$FileID.",'".$Reference."',".$Timing.",".$UserID.",'".$WordRef."');");
  
  echo "INSERT INTO `AudioFileTracking` (`FileOrder`, `FileID`, `Reference`, `Timing`, `TimingBy`, `WordRef`) VALUES (".$FileOrder.",".$FileID.",'".$Reference."',".$Timing.",".$UserID.",'".$WordRef."');";
}  
else { 
  echo "Cannot add or edit without being logged in.";
}

//$result2 = $mysqli->query("INSERT INTO `AudioFileTracking` (`FileOrder`, `FileID`, `Reference`, `Timing`, `TimingBy`, `WordRef`) VALUES (99,1,'".$Reference."010101',60,1,'01');");
//echo $result;
?> 