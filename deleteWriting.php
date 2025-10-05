<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

$UserID=$_SESSION['UserID'];
$ddate=date("Y-m-d");
$ID=$mysqli->escape_string($_POST['noteID']);

if  ($_SESSION['logged_in'] == true)  
    $sqlText="UPDATE `Notes` SET `deletedate`='".$ddate."' WHERE `ID`='".$ID."' and `UserID`='".$UserID."';";
    if ($mysqli->query($sqlText)==true)
        echo "Writing deleted.";
    else
        echo "ID=".$ID."  User ID=".$UserID."   Error: Writing NOT deleted.<br>".$sqlText;    
?> 

