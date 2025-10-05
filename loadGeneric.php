<?php

require 'dbBible.php';

$sqlText=$mysqli->escape_string($_POST['sqlText']);
$echoText=$mysqli->escape_string($_POST['echoText']);

// fetch all rows
$stmt = $mysqli->query($sqlText);

while($rslt = $stmt->fetch_assoc()) {
 echo '<tr><td>'.$rslt['English'].'</td><td>'.$rslt['Word'].' ('.$rslt['Phonetic'].')</td><td>'.$rslt['Parse'].'</td><td>'.$rslt['Lemma'].'</td><td>'.$rslt['dStrongs'].'</td></tr>';
}

	$mysqli->close();
?>