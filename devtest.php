<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';

//echo "testK\n";
$t=$mysqli->escape_string($_POST['test1']);
$tt=$mysqli->escape_string($_POST['test2']);
//MUST REMOVE SLASHES
$t=str_replace("\\", "", $t);
$tt=str_replace("\\", "", $tt);
//DECODE Converts the JS stringified array into a PHP array 
$d=json_decode($t);
$dd=json_decode($tt);

echo "t strlen:".strlen($t)."\n";
//SHOW PHP Array
echo "d:".$d."\n";
echo "d[0]:".$d[0]."\n";
echo "d[1]:".$d[1]."\n";
echo "d[2]:".$d[2]."\n";
echo "d[3]:".$d[3]."\n";
echo "d[4]:".$d[4]."\n";
echo "d[5]:".$d[5]."\n";
echo "d item count:".count($d)."\n";
echo "d[4][0]:".$d[4][0]."\n";
echo "d[4][1]:".$d[4][1]."\n";
echo "d[4][2]:".$d[4][2]."\n";
echo "d[4][3]:".$d[4][3]."\n";
echo "d[4][4]:".$d[4][4]."\n";
echo "d[4] item count:".count($d[4])."\n";

//Pass PHP array back to JS

echo "encode d1:".json_encode($d)."\n encode d2:".json_encode($dd)."\n";

$pArr=array("try","this","now",1.2,["subArray","trying",true],1.2);
echo "pArr:".$pArr."\n";
echo "pArr[0]:".$pArr[0]."\n";
echo "pArr[1]:".$pArr[1]."\n";
echo "pArr[2]:".$pArr[2]."\n";
echo "pArr[3]:".$pArr[3]."\n";
echo "pArr[4]:".$pArr[4]."\n";
echo "pArr[5]:".$pArr[5]."\n";
echo "pArr[5]:".$pArr[6]."\n";
echo "pArr[4][0]:".$pArr[4][0]."\n";
echo "pArr[4][1]:".$pArr[4][1]."\n";
echo "pArr[4][2]:".$pArr[4][2]."\n";
echo "pArr[4][3]:".$pArr[4][3]."\n";
echo "pArr[4][4]:".$pArr[4][4]."\n";

echo "encode pArr:".json_encode($pArr)."\n";


//echo "test1: ".$mysqli->escape_string($_POST['test1'])."\n t1:".$t."\n";
//echo "test2: ".$mysqli->escape_string($_POST['test2'])."\n t2:".$tt."\n";

//echo "t1[0]:".$t[0]."\nt2[0]:".$tt[0]."\n";

//echo "decode d1[0]:".$d[0]."\nd2[0]:".$dd[0]."\n";







//echo "decode d1:".$d."\nd2:".$dd."\n";
//echo "decode d1[0]:".$d[0]."\nd2[0]:".$dd[0]."\n d1[4]:".$d[4]."\n d2[4]:".$dd[4]."\n";




//CANNOT USE PHP array with a string variable
//$ttt=substr($tt,1);
//$ttt=substr($ttt,0,strlen($ttt)-1);
//echo "ttt string:".$ttt."\n";
//$ttArr=array($tt);
//echo "tt2Arr[0]:".$ttArr[0]."\n";
//echo "tt2Arr[1]:".$ttArr[1]."\n";
//echo "tt2Arr[2]:".$ttArr[2]."\n";
//echo "tt2Arr[3]:".$ttArr[3]."\n";
//echo "tt2Arr[4]:".$ttArr[4]."\n";

?>