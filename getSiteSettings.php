<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

$UserID=$_SESSION['UserID'];
    if  ($_SESSION['logged_in'] == true) { 
        $result = $mysqli->query("SELECT * from SiteSettings where `UserID`= ".$UserID." LIMIT 1");
        if ( $result->num_rows > 0 ) {
            $ss = $result->fetch_assoc();
            echo $ss["showTitleBar"]."|".$ss["showFooter"]."|".$ss["themeName"]."|".$ss["themeDarkColor"]."|".$ss["themeSWColor"]."|".$ss["greekDisplay"]."|".$ss["fontSize"]."|".$ss["fontFamily"]."|".$ss["wordDataOptions"]."|".$ss["audioTypeAllowed"]."|".$ss["ReadingDefault"]."|".$ss["StudyDefault"]."|".$ss["sectionTitleDefault"]."|".$ss["sectionTitleOriginal"];
        }
    }   
 ?> 