<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';
 
if  ($_SESSION['logged_in'] == true) {

  $UserID=$_SESSION['UserID']; 
  $RHArrStrNew=$mysqli->escape_string($_POST['RHArrStrNew']);
  // not doing modify yet
 $RHArrStrModify=$mysqli->escape_string($_POST['RHArrStrModify']);

//replace USERIDQQ placeholder with actual UserID
 $RHArrStrNew=str_replace("USERIDQQ",$UserID, $RHArrStrNew);

 //remove all the slashes in front of the quotes
 $RHArrStrNew=str_replace("\\","", $RHArrStrNew);

 $QryTxt="INSERT INTO `ReferenceHistory`(`UserID`, `RHId`, `UniqueHandle`, `createDate`, `LastModifiedDate`, `LastUsedDate`, `RHRow`, `deletedate`) 
 VALUES ".$RHArrStrNew;
 $result = $mysqli->query($QryTxt);

  echo "SQL:".$QryTxt;  
}
 else { echo "Cannot save Reference History across device/browser without being logged in.";
}
?> 