﻿<?php

require 'dbBible.php';

$ref=$mysqli->escape_string($_POST['ref']);

echo "ref:".$ref."<br><br>";

$Book=(int)substr($ref,0,2);
$Chap=(int)substr($ref,2,3);
$Vrs=(int)substr($ref,5,3);
// echo $ref."<br><br>";
// echo "Book:".$Book."<br><br>";
// echo "Chapter:".$Chap."<br><br>";
// echo "verse:".$Vrs."<br><br>";

//echo verses from refList

{$sqlStmt = 'SELECT * FROM `AmalGNT` WHERE `BookNum`='.$Book.' AND `Chapter`='.$Chap.' AND `Verse`='.$Vrs.' Order BY `WordOrder`'; }
//echo $sqlStmt;



	//$sqlStmt=getSQLText($ref);
	
 	//$result = mysql_query($sqlStmt);

 //while ($row = mysql_fetch_assoc($result)) {
 //  echo $row;
//}
	
	$stmt=$mysqli->query($sqlStmt);

	for ($set = array (); $row = $stmt->fetch_assoc(); $set[] = $row);
			var_export($set)."<br>";

// while ($row = mysqli_fetch_assoc($stmt)) {
//   print_r $row;
// }

	//Get the 2D Array all at once? 
	//$stmt = $db->prepare("SELECT * FROM users WHERE ID = ?");
	
	//$stmt->bind_param("i", $userID);

// because the variable is bound by ref you can assign the value after binding, too
//$userID = 2;

	//$stmt->execute();


	//$result = $stmt->get_result();
	//$users  = $result->fetch_all(MYSQLI_ASSOC);
	//
	// while($resultVersion = $stmt->fetch_assoc()) {
	// 	echo $resultVersion["OrigLangRow"];
	// }
    

	//$stmt->free();
	$mysqli->close();

function getSQLText($ref){

	$Book=substr($ref,0,2);
	$Chap=substr($ref,2,3);
	$Vrs=substr($ref,5,3);
	echo ($ref);
	echo("Book:".$Book);
	echo("Chapter:".$Chap);
	echo($Vrs);
	
    if ($Book<"40")  //Old Testament and LXX
		{$sqlText = "SELECT * FROM `AmalGNT` WHERE `BookNum`=".$Book." AND `Chapter`=".$Chap." AND `Verse`=".$Vrs." Order BY `WordOrder`"; }
	elseif ($Book>"66") //LXX
		{$sqlText = "SELECT Book,Chapter,Verse, CONCAT('WEB:',`displayWEB`,'<BR><BR>KJV:',`displayKJV`) as Writing FROM `VerseList` WHERE Ref='".$ref."'"; }
	else   //New Testament
		{$sqlText = "SELECT * FROM `AmalGNT` WHERE `BookNum`=".$Book." AND `Chapter`=".$Chap." AND `Verse`=".$Vrs." Order BY `WordOrder`"; }
	return $sqlText; 
}


?>

