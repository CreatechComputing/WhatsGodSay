<?php
// Connect to the database
require 'dbBible.php';

//set variable type
$jsonData = array();

// Prepare the query
$sqlText=$mysqli->escape_string($_POST['sqlText']);
$stmt = $mysqli->query($sqlText);

    while ($array = mysqli_fetch_assoc($stmt)) {
        $jsonData[] = $array;
   }
    // Output the JSON
    echo json_encode($jsonData);

?>