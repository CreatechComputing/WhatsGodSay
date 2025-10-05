<?php
/* Log out process, unsets and destroys session variables */
if(!isset($_SESSION)) 
{  session_start(); 
session_unset(); }
echo "You are Logged Out";
session_destroy(); 
?>
