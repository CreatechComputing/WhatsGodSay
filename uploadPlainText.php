<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'CBdb.php';
 
  $userName=escape_string($_POST['userName']; 
  $difficultyLevel=$mysqli->escape_string($_POST['difficultyLevel']);
  $hintLetter=$mysqli->escape_string($_POST['hintLetter']);
  $saying=$mysqli->escape_string($_POST['saying']);
  


  $myQueryText="INSERT INTO `Saying` (`userName`, `difficultyLevel`,`hintLetter`,`saying`)
  VALUES ('".$userName."'',".$difficultyLevel.",".$hintLetter."','".$saying."',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
  $result = $mysqli->query($myQueryText);
  echo "SQL:".$myQueryText;
  
}
 else { echo "Cannot save Site Settings across device/browser without being logged in.";
}
?> 