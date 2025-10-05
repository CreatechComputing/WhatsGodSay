﻿<?php

require 'dbBible.php';

$refList=$mysqli->escape_string($_POST['refList']);
$vrsn=$mysqli->escape_string($_POST['Version']);
$refText=$mysqli->escape_string($_POST['refText']);
//echo $refText."<br><br>";
$incre=0;
//$BookArray=array('PlaceHolder','Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation');

//echo verses from refList
if (strpos($refList, ";")!==false) { //has a semi-colon so make an array
	$refList=explode(";",$refList);
	$refText=explode(";",$refText);
	foreach ($refList as $reference){
		//write Reference
		echo $refText[$incre]."<br>";
		$incre++;
		//echo $BookArray[intval(substr($reference,0,2))]." ".intval(substr($reference,2,3));
		$sqlStmt=getSQLText($reference,$vrsn);
		$stmt=$mysqli->query($sqlStmt);
		if ( $stmt->num_rows > 1 ) 
			while($resultVersion = $stmt->fetch_assoc()) {
				echo $resultVersion["Writing"];					   
			}			
		else { 				
			$resultVersion = $stmt->fetch_assoc(); 
			echo $resultVersion["Writing"];					   
		}	
		echo "<br><br>";
	}
}
else {  //only one reference although it might be a range of verses
	$sqlStmt=getSQLText($refList, $vrsn);
	$stmt=$mysqli->query($sqlStmt);
	echo $refText."<br>";
	if ( $stmt->num_rows > 1 ) 
		while($resultVersion = $stmt->fetch_assoc()) {
			echo $resultVersion["Writing"];					   
		}
	else { 				
		$resultVersion = $stmt->fetch_assoc(); 
		echo $resultVersion["Writing"];					   
	}
}

echo "</div>";	

	//$stmt->free();
	$mysqli->close();

function getSQLText($reference, $vrsn){
	$referenceEnd="";
	$Book=substr($reference,0,2);
	if (strpos($reference , '-') !== false) //has a dash so split it 
	{   
		$referenceEnd=substr($reference,9,8);
		$reference=substr($reference,0,8);
		$sqlText = "SELECT Book,Chapter,Verse, display".$vrsn." as Writing FROM `VerseList` WHERE (`Ref`>='".$reference."' and `Ref`<='".$referenceEnd."') order by `Ref`"; 
	}
	else {  // a single reference
		$reference=substr($reference,0,8);
		if ($vrsn=="ALL"){   //compare verses
			if ($Book<"40")  //Old Testament
				{$sqlText = "SELECT Book,Chapter,Verse, CONCAT('LEB:',`displayLEB`,'<BR>ULB:',`displayULB`,'<BR>WEB:',`displayWEB`,'<BR><BR>BSB:',`displayBSB`,'<BR>ERV:',`displayERV`,'<BR>NET:',`displayNET`,'<BR><BR>FBV:',`displayFBV`,'<BR>UDB:',`displayUDB`,'<BR><BR>ASV:',`displayASV`,'<BR>KJV:',`displayKJV`) as Writing FROM `VerseList` WHERE Ref='".$reference."'"; }
			elseif ($Book>"66") //AP
			   {$sqlText = "SELECT Book,Chapter,Verse, CONCAT('WEB:',`displayWEB`,'<BR><BR>KJV:',`displayKJV`) as Writing FROM `VerseList` WHERE Ref='".$reference."'"; }
			else   //New Testament
				{$sqlText = "SELECT Book,Chapter,Verse, CONCAT('LEB:',`displayLEB`,'<BR>ULB:',`displayULB`,'<BR>WEB:',`displayWEB`,'<BR><BR>BSB:',`displayBSB`,'<BR>ERV:',`displayERV`,'<BR>NET:',`displayNET`,'<BR><BR>FBV:',`displayFBV`,'<BR>OEB:',`displayOEB`,'<BR>UDB:',`displayUDB`,'<BR><BR>ASV:',`displayASV`,'<BR>KJV:',`displayKJV`,'<BR><BR>BYZ:',`displayBYZ`,'<BR>EPT:',`displayEPT`,'<BR>TR:',`displayTRS`,'<BR><BR>SBL:',`displaySBL`,'<BR>TH:',`displayTHT`,'<BR>BHP:',`displayBHP`,'<BR>NST:',`displayNST`,'<BR>TCH:',`displayTCH`,'<BR>WH:',`displayWHT`,'<BR><BR>SNT:',`displaySNT`) as Writing FROM `VerseList` WHERE Ref='".$reference."'";}
		}
		else {
		$sqlText = "SELECT Book,Chapter,Verse, display".$vrsn." as Writing FROM `VerseList` WHERE Ref='".$reference."'"; 
		}
	}
	return $sqlText; 
}


?>

