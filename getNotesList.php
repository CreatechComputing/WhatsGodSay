<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

$UserID=$_SESSION['UserID'];
$GroupIDs=$_SESSION['GroupIDs'];
    if  ($_SESSION['logged_in'] == true) { 
        $result = $mysqli->query("SELECT `Notes`.`ID` as 'ID',`title`,`ToAN`,`GroupID`,`tagType`,`tagValue`,`purpose`,`Notes`.`createDate` as 'createDate',`modifyDate`,`UserID`, `username`, `note` FROM `Notes`, `users` WHERE `UserID`=`users`.`id` and (`UserID`= ".$UserID." or `GroupID` in (".$GroupIDs.")) and `deletedate`is NULL ORDER BY `modifyDate`");
        $firstRow=true;
        if ( $result->num_rows > 0 ) {
          while($recentRead = $result->fetch_assoc()) {	
              if ($firstRow==true)
                  $firstRow=false;
              else
                  echo "~";

              echo $recentRead["ID"]."|".$recentRead["title"]."|".$recentRead["ToAN"]."|".$recentRead["GroupID"]."|".$recentRead["tagType"]."|".$recentRead["tagValue"]."|".$recentRead["purpose"]."|".$recentRead["createDate"]."|".$recentRead["modifyDate"]."|".$recentRead["UserID"]."|".$recentRead["username"]."|".$recentRead["note"];
            }
       }
       else {
        echo "No Notes";
    }    

    }   
?> 