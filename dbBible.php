<?php 
/* Database connection settings */
$host = 'localhost';
$user = "biblereader";
$pass = 'thisisdev';
$db = 'whatsgs4_Bible';
$mysqli = new mysqli($host,$user,$pass,$db) or die($mysqli->error);
mysqli_set_charset($mysqli,"utf8");
