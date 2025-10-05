<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

$email=$_SESSION['email'];
$ddate=date("Y-m-d");
$ID=$mysqli->escape_string($_POST['ID']);

if  ($_SESSION['logged_in'] == true)  
    if ($mysqli->query("UPDATE `trackRead` SET `deletedate`='".$ddate."' WHERE `ID`='".$ID."' and `email`='".$email."';")==true)
        echo "Update Query ran";
    else
        echo "the Update Query did NOT run";    
 

?> 

