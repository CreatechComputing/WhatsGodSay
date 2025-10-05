<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

$email=$_SESSION['email']; 
    if  ($_SESSION['logged_in'] == true) { 
        $result = $mysqli->query("Select ID, DATE_FORMAT(`LocalDate`,'%a %b %e %I:%i%p') as 'ReadDate', DATE_FORMAT(`LocalDate`,'%Y-%m-%d') as 'ReadDate2', `ReferenceText`,`Reference`,`ReferenceTo`,`Version`,`deletedate`,`Method`,`comment` FROM `trackRead` WHERE `email`='".$email."' and `deletedate` is null ORDER By `ID` DESC LIMIT 1");
        //$result = $mysqli->query("Select ID, DATE_FORMAT(`LocalDate`,'%a %b %e %I:%i%p') as 'ReadDate', DATE_FORMAT(`LocalDate`,'%Y-%m-%d') as 'ReadDate2',`ReferenceText`,`Reference`,`ReferenceTo`,`Version`,`deletedate` FROM `trackRead` WHERE `email`='".$email."' and `deletedate` is null ORDER By `ID` DESC LIMIT 1");
        //DESC LIMIT 1
        if ( $result->num_rows > 0 ) {
            while($recentRead = $result->fetch_assoc()) {	
                //    ID:0, ReadDate:1, ReferenceText:2, Reference:3, ReferenceTo:4, Version:5, TitleNum:6, DeleteDate:7, 
                echo $recentRead["ID"].",".$recentRead["ReadDate"].",".$recentRead["ReadDate2"].",".$recentRead["ReferenceText"].",".$recentRead["Reference"].",".$recentRead["ReferenceTo"].",".$recentRead["Version"].",,,".$recentRead["Method"].",".$recentRead["comment"];
  
            }
        }   
    }
    

?> 

