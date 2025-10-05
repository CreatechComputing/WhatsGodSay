<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';
/* Registration process, inserts user info into the database 
   and sends account confirmation email message
 */

// Set session variables to be used on profile.php page
$_SESSION['email'] = $_POST['email'];
/* $_SESSION['first_name'] = $_POST['firstname'];
$_SESSION['last_name'] = $_POST['lastname'];

// Escape all $_POST variables to protect against SQL injections
$first_name = $mysqli->escape_string($_POST['firstname']);
$last_name = $mysqli->escape_string($_POST['lastname']);
*/ 
$email = $mysqli->escape_string($_POST['email']);
$password = $mysqli->escape_string(password_hash($_POST['password'], PASSWORD_BCRYPT));
$hash = $mysqli->escape_string( md5( rand(0,1000) ) );
$sharedName = $mysqli->escape_string($_POST['sharedName']);
$firstName = $mysqli->escape_string($_POST['firstName']);
$lastName = $mysqli->escape_string($_POST['lastName']);
$religionGroup = $mysqli->escape_string($_POST['religionGroup']);
      
// Check if user with that email already exists
$result = $mysqli->query("SELECT * FROM users WHERE email='$email'") or die($mysqli->error());

// We know user email exists if the rows returned are more than 0
if ( $result->num_rows > 0 ) {
    
    $_SESSION['message'] = 'User with this email already exists!';
   //header("location: error.php");
    
}
else { // Email doesn't already exist in a database, proceed...

    // active is 0 by DEFAULT (no need to include it here)
    $sql = "INSERT INTO users (email, password, hash, username,first_name, last_name,religion) VALUES ('$email','$password', '$hash','$sharedName','$firstName','$lastName','$religionGroup')";

    // Add user to the database
    if ( $mysqli->query($sql) ){

        $_SESSION['active'] = 0; //0 until user activates their account with verify.php
        $_SESSION['logged_in'] = false; // So we know the user has logged in
        $_SESSION['message'] =          
                 "After reading these directions, please close this tab and reopen this site from your email link explained here.<br> A confirmation link has been sent to your email of $email.<br>Please open your email and verify
                 your account by clicking on the link in the message. It may take several minutes before your email is sent.<br>If no email shows up then please ensure you typed your email address correctly on this site and that your email did not put the new mail into a separate folder.";
        // Send registration confirmation link (verify.php)
        $to      = $email;
        $subject = 'Account Verification (WhatsGodSay.org)';
        $message_body = '
       Blessings!

        I hope you enjoy the site.

        Please click this link to activate your account:

        https://www.whatsgodsay.org/?email='.$email.'&hash='.$hash;  

        mail( $to, $subject, $message_body,"From:donotreply@whatsgodsay.org" );

      // header("location: profile.php"); 

    }

    else {
        $_SESSION['message'] = 'Registration failed!';
     //  header("location: error.php");
    }

}
echo  $_SESSION['message']; 
?>