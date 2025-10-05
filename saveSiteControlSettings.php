<?php
if(!isset($_SESSION)) 
{ 
    session_start(); 
}
require 'db.php';
 
if  ($_SESSION['logged_in'] == true) {
  $UserID=$_SESSION['UserID']; 
  $noteID=$mysqli->escape_string($_POST['noteID']);
  $showTitleBar=$mysqli->escape_string($_POST['showTitleBar']);
  $showFooter=$mysqli->escape_string($_POST['showFooter']);
  $themeName=$mysqli->escape_string($_POST['themeName']);
  $themeDarkColor=$mysqli->escape_string($_POST['themeDarkColor']);
  $themeSWColor=$mysqli->escape_string($_POST['themeSWColor']);
  $activeWindow=$mysqli->escape_string($_POST['activeWindow']);
  $greekDisplay=$mysqli->escape_string($_POST['greekDisplay']);
  $fontSize=$mysqli->escape_string($_POST['fontSize']);
  $fontFamily=$mysqli->escape_string($_POST['fontFamily']);
  $wordDataOptions=$mysqli->escape_string($_POST['wordDataOptions']);
  $audioTypeAllowed=$mysqli->escape_string($_POST['audioTypeAllowed']);
  $ReadingDefault=$mysqli->escape_string($_POST['ReadingDefault']);
  $StudyDefault=$mysqli->escape_string($_POST['StudyDefault']);
  $sectionTitleDefault=$mysqli->escape_string($_POST['sectionTitleDefault']);
  $sectionTitleOriginal=$mysqli->escape_string($_POST['sectionTitleOriginal']);



  $myQueryText="INSERT INTO `SiteSettings` (`UserID`, `showTitleBar`,`showFooter`,`themeName`,`themeDarkColor`, `themeSWColor`,`greekDisplay`,
  `fontSize`,`fontFamily`,`wordDataOptions`, `audioTypeAllowed`,
  `ReadingDefault`,`StudyDefault`, `sectionTitleDefault`,`sectionTitleOriginal`,`createDate`, `modifyDate`)
  VALUES (".$UserID.",".$showTitleBar.",".$showFooter.",'".$themeName."','".$themeDarkColor."','".$themeSWColor."',".$greekDisplay.",".$fontSize.",'".$fontFamily."','".$wordDataOptions."','".$audioTypeAllowed."','"
  .$ReadingDefault."','".$StudyDefault."','".$sectionTitleDefault."',".$sectionTitleOriginal.",CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
  ON DUPLICATE KEY UPDATE
  `showTitleBar`=".$showTitleBar.",`showFooter`=".$showFooter.",`themeName`='".$themeName."',`themeDarkColor` = '".$themeDarkColor."',
  `themeSWColor` ='".$themeSWColor."',`greekDisplay`=".$greekDisplay.",`fontSize`=".$fontSize.",`fontFamily`='".$fontFamily."',`wordDataOptions`='".$wordDataOptions."', `audioTypeAllowed`='".$audioTypeAllowed."',
  `ReadingDefault`= '".$ReadingDefault."', `StudyDefault`= '".$StudyDefault."', `sectionTitleDefault` = '".$sectionTitleDefault."',
  `sectionTitleOriginal` = ".$sectionTitleOriginal.", `modifyDate`=CURRENT_TIMESTAMP;";
  $result = $mysqli->query($myQueryText);
  echo "SQL:".$myQueryText;
  
}
 else { echo "Cannot save Site Settings across device/browser without being logged in.";
}
?> 