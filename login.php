<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

/* User login process, checks if user exists and password is correct */

// Escape email to protect against SQL injections
$email = $mysqli->escape_string($_POST['email']);
$result = $mysqli->query("SELECT * FROM users WHERE email='$email'");
$_SESSION['logged_in'] = false;

if ( $result->num_rows == 0 ){ // User doesn't exist
    $_SESSION['message'] = "This email is not registered with WhatsGodSay.<br>Please Sign Up.";
       
    //header("location: error.php");
}
else { // User exists
    $user = $result->fetch_assoc();

    if ( password_verify($_POST['password'], $user['password']) ) {
        $UserID= $user['id'];
        $_SESSION['UserID'] =$UserID;
        $_SESSION['email'] = $user['email'];

        $GroupIDs="";
        $result2 = $mysqli->query("SELECT `GroupID` FROM `UserGroups` WHERE `UserID`=".$UserID);
        $firstRow=true;
        if ( $result2->num_rows > 0 ) {
          while($recentRead = $result2->fetch_assoc()) {	
              if ($firstRow==true)
                  $firstRow=false;
              else
              $GroupID=$GroupID.",";
           
              $GroupID=$GroupID.$recentRead['GroupID'];
           }
            $_SESSION['GroupIDs'] = $GroupID;
        }
        $_SESSION['active'] = $user['active'];
        

        if ($_SESSION['active']==0){
            $_SESSION['message'] = "You cannot Sign In until you have replied to your verification email.<br><a onclick='ResendVerificationEmail()'>Resend Verification Email</a>.";   
        }  
        else  {
            // This is how we'll know the user is logged in
            $_SESSION['logged_in'] = true;
            $_SESSION['message'] = "You are Logged In.";
        }
      //  header("location: profile.php");
    }
    else {
        $_SESSION['message'] = "You have entered the wrong password, please try again.";
     //   header("location: error.php");
    }
}
echo  $_SESSION['message'];
?>
