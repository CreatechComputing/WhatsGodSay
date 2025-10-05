<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

$dbSyncDateTxt=$mysqli->escape_string($_POST['dbSyncDateTxt']);
$UserID=$_SESSION['UserID'];

if  ($_SESSION['logged_in'] == true) { 
        $result = $mysqli->query("SELECT `RHRow` from `ReferenceHistory` where `UserID`= 3 AND (`createDate` >'".$dbSyncDateTxt."' OR `LastModifiedDate`>'".$dbSyncDateTxt."')"
    );
        
       if ( $result->num_rows == 0 ) {
           echo "no rows";
       }    
       else    
         while($RH = $result->fetch_assoc()) {
            echo $RH["RHRow"]."|"; 
        }
    }   
 ?> 