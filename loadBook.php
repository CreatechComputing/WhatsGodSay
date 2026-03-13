<?php
// Connect to the database
require 'dbBible.php';

//set variable type
$bkName =    $mysqli->escape_string($_POST['bookName']);
$bkNum =    $mysqli->escape_string($_POST['bookNum']);
$version =  $mysqli->escape_string($_POST['version']);
$versionNum =  $mysqli->escape_string($_POST['versionNum']);
$bookType = $mysqli->escape_string($_POST['bookType']);
$cm=',';
$ob='[';
$eb=']';
$eq='=';
$sq="'";

//Start  $rTxt -the return text of 2D array that is the book data.
echo '<script data-bv'.$eq.$sq.$bkName.$version.$sq.'>B'.$bkName.$version.$eq.$ob;

if ($bookType == 'n') {
    $sqlText='SELECT `chapter`,`verse`,`wo`,`word`,`root`,`nameid`,`parse`, `lemma`,`strongs`,`punctbefore`,`punctafter`,`paragraph`,`poet`,`section`,`g-wo`,`greek`,`bkwo`,`phonetic` FROM `wordlistnt` WHERE `book`='.$bkNum." and `version`=".$versionNum;
    // $id = sprintf('%02d%02d%02d',(int)$row['chapter'],(int)$row['verse'],(int)$row['wo']);
    // echo $concatenated; // Output: e.g., "051203" if values were 5, 12, 3   

}
//run SQL
    $stmt = $mysqli->query($sqlText);

    if ( $stmt->num_rows > 0 ) {
        //add row 0 as field names in order
        echo $ob.$sq.'id'.$sq.$cm.$sq.'word'.$sq.$cm.$sq.'bkwo'.$sq.$cm.$sq.'root'.$sq.$cm.$sq.'nameid'.$sq.$cm.$sq.'parse'.$sq.$cm.$sq.'lemma'.$sq.$cm.$sq.'strongs'.$sq.$cm.$sq.'PunctBefore'.$sq.$cm.$sq.'PunctAfter'.$sq.$cm.$sq.'paragraph'.$sq.$cm.$sq.'poet'.$sq.$cm.$sq.'section'.$sq.$cm.$sq.'gwo'.$sq.$cm.$sq.'greek'.$sq.$cm.$sq.'phonetic'.$sq.$eb;
        //read through each row of query
        while ($row = $stmt->fetch_assoc()) { 
            echo $cm.$ob.$sq.sprintf('%03d%03d%03d',(int)$row['chapter'],(int)$row['verse'],(int)$row['wo']).$sq.$cm.$sq.$row['word'].$sq.$cm.$row['bkwo'].$cm.$sq.$row['root'].$sq.$cm.$row['nameid'].$cm.$sq.$row['parse'].$sq.$cm.$sq.$row['lemma'].$sq.$cm.$sq.$row['strongs'].$sq.$cm.$sq.$row['punctbefore'].$sq.$cm.$sq.$row['punctafter'].$sq.$cm.$row['paragraph'].$cm.$row['poet'].$cm.$row['section'].$cm.$row['g-wo'].$cm.$sq.$row['greek'].$sq.$cm.$sq.$row['phonetic'].$sq.$eb;      
        }
        echo $eb.";\r\n";
    //    echo 'paraJUDLEB'.$eq.$ob.$sq.'010101'.$sq.$cm.$sq.'010301'.$sq.$cm.$sq.'010501'.$sq.$cm.$sq.'010801'.$sq.$cm.$sq.'011401'.$sq.$cm.$sq.'011701'.$sq.$cm.$sq.'012401'.$sq.$eb.';';
    //    echo "\r\n";
    //    echo '</script>'; 
    }  
    else 
        echo  'no rows returned with SQL of '.$sqlText;
?>