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
//remove mIA quotes
for ($i=0;$i< count($mIA);$i++)
    $mIA[$i]=str_replace("\"","",$mIA[$i]);

$rListArr= explode(";",$rList);
$qryStr="";


//echo  "mID:".$mID."\n";


$fileCount=1; //count of files (or synth) will be the number of objects returned. Some references will have more than one voice file.  

$connector="";   //will change to seperator value (e.g. Union or comma) after first row and prepend the comma to the start of every subsequent string
$i=0;

//begin create query string.  Build one SQL select for all non=synch references in rList. Union between each ref Item;
$connector=""; 
for ($i=0;$i< count($rListArr);$i++){
    $rListItem=$rListArr[$i];
    $singleRefArr=explode("-",$rListItem);   
    $Book=substr($singleRefArr[0],0,2);


    if ($i==1)  //only before 2nd pass change the string between SELECTs as UNION 
        $connector="\n UNION "; 
    if ($mIA[$i]==0) //synth placeholder 
        $qryStr=$qryStr.$connector."SELECT \"".$i."\" As RefIncr, GT.* FROM `GetTiming`AS GT \n WHERE `MetaID`=".$mIA[$i]." AND `FileID`=\"3605\"";           
    else
        $qryStr=$qryStr.$connector."SELECT \"".$i."\" As RefIncr, GT.* FROM `GetTiming`AS GT \n WHERE `MetaID`=".$mIA[$i]." AND `Book`=".(int)$Book."  AND (`RefID`>=\"".$singleRefArr[0]."\" AND `RefID`<=\"".$singleRefArr[1]."\")";  //Need to add WordRef="01" when DB has other word's timed         
} //end create query string

//echo "\n\n".$qryStr."\n\n";

$connector=""; 
$vF="{"; //VoiceFle string to become client-side object, includes Object strings for synth voices which are NOT returned from SQL audioFileTracking  
//run select in call to DB
$result = $mysqli->query($qryStr);
if ($result->num_rows==0) //should never happen
    return "error:There were no DB rows for voiceFle Object.";

$rd = $result->fetch_assoc(); //prime with first row  
while ($rd!=NULL) { //will break when Needed
   
    //Build Opt 1: Add synth based on missing RefIncr # AND metaID==0
    if ($rd["MetaID"]==0) { 
        $vF=$vF.$connector."\"o".$fileCount++."\":{\"rArrI\":\"".$rd["RefIncr"]."\",\"file\":\"none\",\"ref\":\"".$rListArr[$rd["RefIncr"]]."\"}"; 	
        if ($connector=="")
            $connector=",";
        
        $rd = $result->fetch_assoc();    
     } 
    //Build Opt 2 part a: Not synth so get first half of vF for row o# name, rArri,file, dur, ref - first part and dash     
    else { 
        $curFileID=$rd["FileID"];
        $timingStr="";
        $tS_connector="";
        $lastRefID="";
        $lastStop="";

        $vF=$vF.$connector."\"o".$fileCount++."\":{\"rArrI\":\"".$rd["RefIncr"]."\",\"file\":\"".$rd["FolderName"]."/".$rd["File"]."\",\"dur\":\"".$rd["Length"]."\",\"ref\":\"".$rd["RefID"]."-"; 	
        if ($connector=="")
            $connector=",";

    //Build Opt 2 part b: ref ending, tracking (build), and stop.
        while($curFileID==$rd["FileID"])  { //get all timing.
            $timingStr=$timingStr.$tS_connector."\"".$rd["Timing"]."\"";
            if ($tS_connector==""){ //only tru once after first timing added above
                $tS_connector=",";      
            }
            $lastStop=$rd["Stop"];
            $lastRefID=$rd["RefID"];
            $rd = $result->fetch_assoc(); 
        }
        $vF=$vF.$lastRefID."\",\"timing\":[".$timingStr."],\"stop\":\"".$lastStop."\"}";
        // "-46130599","timing":["3","11.5","23","32","40"],"stop":"48"}}~3;

    } 
} 
   $fileCount--; 
   echo $vF."}~".$fileCount;
?> 