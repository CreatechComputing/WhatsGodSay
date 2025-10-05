<?php

require 'dbBible.php';

$wrd=$mysqli->escape_string($_POST['wrd']);
//echo $wrd."<br>";
$strngs=$mysqli->escape_string($_POST['strngs']);
$strngs=str_replace("G","",$strngs);

$language=$mysqli->escape_string($_POST['language']);
$lemma=$mysqli->escape_string($_POST['lemma']);
//MounceWD:0,DodsonWD:1,PerseusWD:2,VinesWD:3,
//StrongsWD:4,WordNetWD:5,WebstersWD:6,OTRefWD:7,NTRefWD:8
$options=$mysqli->escape_string($_POST['options']);
$Websters="";
$WordNet="";
$VerseList="";
$lemmastmt="";
$rootstmt="";
$stmt="";
mysqli_set_charset($mysqli,"utf8");

//**************************** Get the SQL sets ********************************************
//*** get SQL if lemma exists ***/
//make SQL statement on Lemma, Wrd, or Strongs#
if ($lemma!=""){
  //if ($language==="Greek")
    $lemmastmt = $mysqli->query('SELECT * FROM `Lemma` WHERE `Lemma`="'.$lemma.'"');
  //else 
  //   $lemmastmt = $mysqli->query('SELECT * FROM `Lemma` WHERE `Transliteration`="'.$lemma.'"');    
}
else if ($strngs!="") {
    //echo "if strongs<br>".$strngs;
    $lemmastmt = $mysqli->query('SELECT * FROM `Lemma` WHERE `StrongsNumber`='.$strngs);
}
/* *** get SQL if wrd exists *** */
if ($wrd!=""){
    //check for wild cards
    if (strpos($wrd, '%') !== false || strpos($wrd, '_') !== false) //wildcards in word
        $comp=" like ";
    else 
        $comp=" = ";

  if ($language==="Greek"){    
    //first check GreekWord
    $stmt = $mysqli->query('SELECT `Lemma` FROM `GreekWord` WHERE `Word`'.$comp.'"'.$wrd.'"');
    
    if ( $stmt->num_rows == 0 ) //Not in GreekWord then check if Lemma
      $stmt = $mysqli->query('SELECT `Lemma` FROM `Lemma` WHERE `Lemma`'.$comp.'"'.$wrd.'"');
        
    if ( $stmt->num_rows > 0 ) { //was found in either GreekWord or Lemma
      $resultWordData = $stmt->fetch_assoc();  
      $lemma=$resultWordData["Lemma"];
      $lemmastmt = $mysqli->query('SELECT * FROM `Lemma` WHERE `Lemma`="'.$lemma.'"');
    }
    else { // NOT found in either GreekWord or Lemma
      echo "The Greek word ".$wrd." was not found.";
    }

  }  
  else { //get SQL for English wrd

    //see if wrd exists
    $stmt = $mysqli->query('SELECT Root FROM `ListOfWords` WHERE `Word`'.$comp.' "'.$wrd.'"');
    if ( $stmt->num_rows == 0 ) {
      echo 'The word '.$wrd.' could not be found. ';
      return;
    }
    // wrd exists get root
    $resultWordData = $stmt->fetch_assoc();
    $root=$resultWordData['Root'];

    // ***********Get wrd definitions*************** 
    //get Websters
    // $stmt = $mysqli->query('SELECT `Definition` FROM `Websters` WHERE `Word`="'.$wrd.'"');
    // $resultWordData = $stmt->fetch_assoc();
    // $Websters=$resultWordData['Definition'];

    //get WordNet Definition
    $stmt = $mysqli->query('SELECT `Definition` FROM `WordNet` WHERE `Word`="'.$wrd.'"');
    $resultWordData = $stmt->fetch_assoc();
    $WordNet=$resultWordData['Definition'];

    // *******************  process root data 
   //get all words for Root
    $wrdList="Words:";
    $stmt = $mysqli->query('SELECT `Word`, `Count` FROM `ListOfWords` WHERE `Root`="'.$root.'"');
    while($rowRead = $stmt->fetch_assoc()) {	
      $wrdList=$wrdList." ".$rowRead['Word']." (".$rowRead['Count']."); "; 
    }   
    //get Root data
    $rootstmt = $mysqli->query("SELECT *, `Root` as 'Word' FROM `ListOfRoots` WHERE `Root`='".$root."'");
  }

} //end if wrd exists
else { //check if no wrd nor lemma found 
  if ($lemmastmt==""){
    echo "Could NOT find a word match for the value entered.";
    return;
  }  
}
//********************************** process SQL and data from above ****************************************
//********* process English 
if ($rootstmt!="") { //English
  $resultWordData = $rootstmt->fetch_assoc();
  //echo "Word: ".$wrd.", Lemma: ".$resultWordData["Lemma"].", Definition:<strong> ".$resultWordData["wordData"]."</strong><br>The SBL GNT has ".$resultWordData["Lemma.CountSBL"]." occurences in ".$resultWordData["VerseCount"]." verses.";  
  if ($resultWordData==false) {
      echo "No matches found.";
      return;
  }
  echo "<small>English Words are matched based on NET. (This will eventually be changed to all versions).</small><br>";
  getRefencesByPortion($resultWordData,true); 

  echo '<button class="accordion">WordNet Dictionary</button>';
  echo '<div class="panel">';
  //New if ($WordNet!="") {
  //New  echo '<button id="WordNetSA" class="subaccordion">WordNet</button>';
  //New  echo '<div id="WordNetSP" class="subpanel">';
    echo $WordNet.'</div>';
  //New}
  // if ($Websters=="Need to Fix Data First") {
  //   echo '<button id="WebstersSA" class="subaccordion">Websters</button>';
  //   echo '<div id="WebsterSP" class="subpanel">';
  //   echo $Websters.'</div>';
  // }
  //echo '</div>';
} // End English 

// add heading if returning English and Greek word data
if ($rootstmt!="" && $lemmastmt!="")
   echo "<br><br>Greek Word<br>";

// has Greek Word    
if ($lemmastmt!=""){
  $resultWordData = $lemmastmt->fetch_assoc();
  $lemma=$resultWordData["Lemma"];
  echo "<small>Greek Words are matched based on SBL. (This will eventually be changed to all versions).</small><br>";
 
  //echo "Word: ".$wrd.", Lemma: ".$resultWordData["Lemma"].", Definition:<strong> ".$resultWordData["wordData"]."</strong><br>The SBL GNT has ".$resultWordData["Lemma.CountSBL"]." occurences in ".$resultWordData["VerseCount"]." verses.";  
  if ($resultWordData==false) { //I don't think this can happen but hey, ya never know
      echo "No matches found.";
      return;
  }

  echo "Lemma: ".$resultWordData["Lemma"]." (".$resultWordData["Transliteration"].") &nbsp;&nbsp;&nbsp; NT(".$resultWordData["Count"].") &nbsp; Septuagint(".$resultWordData["SeptCount"].")";
   if (substr($options,0,6)!="000000"){ //if at least 1 lexicon is selected then
    echo '<button class="accordion">Lexicons</button><div id="LexiconP" class="panel">';
    if ($options[0]=='1') {
     echo '<button id="MounceSA" class="subaccordion">Mounce</button>';
     echo '<div id="MounceSP" class="subpanel">';
     echo $resultWordData["mounce-headword"]." (GK".$resultWordData ["gk"]."): ".$resultWordData["Mounce"]."</div>";
    }
    if ($options[1]=='1') {
     echo '<button id="DodsonSA" class="subaccordion">Dodson</button>';
     echo '<div id="DodsonSP" class="subpanel">';
     echo $resultWordData["DodsonLemma"]." (".$resultWordData ["DodsonLatin Headword"]."): ".$resultWordData["DodsonLong"]."</div>";
    }
    if ($options[4]=='1') {
      echo '<button id="StrongsSA" class="subaccordion">Strongs</button>';
      echo '<div id="StrongsSP" class="subpanel">';
      echo "<b>".$resultWordData["Lemma"]."</b> <b>".$resultWordData["Latin"]."</b>, <i>".$resultWordData["LatinSyl"]."</i>; ".$resultWordData["Strongs"]."</div>";
    }
    if ($options[2]=='1') {
     echo '<button id="MidLidSA" class="subaccordion">Middle Liddell</button>';
     echo '<div id="MidLidSP" class="subpanel">';
     echo $resultWordData["Perseus"]."</div>";
    }
    if ($options[5]=='1') { //Need to add 5
      echo '<button id="AbbottSmithSA" class="subaccordion">Abbott-Smith</button>';
      echo '<div id="AbbottSmithSP" class="subpanel">';
      echo $resultWordData["AbbottSmith"]."</div>";
      }
      if ($options[3]=='1') {
        echo '<button id="VinesSA" class="subaccordion">Vines</button>';
        echo '<div id="VinesSP" class="subpanel">';
        echo $resultWordData["Vines"]."</div>";
        }  
    echo '</div>';
  }  //end if at least 1 lexixcon is selected

   /* ********************Do Greek References****************************************** */   
  // get Greek Refernce SQL
  //echo "<br> Lemma for Greek:".$lemma."<br>";
  $lemmastmt = $mysqli->query('SELECT * FROM `ListOfLemmas` WHERE `Lemma`="'.$lemma.'"');
  $resultWordData = $lemmastmt->fetch_assoc();
   getRefencesByPortion($resultWordData,false); 
}
 
  //cleanup
  if($rootstmt!="")
      $rootstmt->free();
  if ($lemmastmt!="")  
      $lemmastmt->free();
  if ($stmt!="")  
      $stmt->free();
  $mysqli->close();


//functions
function getVerseList($refList, $bk){
  $book="";
  $VerseList="";
  $VerseArray=explode(";",$refList);
  $VerseCount=count($VerseArray);
  for($x = 0; $x < $VerseCount-1; $x++) {
       $VerseList=$VerseList."<span onclick=\"SV('".$bk.$VerseArray[$x]."')\">".$VerseArray[$x]."</span>; ";
  }
  return $VerseList;
}

function getRefencesByPortion($resultWordData, $HasOT){
// *************** get references and counts
  //prime single books with book name
  $inActs="";
  $inHebrews="";
  $InRevelation="";

  //get Hebrews Group.
  //currently set for Paul but should add option later set Hebrews to General.
  if ($resultWordData["Paul"]>0 || $resultWordData["Hebrews"]>0 ) 
    $cnt= $resultWordData["Paul"] + $resultWordData["Hebrews"];
  else 
    $cnt=0;

  if ($resultWordData["Acts"]>0)
    $inActs="Act".$resultWordData["ActsRef"];
  if ($resultWordData["Hebrews"]>0)
    $inHebrews="Heb".$resultWordData["HebrewsRef"];
  if ($resultWordData["Revelation"]>0)
    $inRevelation="Rev".$resultWordData["RevelationRef"];

    
  //Get NT/OT count and list

  $cntNT=$resultWordData["Gospels"] + $resultWordData["Acts"] + $resultWordData["Paul"] + $resultWordData["Hebrews"] + $resultWordData["General"] + $resultWordData["Revelation"];
  if ($HasOT==false)
    $cntOT=0;
  else  
    $cntOT=$resultWordData["Pentateuch"] + $resultWordData["History"] + $resultWordData["Poetry"] + $resultWordData["Prophets"] + $resultWordData["Minor"];
  if ($cntNT>0)
    $refListNT=$resultWordData["GospelsRef"].$inActs.$resultWordData["PaulRef"].$inHebrews.$resultWordData["GeneralRef"].$inRevelation;;
  if ($cntOT>0)
    $refListOT=$resultWordData["PentateuchRef"].$resultWordData["HistoryRef"].$resultWordData["PoetryRef"].$resultWordData["ProphetsRef"].$resultWordData["MinorRef"];


  echo '<b>'.$resultWordData["Word"].'</b> occurences:<span onclick="SV2(\''.$refListNT.$refListOT.'\')">'.$resultWordData["Count"].'</span> '.$wrdList.'<br>';
  echo '<button class="accordion">References</button>';
  echo '<div class="panel">';
  echo '<b> NT </b>(<span onclick="SV2(\''.$refListNT.'\')">'.$cntNT.'</span>)<br>';
  if($cntNT>0) {
  if ($resultWordData["Gospels"]==0)
    echo "  Life of Jesus Christ (0)<br>";
  else
    echo "  Life of Jesus Christ (<span onclick='SV2(\"".$resultWordData["GospelsRef"]."\")'>".$resultWordData["Gospels"]."</span>):".getVerseList($resultWordData["GospelsRef"],"")."<br>";
  if ($resultWordData["Acts"]==0)
    echo "  Acts of Apostles (0)<br>";
  else  
    echo "  Acts of Apostles  (<span onclick='SV2(\"Acts".$resultWordData["ActsRef"]."\")'>".$resultWordData["Acts"]."</span>):".getVerseList($resultWordData["ActsRef"],"Act")."<br>";
  if ($cnt>0) {         
    echo "  Paul's Letters  (<span onclick='SV2(\"".$resultWordData["PaulRef"].$inHebrews."\")'>".$cnt."</span>):".getVerseList($resultWordData["PaulRef"],"").getVerseList($resultWordData["HebrewsRef"],"")."<br>";
  }
  else
    echo "  Paul's Letters (0)<br>";
  if ($resultWordData["General"]==0)
    echo "  General Letters (0)<br>";
  else
    echo "  General Letters (<span onclick='SV2(\"".$resultWordData["GeneralRef"]."\")'>".$resultWordData["General"]."</span>):".getVerseList($resultWordData["GeneralRef"],"")."<br>";
  if ($resultWordData["Revelation"]==0)
    echo "  Revelation (0)<br>";
  else
    echo "  Revelation  (<span onclick='SV2(\"Rev".$resultWordData["RevelationRef"]."\")'>".$resultWordData["Revelation"]."</span>):".getVerseList($resultWordData["RevelationRef"],"Rev")."<br>";
  }
    echo '<b> OT </b>(<span onclick="SV2(\''.$refListOT.'\')">'.$cntOT.'</span>)<br>';
  if($cntOT>0) {
    if ($resultWordData["Pentateuch"]==0)
    echo "  Books of Moses (0)<br>";
  else
    echo "  Books of Moses (<span onclick='SV2(\"".$resultWordData["PentateuchRef"]."\")'>".$resultWordData["Pentateuch"]."</span>):".getVerseList($resultWordData["PentateuchRef"],"")."<br>";
  if ($resultWordData["History"]==0)
    echo "  History of Israel (0)<br>";
  else
    echo "  History of Israel  (<span onclick='SV2(\"".$resultWordData["HistoryRef"]."\")'>".$resultWordData["History"]."</span>):".getVerseList($resultWordData["HistoryRef"],"")."<br>";
  if ($resultWordData["Poetry"]==0)
    echo "  Poetry (0)<br>";
  else
    echo "  Poetry (<span onclick='SV2(\"".$resultWordData["PoetryRef"]."\")'>".$resultWordData["Poetry"]."</span>):".getVerseList($resultWordData["PoetryRef"],"")."<br>";
  if ($resultWordData["Prophets"]==0)
    echo "  Major Prophets (0)<br>";
  else 
    echo "  Major Prophets (<span onclick='SV2(\"".$resultWordData["ProphetsRef"]."\")'>".$resultWordData["Prophets"]."</span>):".getVerseList($resultWordData["ProphetsRef"],"")."<br>";
  if ($resultWordData["Minor"]==0)
    echo "  Minor Prophets (0)<br>";
  else
    echo "  Minor Prophets (<span onclick='SV2(\"".$resultWordData["MinorRef"]."\")'>".$resultWordData["Minor"]."</span>):".getVerseList($resultWordData["MinorRef"],"")."<br>";
  }
  echo "</div>";  //end reference
 
}
?>