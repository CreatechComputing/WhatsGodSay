<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';



$email=$_SESSION['email'];
if  ($_SESSION['logged_in'] == true) {
    $UserID=$_SESSION['UserID']; 
    $reference=$mysqli->escape_string($_POST['reference']);
    $referenceTo=$mysqli->escape_string($_POST['referenceTo']);
    $vrsn=$mysqli->escape_string($_POST['vrsn']);
    $RefText=$mysqli->escape_string($_POST['RefText']);
    $LocalTimeString=$mysqli->escape_string($_POST['LocalTimeString']);
    $comment=$mysqli->escape_string($_POST['comment']);
    $method=$mysqli->escape_string($_POST['method']);

    $result = $mysqli->query("INSERT INTO trackRead (UserID,email, Reference,ReferenceTo,Version,ReferenceText,LocalDate,Method,comment) VALUES ('".$UserID."','".$email."','".$reference."','".$referenceTo."','".$vrsn."', '".$RefText."', STR_TO_DATE('".$LocalTimeString."','%m-%d-%Y %H:%i'),'".$method."','".$comment."');");

   // mail($email,"You read ".$RefText." from the ".$vrsn,"WhatsGodSay.org has just marked you as reading ".$RefText." from the Version ".$vrsn." at ".$LocalTimeString,"From:DoNotReply@whatsgodsay.org");
    echo "Marked as Read:".$reference." ".$referenceTo." ".$RefText." ".$vrsn." Session Email: ".$email; 
} else { echo "Cannot Mark as Read without being logged in.";
}

?> 

