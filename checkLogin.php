<?php
if(!isset($_SESSION)) 
{  session_start();  }

require 'db.php';

    if ($_SESSION['logged_in']==true) {
        $UserID=$_SESSION['UserID'];
        $email= $_SESSION['email'];
        $result = $mysqli->query("SELECT * FROM users WHERE email='$email'");
        $user = $result->fetch_assoc();
        echo "You are Logged In.~".$UserID."~".$email."~".$user['username']."~".$user['first_name']."~".$user['last_name']."~".$user['religion']."~".$user['comments']."~".$user['active'];
 
    }    
    else {
        echo "false";
    } ;        

?>
