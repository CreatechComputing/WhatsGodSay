<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

$UserID=$_SESSION['UserID'];
    if  ($_SESSION['logged_in'] == true) { 
        $result = $mysqli->query("SELECT `GroupID`, `Groups`.`GroupName` as 'groupName', `Groups`.`GroupNameShort` as 'groupNameShort', `Type`, `Moderator`, `Role`, `CreatorID`, `Description` FROM `UserGroups`, `Groups` where  `Groups`.`ID`=`UserGroups`.`GroupID` AND `UserGroups`.`UserID`= ".$UserID);
 
        if ( $result->num_rows > 0 ) {
            while($recentRead = $result->fetch_assoc()) {
                echo $recentRead["GroupID"]."|".$recentRead["groupNameShort"]."|".$recentRead["groupName"]."|".$recentRead["Type"]."|".$recentRead["Moderator"]."|".$recentRead["Role"]."|".$recentRead["CreatorID"]."|".$recentRead["Description"]."~"; 	
               }
        }  
    }
 ?> 