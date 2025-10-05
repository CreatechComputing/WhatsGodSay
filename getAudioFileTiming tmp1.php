<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

//remove slashes in POST stringified arrays
$mID=str_replace("\\","",$mysqli->escape_string($_POST['metaID']));
$rList=str_replace("\\","",$mysqli->escape_string($_POST['refFromTo']));
$mIA= explode(",",$mID);
$rListArr= explode(";",$rList);
$zero=0;
$one=1;
$qryStr="";
//decode POST strings into arrays
$vFS="{";
$vFSConnector="";
//$metaID=json_decode($mID);
//$refList=json_decode($rList);
$sI=0; //source Increment of both metaID and refList arrays
$fileCount=1; //count of files (or synth) will be the number of objects returned. Some references will have more than one voice file.  

//Get login ID
$UserID=$_SESSION['UserID'];

$myRow=0; //

$rowMoreThan1=false; // ?
$connector="";   //will change to comma(,) after first row and prepend the comma to the start of every subsequent string
$i;
if  ($_SESSION['logged_in'] == true) {
    echo "\n\n\n----------------- mID:".$mID."\n";
    echo "mIA[0]:".$mIA[0]."\n";
    echo "rList string:".$rList."\n";
    echo "rListArr[0]:".$rListArr[0]."\n";
   
         
//build one SQL select for all non=synch references in rList. Union between each rItem;
$connector=""; 
for ($i=0;$i< count($rListArr);$i++){
    echo "\n\ni:".$i."\n--- rListArr[i]:".$rListArr[$i]."\n"; 
//    $singleRefArr=explode("-",$rListArr[$i])."\n";
    $rListItem=$rListArr[$i];
    echo "rListItem:".$rListItem."\n";
    $singleRefArr=explode("-",$rListItem); 
    echo "\nsingleRefArr[0]:".$singleRefArr[0]."\n";
    echo "\nsingleRefArr[1]:".$singleRefArr[1]."\n";

    
    $Book= substr($singleRefArr[0],0,2);
    if ($i==1)
        $connector=" Union "; 
        $qryStr=$qryStr.$connector."SELECT \"".$i."\" As RefIncr, GT.* FROM `GetTiming`AS GT Where `ID`=".$mIA[$i]." AND `Book`=".(int)$Book."  AND (`RefID`>=\"".$singleRefArr[0]."\" AND `RefID`<=\"".$singleRefArr[1]."\")";  //Need to add WordRef="01" when DB has other word's timed 
  
     //+=$connector + 'SELECT "' + $i + '" As RefIncr, GT.* FROM `GetTiming`AS GT Where `ID`=' + $mIA[$i] +   ' AND `Book`=' + (int)$Book + '  AND (`RefID`>="' + $singleRef[0] + '" AND `RefID`<="' + $singleRef[1] + '")';  //Need to add WordRef="01" when DB has other word's timed 

                       //SELECT 0              As RefIncr, GT.* FROM `GetTiming` AS GT Where `ID`=1                 AND `Book`=60                 
}

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1Check on qryStr
echo $qryStr;

// //run/check select in call to DB
//     $result = $mysqli->query($qryStr);
//      //check if no return. Since it is checked to not be all synch client side, this should never happen     
//      if ( $result->num_rows == 0 ) {
//         echo "no rows";  // should never happen if timing info was loaded
//         return;
//     }  
 
//     //loop through each timing row returned
//     $myRow= $result->fetch_assoc();   
//     if ($metaIdArr==0) //synth
//         $vFS+=$vFSConnector + '"o' + $fileCount + '":{"rArrI":"' + $srceIncre + '","file":"none","ref":"' + $rListArr[$srceIncre] + '"}';
//     }
//     else{ //is a human voiceFile
//     //prime for new object creation
//     $timingMoreThan1=false;
//     $timingConnector="";
//     }           

//     //add voice file row with timing rows
//     if ($rowMoreThan1==false){
//     $rowMoreThan1=true;
//     }


//     echo "[".$myRow["RefIncr"].",".$myRow["MetaID"].",".$myRow["File"].",".$myRow["Book"].",".$myRow["Chapter"].",".$myRow["Chapters"].",[".$myRow["Timing"]; 
//     //    echo '{"o1":{"rArrI":"0","file":"https://ebible.org/webaudio/Heb04.mp3","dur":"139","ref":"58041601-58041699","timing":["130.25"],"stop":"139"},"o2":{"rArrI":"0","file":"https://ebible.org/webaudio/Heb05.mp3","dur":"165","ref":"58050101-58050299","timing":["7","16"],"stop":"23.5"},"o3":{"rArrI":"2","file":"WEB/WinfredHenson/46_1Cor13.mp3","dur":"116","ref":"46130101-46130599","timing":["3","11.5","23","32","40"],"stop":"48"}}~3';
     
//      while( $myRow= $result->fetch_assoc()) {
//           else
//              echo ",".$myRow["Timing"];
//      }
//  echo "]]";    
// }     
// }  


//  //for (i=0;i<count($refList;i++){

}
else { //not logged in for testing now
    // echo "metaID:".$metaID[0]."   refList:".$refList[0];
echo '{"o1":{"rArrI":"0","file":"https://ebible.org/webaudio/Heb04.mp3","dur":"139","ref":"58041601-58041699","timing":["130.25"],"stop":"139"},"o2":{"rArrI":"0","file":"https://ebible.org/webaudio/Heb05.mp3","dur":"165","ref":"58050101-58050299","timing":["7","16"],"stop":"23.5"},"o3":{"rArrI":"2","file":"WEB/WinfredHenson/46_1Cor13.mp3","dur":"116","ref":"46130101-46130599","timing":["3","11.5","23","32","40"],"stop":"48"}}~3';
//"o3":{"rArrI":"1","file":"none","ref":"67010101-67010199"},
} 


?> 