<?php
// Connect to the database
require 'dbBible.php';

//set variable type
$jsonData = array();

//Get SQL text
$sqlText=$mysqli->escape_string($_POST['sqlText']);

//Remove any backslashes passed trhrough on quotes 
$sqlText=str_replace("\\","",$sqlText);

//ensure ONLY doing a select statement 
if (strtoupper(substr($sqlText,0,6))=="SELECT") {
    // Prepare the query
    $stmt = $mysqli->query($sqlText);
    
    
    if ( $stmt->num_rows > 0 ) {
        //read through each row of query
        while ($result = $stmt->fetch_assoc()) { 
            $jsonData[] = $result;
       }
        // Output the JSON
        echo json_encode($jsonData);
    }  
    else 
        echo "no rows returned with SQL of ".$sqlText;
}
else
    echo "Forbidden SQL Statement";
    
    
?>