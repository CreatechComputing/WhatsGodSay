devVer="0.11 Adjusted makeAudioDataFilE to create GNT timing"

var siteControl = {
	doSave: true, showTitleBar: true, showFooter: true, 
	themeName: "DarkMode",
	// Mustard #bfaa20 Purple #AE0D7A   BrightBlue #CCE7F1 Forrest Green #065123
	themeDarkColor:"#065123", 
	themeSWColor:"Default",
	useDefaultSW:true,
		//  mid way between "#dfdfdf"
	activeWindow: 1,
	// activeWindow2: 2,
	activeWindowLanguage: "English",
	greekDisplay: 3,
	showGreekPhonics: true,
	showHebrew: true,
	showHebrewPhonics: true,
	fontSize: 19,
	fontFamily: "Arima",
	//MounceWD:0,DodsonWD:1,PerseusWD:2,VinesWD:3,StrongsWD:4,Abbott-Smith:5 
	wordDataOptions: "1111111111",
	//Option List Version:0, Section Titles:1,External Links:2,Verse Numbers:3, Verse Newline:4, Sentence Newline:5 (Eng only), 
	//Notes:6, Strongs:7, Lemma:8 (Study Only), Parsing:9 (Study Only), Gloss:10 (Greek Only)
	ReadingDefault: "A1100000000",
	StudyDefault: "A1010000000",
	//1=true, 0=false
	sectionTitleDefault: "BSB",   //use this version's section title for other versions 
	sectionTitleOriginal: false,  //true - use current version's section title/ false- use above default for all version's
	//sectionTitleIsLoaded: "true", //used when first loading the Section Title data to ensure it's not loaded twice.
	lastChanged:null,
	syncSettings:true,
	syncHistory:true,
	paramsURL:"",
	audioTypeAllowed:"SynthOnly",  //other values would be SynthPreferred, VoiceOnly, SynthOnly, None (maybe later do a "Random" option?) For SnynthPreferred The system would have to know when the Synth voice isn't available. 
	getDBSiteSettings: function(){
		//copy Site Setttings to Prev so that can compare if any differences with DB results (and change to DB setting if so).
		this.copyToPrevSettings();
		$.post("getSiteSettings.php", {},
			function (result) {
				console.log("got site SettingS results of "  + result);
				// let result4="";
				// let SWColor = [];
				let ss = [];
				ss = result.split("|");
				if (ss.length==14) {
					siteControl.showTitleBar=ss[0];
					siteControl.showFooter=ss[1];
					siteControl.themeName=ss[2];
					siteControl.themeDarkColor =ss[3];
					siteControl.themeSWColor=ss[4];
					siteControl.greekDisplay =ss[5];
					siteControl.fontSize =ss[6];
					siteControl.fontFamily=ss[7];
					siteControl.wordDataOptions=ss[8];
					console.log ("setting siteControl.audioTypeAllowed to " + ss[9]);
					siteControl.audioTypeAllowed=ss[9];
					siteControl.ReadingDefault=ss[10];
					siteControl.StudyDefault=ss[11] 
					siteControl.sectionTitleDefault=ss[12];
					siteControl.sectionTitleOriginal=ss[13];
					////console.log ("uploaded site Settings from DB");	
					siteControl.updateSiteSettings("prevSiteSettings","siteControl");
				}
				else {
					console.error ("site settings array of '" + ss + "' was a length of " + ss.length + " instead of 14 so not loading.")
				}
			}
		);
	},
	isBright: function (color,threshold) {
		//adjusted from https://awik.io/determine-color-bright-dark-using-javascript/
			// Variables for red, green, blue values
			var r, g, b, darkLevel;
			
			// Check the format of the color, HEX or RGB?
			if (color.match(/^rgb/)) {
		
				// If RGB --> store the red, green, blue values in separate variables
				color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
				
				r = color[1];
				g = color[2];
				b = color[3];
			} 
			else {
				
				// If hex --> Convert it to RGB: http://gist.github.com/983661
				color = +("0x" + color.slice(1).replace( 
				color.length < 5 && /./g, '$&$&'));
		
				r = color >> 16;
				g = color >> 8 & 255;
				b = color & 255;
			}
		 // equation from http://alienryderflex.com/darkLevel.html
		 darkLevel = Math.sqrt(
			0.299 * (r * r) +
			0.587 * (g * g) +
			0.114 * (b * b)
			);
		
		 ////console.log("light/dark number:" + darkLevel); 	
			// Using the HSP value, determine whether the color is light or dark
			//darkLevelThreshold was 127.5
			if (darkLevel>threshold) {
				return false;
			} 
			else {
				return true;
			}
		},
	updateSiteSettings: function(fromTxt,toTxt){
		let from=window[fromTxt];
		let to=window[toTxt];
		let k=0;
		let isChanged=false;

		if (from.showTitleBar!=to.showTitleBar) {
			//set to opposite because toggle will change
			to.showTitleBar=from.showTitleBar;
			this.toggleTitleBar();
			isChanged=true;
		}

		if (from.showFooter!=to.showFooter) { 
			//set to opposite because toggle will change
			to.showFooter=from.showFooter;
			this.toggleFooter();
			isChanged=true;
		}
		if ((from.themeName!=to.themeName) || (from.themeDarkColor !=to.themeDarkColor) || (from.themeSWColor != to.themeSWColor)) { 
			this.setTheme(to.themeName);
			isChanged=true;
		}

		if (from.greekDisplay != to.greekDisplay) { 
			this.setGreekDisplay(to.greekDisplay);
			isChanged=true;
		}
		if (from.fontSize != to.fontSize) {
			this.setFontSize(to.fontSize);
			isChanged=true;
		}
		if (from.fontFamily!= to.fontFamily) { 
			console.log("zq In siteControl.updageSiteSettings with different font");
			this.setFontFamily(to.fontFamily);
			isChanged=true;
		}
		if (from.wordDataOptions!= to.wordDataOptions) { 
			for (k = 0; k < 6; k++)
				siteControl.toggleGreekLexicon(k, false);
				isChanged=true;
		}
		if (from.audioTypeAllowed!= to.audioTypeAllowed) { 
			this.audioTypeAllowed=to.audioTypeAllowed;		
			isChanged=true;
		}

		if (from.ReadingDefault!= to.ReadingDefault) { 
			this.ReadingDefault=to.ReadingDefault;
			isChanged=true;
		}
		if (from.StudyDefault!= to.StudyDefault) {
			this.StudyDefault=to.StudyDefault;
			isChanged=true;
		} 
		if (from.sectionTitleDefault!= to.sectionTitleDefault) { 
			this.sectionTitleDefault= to.sectionTitleDefault;
			isChanged=true;		
		}
		if (from.sectionTitleOriginal!= to.sectionTitleOriginal) {
			this.sectionTitleOriginal= to.sectionTitleOriginal
			isChanged=true;
		}				

		if(isChanged==true)
			setLocalStorage();
	},

	createModeOptions: function (incre, resultsTo) { //called from RH.createRow
		let ModeOpt = "A";
		let setupMod = "";
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showSectionTitles);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showVideoBar);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showVerseNumbers);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].displayVerseNewLine);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].displaySentenceNewLine);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showTranslatorNotes);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showStrongs);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showLemma);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showParsing);
		////console.log("setup Mode Options Default- GLOSS:" + window["ScriptureWindow" + incre].showGloss);
		if (window["ScriptureWindow" + incre].showGloss == 10)
			ModeOpt = ModeOpt + "9";
		else
			ModeOpt = ModeOpt + window["ScriptureWindow" + incre].showGloss;

		if (resultsTo == "Default") {
			if (window["ScriptureWindow" + incre].setupMode == "Reading") {
				this.ReadingDefault = ModeOpt;
				setupMod = "Reading";
			}
			else {
				this.StudyDefault = ModeOpt;
				setupMod = "Study"
			}
			////console.log("ModeOpt:" + ModeOpt + " Reading:" + this.ReadingDefault + "  Study:" + this.StudyDefault);
			////console.log("widths of Read:" + this.ReadingDefault.length + " Study:" + this.StudyDefault.length);
			document.getElementById("modeOptionsBtn" + incre).style.display = "none";
			util.openModalBox("The Default was reset for " + setupMod + ".", "Set as New Default");
		}
		else
			return ModeOpt;
	},
	toggleTitleBar: function () {
		if (this.showTitleBar == false) {
			$('#siteTitleBar').show();
			document.getElementById("brdrDD").style.visibility="hidden";
			this.showTitleBar = true;
		}
		else {
			$('#siteTitleBar').hide();
			document.getElementById("brdrDD").style.visibility="visible";
			this.showTitleBar = false;
		}
		resizeWindows();
	},
	toggleFooter: function () {
		if (this.showFooter == false) {
			document.getElementById("SiteFooter").style.display = "block";
			document.getElementById("ftrDD").style.display = "none";
			this.showFooter = true;
			document.body.style.overflowY = "scroll";
		}
		else {
			document.getElementById('SiteHeading').scrollIntoView({ block: 'start', behavior: 'smooth' });			
			setTimeout('document.getElementById("SiteFooter").style.display="none";', 300);
			rootBody("smooth");


			var ftrDDexists = document.getElementById("ftrDD");
			if (ftrDDexists)
				document.getElementById("ftrDD").style.display = "inline";
			this.showFooter = false;

			document.body.style.overflowY = "hidden";

		}

	},
	setActiveWindowLanguage: function () {
		var ver = window["BibleRef" + siteControl.activeWindow].version;
		if (util.getVersionrow(ver) >= trackRead.englishVersionCount) {
			siteControl.activeWindowLanguage = "Greek";
			$(".GreekOnly").show();
			$(".EnglishOnly").hide();
		}
		else {
			siteControl.activeWindowLanguage = "English";
			$(".EnglishOnly").show();
			$(".GreekOnly").hide();
		}
	},
	copyToPrevSettings: function(){
		prevSiteSettings.showTitleBar=this.showTitleBar;
		prevSiteSettings.showFooter=this.showFooter;
		prevSiteSettings.themeName=this.themeName;
		prevSiteSettings.themeDarkColor =this.themeDarkColor; 
		prevSiteSettings.themeSWColor = this.themeSWColor;
		prevSiteSettings.greekDisplay = this.greekDisplay;
		prevSiteSettings.fontSize = this.fontSize;
		prevSiteSettings.fontFamily= this.fontFamily;
		prevSiteSettings.wordDataOptions= this.wordDataOptions;
		prevSiteSettings.audioTypeAllowed= this.audioTypeAllowed;
		prevSiteSettings.ReadingDefault= this.ReadingDefault;
		prevSiteSettings.StudyDefault= this.StudyDefault; 
		prevSiteSettings.sectionTitleDefault= this.sectionTitleDefault;
		prevSiteSettings.sectionTitleOriginal= this.sectionTitleOriginal;
	},
	openDialog: function () {
		document.getElementById('siteSettings').style.display = 'block';
		//copy Site Setttings to Prev so that can compare if any changes when Dialog closed (and save them to DB if so).
		this.copyToPrevSettings(); 	
	},
	closeSiteSettings: function () {

		document.getElementById('siteSettings').style.display = 'none';
		this.useDefaultSW=true;
		this.closeAllSubSettings();

		if (accountControl.isLoggedIntoWGS==false) //Not logged in CANNOT save to db
			return;

		if ((  //any value is changed then save to db
			prevSiteSettings.showTitleBar==this.showTitleBar &&
			prevSiteSettings.showFooter==this.showFooter &&
			prevSiteSettings.themeName==this.themeName &&
			prevSiteSettings.themeDarkColor ==this.themeDarkColor && 
			prevSiteSettings.themeSWColor == this.themeSWColor &&
			prevSiteSettings.greekDisplay == this.greekDisplay &&
			prevSiteSettings.fontSize == this.fontSize &&
			prevSiteSettings.fontFamily== this.fontFamily &&
			prevSiteSettings.wordDataOptions== this.wordDataOptions &&
			prevSiteSettings.audioTypeAllowed== this.audioTypeAllowed &&
			prevSiteSettings.ReadingDefault== this.ReadingDefault &&
			prevSiteSettings.StudyDefault== this.StudyDefault && 
			prevSiteSettings.sectionTitleDefault== this.sectionTitleDefault &&
			prevSiteSettings.sectionTitleOriginal== this.sectionTitleOriginal				
		) ==false)
				this.saveSiteSettingsToDB();
	},
	saveSiteSettingsToDB: function(){
		//define object variables to pass to post
		let showTitleBar=this.showTitleBar;
		let showFooter=this.showFooter;
		let themeName=this.themeName;
		let themeDarkColor =this.themeDarkColor; 
		let themeSWColor = this.themeSWColor;
		let greekDisplay = this.greekDisplay;
		let fontSize = this.fontSize;
		let fontFamily= this.fontFamily;
		let wordDataOptions= this.wordDataOptions;
		let audioTypeAllowed= this.audioTypeAllowed;
		let ReadingDefault= this.ReadingDefault;
		let StudyDefault= this.StudyDefault; 
		let sectionTitleDefault= this.sectionTitleDefault;
		let sectionTitleOriginal= this.sectionTitleOriginal;

		$.post("saveSiteControlSettings.php", {
			showTitleBar:showTitleBar,
			showFooter: showFooter,
			themeName:themeName,
			themeDarkColor:themeDarkColor, 
			themeSWColor:themeSWColor,
			greekDisplay:greekDisplay,
			fontSize:fontSize,
			fontFamily:fontFamily,
			wordDataOptions:wordDataOptions,
			audioTypeAllowed:audioTypeAllowed,
			ReadingDefault: ReadingDefault,
			StudyDefault: StudyDefault, 
			sectionTitleDefault: sectionTitleDefault,
			sectionTitleOriginal:sectionTitleOriginal  
		},
		function (result) {
	 		////console.log("Save Site Settings to DB:" + result);
		} 
		);
	},

	closeSubSettings: function (sub) {
		document.getElementById('siteSettings' + sub + 'DD').style.display = 'none';
		document.getElementById("siteSettings" + sub).style.color = "var(--txt1)";
		document.getElementById("siteSettings" + sub).style.backgroundColor = "var(--bg1)";
		document.getElementById('siteSettings' + sub + 'Right').style.display = 'none';
		document.getElementById('siteSettings' + sub + 'Left').style.display = 'inline';
	},
	closeAllSubSettings: function () {
		this.closeSubSettings("Theme");
		this.closeSubSettings("Font");
		this.closeSubSettings("Greek");
		this.closeSubSettings("Audio");
	},
	closeAllSubSettingsExcept: function (sub) {
		if (sub!="Theme")
			this.closeSubSettings("Theme");
		if (sub!="Font")
			this.closeSubSettings("Font");
		if (sub!="Greek")
			this.closeSubSettings("Greek");
		if (sub!="Audio")
			this.closeSubSettings("Audio");			
	},
	openWindow: function () {
		//	document.getElementById('msgboxbackground').style.display='block';
		document.getElementById('siteWindows').style.display = 'block';
	},
	getForum: function () {
		if (accountControl.isLoggedIntoWGS === false) {
			util.openModalBox("If you wish to use the Forum, please log in.<br> To log in select the account button (<button class='smallBtn fa fa-users'></button>) in the top right hand corner.", "Requires a Log In");
			return;
		}
		if (document.getElementById("ForumDiv").style.display == "none") {
			document.getElementById("ForumDiv").style.display = "block";
			document.getElementById("Scripture" + this.activeWindow).style.width = "45vw";
			document.getElementById("ScriptureDiv" + this.activeWindow).style.width = "48vw";
			document.getElementById("ScriptureHeader" + this.activeWindow).style.width = "48vw";
			document.getElementById("VideoBar" + this.activeWindow).style.width = "48vw";
			document.getElementById("ScriptureFooter" + this.activeWindow).style.width = "48vw";
		}
		else {
			document.getElementById("ForumDiv").style.display = "none";
			document.getElementById("ScriptureDiv" + this.activeWindow).style.width = "98%";
			document.getElementById("Scripture" + this.activeWindow).style.width = "95vw";
			document.getElementById("ScriptureHeader" + this.activeWindow).style.width = "98vw";
			document.getElementById("VideoBar" + this.activeWindow).style.width = "98vw";
			document.getElementById("ScriptureFooter" + this.activeWindow).style.width = "98vw";

		}
	},
	setDarkThemeColor: function(whichOne){
		if (whichOne=="Default") {
			siteControl.themeDarkColor='#065123';
			document.getElementById("DarkThemeColor").value='#065123';
		}
		else {
			this.themeDarkColor=document.getElementById("DarkThemeColor").value;
		}	

		this.setTheme("DarkMode");
	},
	setTheme: function(themeNam) {
		let isItBright=false;
		let html = document.getElementsByTagName('html')[0];
		//color-1: used in top Whats God Say and its option's dropdowns, History
		//color-2 : Ver/SW settings; and all popup windows header/footer; site footer; text also used for "Whats God say" brdr
		//color-3: All popup windows main part
		//color-4: SW Header/Footer
		//SW: SW Body, External Links, and Reference  (should also replace other black/white hard codes.)	
		//SWMark: highlighted SW text.
		//btn & btn-hover - button and selected buttons - used on all 4 color backgrounds!
		//border - most all borders
		//scroll: scroll bar
		siteControl.themeName=themeNam;
		////console.log("theme:" + siteControl.themeName + "  SW Color setting:" + siteControl.themeSWColor);

		if (themeNam == "Blue-Green") {
			html.style.setProperty("--bg1", "#36486b");
			html.style.setProperty("--txt1", "white");   

			html.style.setProperty("--bg2", "#618685");
			html.style.setProperty("--txt2", "white");
			
			html.style.setProperty("--bg3", "#36486b");
			html.style.setProperty("--txt3", "white");   
			
			html.style.setProperty("--bg4", "#709594");
			html.style.setProperty("--txt4", "white");

			html.style.setProperty("--bgbtn", "#36486b");  
			html.style.setProperty("--txtbtn", "#fefbd8");
			
			html.style.setProperty("--bgbtn-hover", "#fefbd8"); 
			html.style.setProperty("--txtbtn-hover", "#36486b");
			
			if (siteControl.themeSWColor=="LightOnDark") {
				html.style.setProperty("--txtSW", "white" );
				html.style.setProperty("--bgSW","black");
				html.style.setProperty("--bgSWMark","blue");   
			}
			else {  //is default
				html.style.setProperty("--bgSW", "white" );
				html.style.setProperty("--txtSW","black");  
				html.style.setProperty("--bgSWMark","lightblue");  
			}
			
			html.style.setProperty("--brdr", "black");


			html.style.setProperty("--bgScr", "#709594" );
			html.style.setProperty("--thmbScr","white" );

			html.style.setProperty("--danger","red" );


			this.themeSetGradient("bottom right","bg4","bgSW");
		}
		else if (themeNam == "Rustic"){
			html.style.setProperty("--bg1", "#625750");
			html.style.setProperty("--txt1", "#e0e2e4");   

			html.style.setProperty("--bg2", "#c6bcb6");
			html.style.setProperty("--txt2", "black");
			
			html.style.setProperty("--bg3", "#96897f");
			html.style.setProperty("--txt3", "#e0e2e4");   
			
			html.style.setProperty("--bg4", "#c6bcb6");
			html.style.setProperty("--txt4", "#625750");

			html.style.setProperty("--bgbtn", "#625750");  
			html.style.setProperty("--txtbtn", "#e0e2e4");
			
			html.style.setProperty("--bgbtn-hover", "#e0e2e4"); 
			html.style.setProperty("--txtbtn-hover", "#625750");

			if (siteControl.themeSWColor=="LightOnDark") {
				html.style.setProperty("--txtSW", "#e0e2e4" );
				html.style.setProperty("--bgSW","black");  
				html.style.setProperty("--bgSWMark","blue"); 
				html.style.setProperty("--txt4", "black");
			}	
			else {  //is default
				html.style.setProperty("--bgSW", "#e0e2e4" );
				html.style.setProperty("--txtSW","black"); 
				html.style.setProperty("--bgSWMark","lightblue"); //gold 
			}
			
			html.style.setProperty("--brdr", "#492c28");

			html.style.setProperty("--bgScr", "#625750" );
			html.style.setProperty("--thmbScr","#e0e2e4" );

			html.style.setProperty("--danger","black" );

			this.themeSetGradient("bottom right","bg4","bgSW");
		}
		else if (themeNam == "Peachy"){  //was c94c4c (bright peach) =   new b64949 (subdued burnt orange)
			html.style.setProperty("--bg1", "#da936b"); //dec-201,76, 76
			html.style.setProperty("--txt1", "#7a2f04");   

			html.style.setProperty("--bg2", "#8d3a0a");
			html.style.setProperty("--txt2", "#f7ece6");
			
			html.style.setProperty("--bg3", "#df986f");
			html.style.setProperty("--txt3", "#884721");   
			
			html.style.setProperty("--bg4", "#d85509");
			html.style.setProperty("--txt4", "#d8a589");

			html.style.setProperty("--bgbtn-hover", "#532002");  
			html.style.setProperty("--txtbtn-hover", "#f77326");
			
			html.style.setProperty("--bgbtn", "#f77326"); 
			html.style.setProperty("--txtbtn", "#532002");

			if (siteControl.themeSWColor=="DarkOnLight") {
				html.style.setProperty("--bgSW", "#fcebe1" );
				html.style.setProperty("--txtSW","#220d01");  
				html.style.setProperty("--bgSWMark","lightblue");//#fc8106
				html.style.setProperty("--txt4", "#5e4131");
			}		
			else {  //is default
				html.style.setProperty("--txtSW", "#fcebe1" );
				html.style.setProperty("--bgSW","#220d01"); 
				html.style.setProperty("--bgSWMark","blue"); //#2c2b2a	 
			}
			
			html.style.setProperty("--brdr", "#160c06");

			html.style.setProperty("--bgScr", "#2b1001" );
			html.style.setProperty("--thmbScr", "#ee9d6e");

			html.style.setProperty("--danger","#e74c1d" );

			this.themeSetGradient("bottom right","bg4","bgSW");

		}		
		else { //DarkTheme is default
			isItBright=this.isBright(siteControl.themeDarkColor,180);
//			siteControl.themeName = "DarkMode";
			html.style.setProperty("--bg1", "#0d0d0f");
			html.style.setProperty("--txt1", "#d4d4db");

			html.style.setProperty("--bg2", "#191919");
			if (isItBright==true)
				html.style.setProperty("--txt2","#d4d4db"); 
			else 
				html.style.setProperty("--txt2", siteControl.themeDarkColor); 
				
			html.style.setProperty("--bg3", "#2d2d30");
			html.style.setProperty("--txt3", "white"); 
			

			html.style.setProperty("--bg4", siteControl.themeDarkColor);	
			if (isItBright==true)
				html.style.setProperty("--txt4","#d4d4db"); 
			else
				html.style.setProperty("--txt4", '#0d0d0d');

			html.style.setProperty("--bgbtn", "#0d0d0f");  
			html.style.setProperty("--bgbtn-hover", siteControl.themeDarkColor);
			if (isItBright==true)
				html.style.setProperty("--txtbtn-hover","#d4d4db"); 
			else
				html.style.setProperty("--txtbtn-hover", '#0d0d0d');
		
			html.style.setProperty("--txtbtn", "white");
			if (siteControl.themeSWColor=="DarkOnLight") {
				html.style.setProperty("--bgSW",'#dfdfdf' );
				html.style.setProperty("--txtSW",'#0d0d0d'); 
				html.style.setProperty("--bgSWMark","lightblue"); //gold 			 
			} 
			else {
				html.style.setProperty("--bgSW",'#0d0d0d');  
				html.style.setProperty("--txtSW",'#dfdfdf' );
				html.style.setProperty("--bgSWMark","blue"); //darkgoldenrod	
			}
			html.style.setProperty("--brdr", "white");

			html.style.setProperty("--bgScr", "#2d2d30" );
			html.style.setProperty("--thmbScr", siteControl.themeDarkColor);

			html.style.setProperty("--danger","red" );

			this.themeSetGradient("bottom right","bg4","bgSW");
		}

	this.themeSetDD(themeNam);

	},
	themeSetGradient: function(directn,varFrom, varTo){  
		if (document.getElementById("ScriptureFooter" + siteControl.activeWindow) != null){
			document.getElementById("ScriptureHeader" + siteControl.activeWindow).style.backgroundImage="linear-gradient(to " + directn + ", var(--" + varFrom + "),var(--" + varTo + "))";
			//if (directn=="bottom")
			//	directn="top";
			document.getElementById("ScriptureFooter" + siteControl.activeWindow).style.backgroundImage="linear-gradient(to " + directn + ", var(--" + varTo + "),var(--" + varFrom + "))";
		}
		else 
		 	setTimeout(siteControl.themeSetGradient,400,directn,varFrom,varTo);

	},
	themeSetDD: function(themeNam){
		let i=1;
		//When Theme are Creatable objects		let myThemeArr=[];

		//SetTheme is called before document if done so check if last Theme HTML element exists
		if (document.getElementById("DarkThemeColorDefault")!=null){

			//set all the themeSWColor buttons to not highlighted
			for (i=1; i<4; i++) {
			document.getElementById("siteThemeSWBtn" + i).style.backgroundColor = "var(--bgbtn)";
			document.getElementById("siteThemeSWBtn" + i).style.color = "var(--txtbtn)";
			}
			
			i=3;  //Default is default
			if (siteControl.themeSWColor=="DarkOnLight")
				i=1;
			else if (siteControl.themeSWColor=="LightOnDark")	
				i=2;

			document.getElementById("siteThemeSWBtn" + i).style.backgroundColor = "var(--bgbtn-hover)";
			document.getElementById("siteThemeSWBtn" + i).style.color = "var(--txtbtn-hover)";

			//set all the Theme buttons to not highlighted
			i=1;
			while (i<100){  //will break when it runs out of buttons which should be long before that... but just in case.
				if (document.getElementById("siteThemeBtn" + i)!=null){
					document.getElementById("siteThemeBtn" + i).style.backgroundColor = "var(--bgbtn)";
					document.getElementById("siteThemeBtn" + i).style.color = "var(--txtbtn)";
					//When Theme are Creatable objects				myThemeArr.push(document.getElementById("siteThemeBtn" + i).innerHTML.replace(" ",""))
				}
				else 
					break;
				i++;	
			}	




			//show pick a color and set Darktheme button here 
				if (themeNam=="DarkMode"){	
					//show Pick a Darkmode color
					document.getElementById("DarkThemeColorHr").style.display="block";
					document.getElementById("DarkThemeColorDiv").style.display="block";
					//highlight button
					document.getElementById("siteThemeBtn1").style.backgroundColor = "var(--bgbtn-hover)";
					document.getElementById("siteThemeBtn1").style.color = "var(--txtbtn-hover)";
				}
				else { //not DarkMode so hide pick a color
					document.getElementById("DarkThemeColorHr").style.display="none";
					document.getElementById("DarkThemeColorDiv").style.display="none";
				}
			
			if (themeNam=="Blue-Green"){
				document.getElementById("siteThemeBtn2").style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById("siteThemeBtn2").style.color = "var(--txtbtn-hover)";
			}

			if (themeNam=="Rustic"){
				document.getElementById("siteThemeBtn3").style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById("siteThemeBtn3").style.color = "var(--txtbtn-hover)";
			}
			if (themeNam=="Peachy"){
				document.getElementById("siteThemeBtn4").style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById("siteThemeBtn4").style.color = "var(--txtbtn-hover)";
			}

		}
		else { //HTML element not exists so try again
			setTimeout(siteControl.themeSetDD,400,themeNam);
		}


	},
	toggleSiteSettingsThemeDD: function () {
		this.closeAllSubSettingsExcept("Theme");
		if (document.getElementById("siteSettingsThemeDD").style.display == "block") {
			this.closeSubSettings("Theme");
		}
		else {
			document.getElementById("siteSettingsThemeDD").style.top = "0.25em"; 
			document.getElementById("siteSettingsThemeDD").style.display = "block";

			document.getElementById('siteSettingsThemeRight').style.display = 'inline';
			document.getElementById('siteSettingsThemeLeft').style.display = 'none';

			document.getElementById("siteSettingsTheme").style.color = "var(--bg1)";
			document.getElementById("siteSettingsTheme").style.backgroundColor = "var(--txt1)";
		}
	},
	toggleSiteSettingsFontDD: function () {
		this.closeAllSubSettingsExcept("Font");
		if (document.getElementById("siteSettingsFontDD").style.display == "block") {
			this.closeSubSettings("Font");
		}
		else {
			document.getElementById("siteSettingsFontDD").style.top = "0.25em";
			document.getElementById("siteSettingsFontDD").style.display = "block";

			document.getElementById('siteSettingsFontRight').style.display = 'inline';
			document.getElementById('siteSettingsFontLeft').style.display = 'none';

			document.getElementById("siteSettingsFont").style.color = "var(--bg1)";
			document.getElementById("siteSettingsFont").style.backgroundColor = "var(--txt1)";
		}
	},
	setFontCase: function(fontCase){
		document.getElementsByTagName("body")[0].style.textTransform = fontCase;
		document.getElementById("fontCaseDiv").style.textTransform= "none";
	},
	setFontFamily: function (fontName,fontNum=0) {
		//change Body, Input, and Buttons to new font
		document.getElementsByTagName("body")[0].style.fontFamily = fontName;
		$("input").css({ "fontFamily": fontName });
		$("button").css({ "fontFamily": fontName });
		this.fontFamily = fontName;
		
		if (fontNum==0)
			switch(fontName) {
				case 'Didact Gothic':
					fontNum=1; break;
				case 'Ubunto':
					fontNum=2; break;
				case 'Cardo':
					fontNum=3; break;
				case 'EB Garamond':
					fontNum=4; break;
				case 'Arima':
					fontNum=5; break;
				case 'Confortaa':
					fontNum=6; break;
				case 'Mynerve':
					fontNum=7; break;
				case 'Dancing Script':
					fontNum=8; break;
				case 'Fira Mono':
					fontNum=9; break;
				// case '':
				// 	fontNum=; break;

				}		  

		//highlight selected button & unhighlight all others		
		for (let i = 1; i <=9; i++)
			if (i == fontNum) {
				document.getElementById('siteFontBtn' + i).style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById('siteFontBtn' + i).style.color = "var(--txtbtn-hover)";
			}
			else {
				document.getElementById('siteFontBtn' + i).style.backgroundColor = "var(--bgbtn)";
				document.getElementById('siteFontBtn' + i).style.color = "var(--txtbtn)";
			}
	},
	setFontSize: function(myFontSize) {
		var i = 0;
		if (typeof window["BibleRef" + siteControl.activeWindow] != "undefined") {
			window["BibleRef" + siteControl.activeWindow].ScrollToId = get1stVerseInViewport(siteControl.activeWindow, window["BibleRef" + siteControl.activeWindow].version);
		}
		document.getElementsByTagName("HTML")[0].style.fontSize = myFontSize + "px";
		$("input").css({ "fontSize": myFontSize });
		$("button").css({ "fontSize": myFontSize });
		this.fontSize = myFontSize;
		if (typeof window["BibleRef" + siteControl.activeWindow] != "undefined") {
			document.getElementById(window["BibleRef" + siteControl.activeWindow].version + window["BibleRef" + siteControl.activeWindow].ScrollToId).scrollIntoView();
		}
		// document.getElementById('enterVerse1').style.fontSize=myFontSize + "px";
		for (i = 13; i < 26; i = i + 3) {
			// if (i == 28)
			// 	i = 33;

			if (i == myFontSize) {
				document.getElementById('siteFontSizeBtn' + i).style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById('siteFontSizeBtn' + i).style.color = "var(--txtbtn-hover)";
			}
			else {
				document.getElementById('siteFontSizeBtn' + i).style.backgroundColor = "var(--bgbtn)";
				document.getElementById('siteFontSizeBtn' + i).style.color = "var(--txtbtn)";
			}
		}
		//fix problem of H bar toggling on or off
		if (typeof window["ScriptureWindow" + this.activeWindow] != "undefined")
		window["ScriptureWindow" + this.activeWindow].setScriptureHeight();

		//ensure top border is fully visible
		document.getElementById('SiteHeading').scrollIntoView();
		rootBody("auto");
	},
	toggleSiteSettingsGreekDD: function () {
		this.closeAllSubSettingsExcept("Greek");
		if (document.getElementById("siteSettingsGreekDD").style.display == "block") {
			this.closeSubSettings("Greek");
			console.log ("In GreekDD close display as block");
		}
		else {
			console.log ("In GreekDD display as block");
			document.getElementById("siteSettingsGreekDD").style.display = "block";

			document.getElementById('siteSettingsGreekRight').style.display = 'inline';
			document.getElementById('siteSettingsGreekLeft').style.display = 'none';

			document.getElementById("siteSettingsGreek").style.color = "var(--bg1)";
			document.getElementById("siteSettingsGreek").style.backgroundColor = "var(--txt1)";
		}
	},
	setGreekDisplay: function (lvl) {
		var i;
		//set drop down button
		for (i = 1; i < 5; i++)
			if (i == lvl) {
				document.getElementById('siteGreekBtn' + i).style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById('siteGreekBtn' + i).style.color = "var(--txtbtn-hover)";
			}
			else {
				document.getElementById('siteGreekBtn' + i).style.backgroundColor = "var(--bgbtn)";
				document.getElementById('siteGreekBtn' + i).style.color = "var(--txtbtn)";
			}

		//set variable used in setGreekText()
		if (this.greekDisplay == lvl)
			return;

		this.greekDisplay = lvl;
		uncoverGodsWord.processScriptureData(this.activeWindow,true);
	},
	toggleGreekLexicon: function (lvl, changedByUser) {
		//change value for changedByUser
		if (changedByUser == true)
			if (this.wordDataOptions[lvl] == "1") { //the value at lvl has showing this Lexicon turned on. So turn it off.
				console.log("Change by User==true; lvl=" + lvl + "; this.wordDataOptions before:" + this.wordDataOptions);
				this.wordDataOptions = this.wordDataOptions.substr(0, lvl) + "0" + this.wordDataOptions.substr(lvl + 1, 5 - lvl) + this.wordDataOptions.substring(6);
				console.log("Change by User==true; lvl=" + lvl + "; this.wordDataOptions after:" + this.wordDataOptions);
			}
			else { //the value at lvl has showing this Lexicon turned off. So turn it on.
				console.log("Change by User==false; lvl=" + lvl + "; this.wordDataOptions before:" + this.wordDataOptions);
				this.wordDataOptions = this.wordDataOptions.substr(0, lvl) + "1" + this.wordDataOptions.substr(lvl + 1, 5 - lvl) + this.wordDataOptions.substring(6);
				console.log("Change by User==false; lvl=" + lvl + "; this.wordDataOptions before:" + this.wordDataOptions);
			}

		//toggle drop down button
		if (this.wordDataOptions[lvl] == "1") {
			document.getElementById('siteLexiconBtn' + lvl).style.backgroundColor = "var(--bgbtn-hover)";
			document.getElementById('siteLexiconBtn' + lvl).style.color = "var(--txtbtn-hover)";
		}
		else {
			document.getElementById('siteLexiconBtn' + lvl).style.backgroundColor = "var(--bgbtn)";
			document.getElementById('siteLexiconBtn' + lvl).style.color = "var(--txtbtn)";
		}
	},
	toggleSiteSettingsAudioDD: function () {
		this.closeAllSubSettingsExcept("Audio");
		if (document.getElementById("siteSettingsAudioDD").style.display == "block") {
			this.closeSubSettings("Audio");
			console.log ("In AudioDD close display as block");
		}
		else {
			console.log ("In AudioDD display as block");
			document.getElementById("siteSettingsAudioDD").style.display = "block";
			document.getElementById('siteSettingsAudioRight').style.display = 'inline';
			document.getElementById('siteSettingsAudioLeft').style.display = 'none';
			document.getElementById("siteSettingsAudio").style.color = "var(--bg1)";
			document.getElementById("siteSettingsAudio").style.backgroundColor = "var(--txt1)";
		}
	},
	setVoiceType: function(typeEntered){
		this.audioTypeAllowed=typeEntered;
		//window["voiceControl1"].startAudioFileProcess("WEB",window["BibleRef1"].refFromTo);
		window["VoiceControl" + this.activeWindow].startAudioFileProcess(window["BibleRef" + this.activeWindow].version,window["BibleRef" + this.activeWindow].refFromTo);
	}
} //end object siteControl

//apply Theme colors
 {
if ("siteControlthemeName" in localStorage) {
	siteControl.themeName = localStorage.getItem("siteControlthemeName");
}
if ("siteControlthemeDarkColor" in localStorage) {
	siteControl.themeDarkColor = localStorage.getItem("siteControlthemeDarkColor");
}
if ("siteControlthemeSWColor" in localStorage) {
	siteControl.themeSWColor = localStorage.getItem("siteControlthemeSWColor");
}
siteControl.setTheme(siteControl.themeName);
}

//Previous Site Settings before possible changes
var prevSiteSettings = {
	showTitleBar: false, 
	showFooter: false, 
	themeName: "DarkMode",
	themeDarkColor:"#065123",
	themeSWColor:"Default",
	activeWindow: 1,
	greekDisplay: 3,
	fontSize: 19,
	fontFamily: "",
	//MounceWD:0,DodsonWD:1,PerseusWD:2,VinesWD:3,StrongsWD:4,Abbott-Smith:5, 
	wordDataOptions: "",
	audioTypeAllowed: "",
	//Option List Version:0, Section Titles:1,External Links:2,Verse Numbers:3, Verse Newline:4, Sentence Newline:5 (Eng only), 
	//Notes:6, Strongs:7, Lemma:8 (Study Only), Parsing:9 (Study Only), Gloss:10 (Greek Only)
	ReadingDefault: "",
	StudyDefault: "",
	sectionTitleDefault: "",   //use this version's section title for other versions 
	sectionTitleOriginal: false  //true - use current version's section title/ false- use above default for all version's
}

var modalBoxControl={
	functionTrue:"",
	functionFalse:"",
	processResponse: function(response){
		let fncArr=[];
		//console.log("In processResponse response:" + response);
		//close modal box
		document.getElementById('modalBox').style.display='none';
		document.getElementById('modalbackground').style.display='none';

		if (modalBoxControl.functionTrue=="" && modalBoxControl.functionFalse=="")
			return;

		if (response==true){
			fncArr=this.functionTrue.split(".");
		}	
		else{	
			fncArr=this.functionFalse.split(".");
		}
		if (fncArr.length==1) 
			window[fncArr[0]]();
		else if (fncArr.length==2)
			window[fncArr[0]][fncArr[1]]();
		else if (fncArr.length==3)
			window[fncArr[0]][fncArr[1]][fncArr[2]]();
		else	
			console.error("Cannot handle function with more than three parts ");	

		modalBoxControl.functionTrue="";
		modalBoxControl.functionFalse="";
	}	
}

var RH={  //Reference History	
	//set Arr columns
	iRHRandomId:0,iRHId:1, iMode:2,iSettings:3,iTopic:4,
	iRefText:5,iRefList:6,iCreateDate:7,iLastModifiedDate:8,
	iLastUsed:9,
	iVersion:10,iScrollToID:11,iAudioTimer:12,iAudioFile:13,
	iRHSet:14,
	ColCnt:15, 
	Arr: [],
	FirstNum: "000", //contains 3 digit number "001" to "999"
	LastNum: "000",  //contains 3 digit number "001" to "999"
	CurNum: "000",   //contains 3 digit number "001" to "999"
	DeleteNum:"",
	ToDBDate: 0,
	fromDBDate: 0,
	HistoryBarOpen:false,
	openSidebar: function() {
		//don't run whenever an already open SideBar is clicked
		let myHeight=document.getElementById("HistoryBar").offsetHeight;

		document.getElementById("HistoryBar").style.width = "250px";
		document.getElementById("HistoryBarClose").style.display = "block";
		document.getElementById("HistoryBarHeader").style.display = "block";
		document.getElementById("HistoryBarFooter").style.display = "block";

				
	
		myHeight=myHeight - document.getElementById("HistoryBarHeader").offsetHeight  - document.getElementById("HistoryBarFooter").offsetHeight;
		////console.log("History Bar Height:" + document.getElementById("HistoryBar").offsetHeight + " Main:" + myHeight);

		document.getElementById("HistoryBarMain").style.height = myHeight + "px";
		
		document.getElementById("HistoryBar").style.borderRight= "1px solid var(--brdr)";			
		document.getElementById("HistoryBar").style.borderTop= "1px solid var(--brdr)";			

		document.getElementById("HBClosedText").style.display = "none";
		document.getElementById("HistoryBarMain").style.display="block";
		this.HistoryBarOpen=true;
		

	},
	closeSideBarSetHistoryOpen: function(){
		RH.HistoryBarOpen=false;
	},
	closeSidebar: function() {
        setTimeout(RH.closeSideBarSetHistoryOpen,1000);   
		document.getElementById("HistoryBar").style.width = "1em";
		document.getElementById("HistoryBar").style.borderRight= "";
		document.getElementById("HistoryBar").style.borderTop= "";
		document.getElementById("HistoryBarClose").style.display = "none";
		document.getElementById("HistoryBarHeader").style.display = "none";
		document.getElementById("HistoryBarFooter").style.display = "none";
		document.getElementById("HBClosedText").style.display = "block";
		document.getElementById("HistoryBarMain").style.display="none";
	},
	createRow: function(incre, RHId, rndmId){
		let rh = "";
		let modeText="";
		let br = window["BibleRef" + incre];
		let vc=	window["VoiceControl"+incre];

		if (rndmId=="") //Add New so created the rndmId
			rndmId=Math.random().toString(36).substring(2, 15);
		


		//**Compile RefHist content 	
		if (window["ScriptureWindow" + incre].setupMode == "Reading")
			modeText ="R0";
		else
			modeText ="S0";
		rh = rndmId + "~" + RHId + "~" + modeText + "~" + siteControl.createModeOptions(incre, "RefHist") + "~" + br.topic + "~" + br.refText +  "~" + br.refList +  "~" +  br.createDate + "~" +  br.modifyDate + "~" + br.lastUsedDate + "~" + br.version + "~" + br.ScrollToId + "~";
		rh = rh + vc.currentTime + "~" + vc.timingFile  + "~" + "General";
		////console.log("vc.currentTime:" + vc.currentTime + "  audio filename:" + vc.timingFile);
		return rh;
	},
	addToRH: function(incre) { //This is called from a Change in Bible Reference (not version or other settings)
		////console.log("Nums  First:" + RH.FirstNum + " Last:" + RH.LastNum +  " Current:" + RH.CurNum);
		let i=0;
		let Cols=[];
		let br = window["BibleRef" + incre];

		if (br.isRefValid == false) { //reference not valid do not save.
			////console.log("The reference '" + refText + "' is not valid- not adding to history.")
			return;
		}

		//Create new Nums
		RH.LastNum=RH.LastNum.replace("RH","");
		RH.LastNum=util.padNum(Number(RH.LastNum) + 1, 3);
		RH.setCurNum(RH.LastNum);
		
		//stop if not a number
		if (RH.CurNum=="NaN"){
			////console.log ("The  number isn't correct - not adding to history");
			return;
		}
		
		//stop if RH.CurNum is not right length
		if (RH.CurNum.length!=3){
			console.error("The RH.CurNum of " + RH.CurNum + " is not the proper 3 digits - exiting addToRH");
			return;
		}

		//update br for new record
		br.RHNum=RH.CurNum;
		br.createDate= Date.now();
		br.modifyDate=br.createDate;
		br.lastUsedDate=br.createDate;

		//get RH set
		rh=RH.createRow(incre,"RH" + RH.CurNum, "");   

		//**Add RefHist to LocalStorage 
		window.localStorage.setItem("RH" + RH.CurNum, rh);
		window.localStorage.setItem("RHLastNum", RH.CurNum);
		window.localStorage.setItem("RHCurNum", RH.CurNum);
		
		//enter RefHist Array variables.
		Cols=rh.split("~");
		RH.Arr.unshift(new Array(Cols.length));	
		for (i=0;i<Cols.length;i++)
			RH.Arr[0][i]=Cols[i];
		 
		RH.loadSideBar();
	}, //end addRefHist
	askDeleteFromRH: function(RHId){
		modalBoxControl.functionTrue="";
		modalBoxControl.functionFalse="";

		////console.log("In askDeleteFromRH");
		if (RH.Arr.length==1){
			util.openModalBox("The system needs at least one reference to function.", "Error: cannot delete the last reference","Cancel");
			return;
		}		

		this.DeleteNum=RHId.replace("RH","");
		modalBoxControl.functionTrue="RH.trueDeleteFromRH";
		modalBoxControl.functionFalse="RH.falseDeleteFromRH";
		util.openModalBox("Are you sure to want to Delete this Reference History?","Delete History","Yes/No");
	},
	falseDeleteFromRH: function(){
		////console.log("In falseDeleteFromRH");
		this.DeleteNum="";
	},
	trueDeleteFromRH: function(){
		////console.log("In trueDeleteFromRH");
		let RHNum=this.DeleteNum;
		this.DeleteNum="";
		let RHId="RH" + RHNum;

		let i=-1;
		let j=0;
		let topNum=-1;
		i=this.findRow(this.iRHId,RHId);

		if (i>-1){ //Exists so delete
		//change RH Nums is includes RH being deleleted
			if (RH.LastNum==RHNum){
				for (j=0;j<RH.Arr.length;j++)
					if (j!=i && topNum<Number(RH.Arr[j][RH.iRHId].replace("RH","")))
						topNum=Number(RH.Arr[j][RH.iRHId].replace("RH",""));
				RH.LastNum=util.padNum(topNum,3);	
			}	
			if(RH.CurNum==RHNum)
					RH.CurNum=RH.LastNum;
			//set localStorage Delete Marker
			localStorage.setItem("DeleteRH", localStorage.getItem("DeleteRH") + "^" + RH.Arr[i][this.iRHRandomId]+ "~" +  Date.now());
		//remove Arr row
			RH.Arr.splice(i,1);
		//delete localStorage 
			localStorage.removeItem(RHId);
		}	
		//reload Side Bar
		this.loadSideBar();
	},
	setCurNum: function(Num){
		if (Num.length==3 && Number(Num)!="NaN")
			RH.CurNum=Num;
		else	
			console.warn("set RH Current Number failed for a value of :" + Num);
	},
	updateRHRow: function(incre,Num){
			let br = window["BibleRef" + incre];
			let i=-1;
			let Cols=[];
			let j=0;
			let modified=false;
			let scrollGuessId="";

			if (br.isRefValid == false) { //STOP- reference not valid.
				////console.log("The reference '" + br.refText + "' is not valid- not adding to history.")
				return;
			}

			Num=Num.replace("RH","");

			if (Num=="NaN"){//STOP - not a number
				////console.log ("The  number isn't correct - not adding to history");
				return;
			}

			if (Num.length!=3){
				console.error("The RH.CurNum of " + RH.CurNum + " is not the proper 3 digits - exiting updateRHRow");
				return;
			}
	
			if (br.RHNum!=Num){ //STOP - trying to update the RHNum not currently in BibleRef
				return;
			}

			scrollGuessId=get1stVerseInViewport(incre, br.version);
			if (scrollGuessId!="")
				br.ScrollToId = scrollGuessId;
			////console.log(" In updateRHRow. New ScrollToId Guess:" + scrollGuessId + " so ScrollToId is:" + br.ScrollToId);
	
			// only update the single RHArr row.
			i=RH.findRow(RH.iRHId,"RH" + Num);
			
			//get  fresh creation of RH set - just keep the randomId.
			rh=RH.createRow(incre,"RH" + Num, RH.Arr[i][this.iRHRandomId]);   

			//**Add RefHist to LocalStorage 
			window.localStorage.setItem("RH" + Num, rh);

			if (i>-1) { //found row
				Cols=rh.split("~");
				for (j=0;j<Cols.length;j++)
					if (RH.Arr[i][j]!=Cols[j]) {
						RH.Arr[i][j]=Cols[j];
						if (j==RH.iLastUsed)
							continue;
						modified=true; 
					}	
			}
			if (modified==true){ 	
				RH.Arr[i][RH.iLastModifiedDate]=Date.now();
				//Overwrite RefHist to LocalStorage.
				window.localStorage.setItem("RH" + Num, rh);		
			}

	},
	updateRHArrCol: function(Num,Row,Col,Val){

		if (RH.Arr[Row][iRHId]=="RH" + Num)
			RH.Arr[Row][Col]=Val;			
	},
	load2Arr: function(){
		let i=0;
		let j=Number(this.LastNum);
		let k=0;
		let Id="RH000";
		let aRow="";
		let Cols="";
		let IdArr=[];
		RH.Arr=[]; //clears it out
		// let newBtn;
		// let sideBarTitle="";

		//get array of Ids
		////console.log("load2Arr LastNum for Arr count:" + this.LastNum);
		for(i=j;i>=0;i--) {
			Id="RH" + util.padNum(i,3);
			if (Id in localStorage)   //Exists so add to array
				IdArr.push(Id)	
		}

		j=IdArr.length;

		//Prime for 2d Array
		aRow=window.localStorage.getItem(IdArr[0]);
		Cols=aRow.split("~");

		//create empty 2d Array
		// let Array2D = (r,c) => [...Array(r)].map(x=>Array(c).fill(0));
		// this.Arr = Array2D(j,Cols.length+1);

		//unshift  this.Arr
		for(i=0;i<j;i++){
			//push empty row of cols
			RH.Arr.push(new Array(Cols.length+1));
			//get row data 
			aRow=window.localStorage.getItem(IdArr[i]);
			Cols=aRow.split("~");
			//fill empty row with data
			//since unshift the new row is always 0
			for (k=0;k<Cols.length;k++)
				RH.Arr[i][k]=Cols[k];	 
			RH.Arr[i][Cols.length]=IdArr[i];
		}	

		//newest added RH is at row 0 so
		//window["VoiceControl"+ this.windowID].iRHrow=0;
	},
	loadSideBar: function (){ //loads from Arr
	//sort Arr on lastUsedDate

		let i=0;
		let k=0;
		let sideBarTitle="";
		let sideBarClass="";
		let Id="";
		let syncChecked="";
		//clear Button Area in side bar	
		document.getElementById("HistoryBarMain").innerHTML="";
		////console.log("Arr Length:" + RH.Arr.length);
		
		$("#HistoryBarMain").append("");

		for (i=0;i<RH.Arr.length;i++) {
			Id=RH.Arr[i][RH.iRHId]
			sideBarTitle=RH.addSideBarTitle(i);			
			//add button to HTML
			if (sideBarTitle.includes("tooltiptext"))
				sideBarClass="RHBtn tooltip";
			else
				sideBarClass="RHBtn";

			$("#HistoryBarMain").append('<div><i class="fa fa-trash icongroup" style="display:inline;color:var(--danger);" onclick="RH.askDeleteFromRH(\'' + Id + '\');RH.loadSideBar();"></i><button id="' + Id + '" class="' + sideBarClass + '" style="display:inline;" onclick="RH.load2SW(1,\'' + Id.substr(2) + '\'); RH.closeSidebar();" >' + sideBarTitle + '</button></div>')
	
	 		// $("#HistoryBarMain").append('<input id="' + Id + 'cb" type="checkbox" class="RHcb"><button id="' + Id + '" class="' + sideBarClass + '" onclick="RH.load2SW(1,\'' + Id.substr(2) + '\'); RH.closeSidebar();" >' + sideBarTitle + '</button>)
			}
			if (i<32) {
				$("#HistoryBarMain").append('<br>'.repeat(32-i));
			}

			//set syncHistory checkbox
			if (this.syncHistory==true)
					syncChecked="checked";
			$("#HistoryBarMain").append('<div id="HistoryBarFooter" class="SideBarFooter"></div>'); //<input id="syncHistory"  type="checkbox" ' + syncChecked + ' onclick="siteControl.syncHistory=(!siteControl.syncHistory);"><label> sync history</label></div>');			
	},
	addSideBarTitle: function(i){
		let k=0;
		let tt="";
		let sideBarTitle="";
		let refTxt=buildRefText(RH.Arr[i][RH.iRefList],11); //short name RefText.
				
		//sideBarTitle=RH.Arr[i][RH.iTopic];

		if (RH.Arr[i][RH.iTopic]=="")  //Get Button Title column
			sideBarTitle=refTxt; //refText text
		else
			sideBarTitle=RH.Arr[i][RH.iTopic]; //topic text	
		
		//sideBarTitle=RH.Arr[i][k];
		if (sideBarTitle.length>24 ||RH.Arr[i][RH.iTopic]!="") {//if has Topic or Reference is too long for Button Title.
			tt=refTxt.replace(/ /g,"&nbsp");
			tt=tt.replace(/;/g,"; ");
			tt=tt.replace(/&nbsp/g,"&nbsp;")
			if (sideBarTitle.length>24)
				sideBarTitle=sideBarTitle.substr(0.21) + "...";
			return sideBarTitle + '<span class="tooltiptext" style="top:115%;left:10%;" >' + tt + '</span>';
		}
		else	
			return sideBarTitle;	

	},
	findRow: function (type, value, noValueFor="Z") {
		let i=0;
		//ensure noValuefor is valid 
		if (!isNaN(noValueFor))
			if (Number(noValueFor)>RH.ColCnt || Number(noValueFor)<0){
				console.warn ("Cannot get RH column number of ")
			}
		if (!isNaN(type))
			//if RHNum change to RHId
			if((type==RH.iRHId) && (value.substr(0,2)!="RH"))
				value="RH" + value;
		
			//get Row Increment	
			for (i=0;i<this.Arr.length;i++)
				if (this.Arr[i][type]==value && noValueFor=="Z")
					return i;
				else if(this.Arr[i][type]==value && this.Arr[i][noValueFor].length>1)
					return i;
		return -1;
	},
	showArray: function(){
		let i=0;
		////console.log("CurNum:" + RH.CurNum);
		for (i=0;i<RH.Arr.length;i++)
			console.warn(RH.Arr[i]);

	},
	load2SW: function(incre, RHId){
		 ////console.log("In load2SW");
		let Cols=[];
		let rowI=this.findRow(this.iRHId,RHId);
		let aRow="";

		let br=window["BibleRef" + incre];
		let sw=window["ScriptureWindow" + incre];
		
		let Num=RHId.replace("RH","");
		//update before replace except in intial load.   -click a RH buttton mke changes and click another button.
		if ((br.RHNum!=Num) && (br.RHNum!="") && (br.initialLoad==false))
			this.updateRHRow(incre, br.RHNum);


		if (rowI < 0) {  //couldn't find Arr row		
			//see if in localStorage
			aRow= window.localStorage.getItem("RH" + Num);
			if (aRow!=null)
				Cols=aRow.split("~");
			else	
				console.error("Cannot load Reference History numbered:" + Num);	
		}	
		else { //found the row
			
			Cols=this.Arr[rowI];
		}	

		//Update Object values from loading RH Arr
		br.clearBibleRef();
		RH.setCurNum(Cols[this.iRHId].replace("RH",""));
		br.refText=Cols[this.iRefText]
		br.refList=Cols[this.iRefList];
		br.version=Cols[this.iVersion];
		br.topic=Cols[this.iTopic];
		br.ScrollToId=Cols[this.iScrollToID];
		br.RHNum = Num;

		document.getElementById("enterTopic" + incre).innerHTML=Cols[this.iTopic];

		//loading from previous entry so it is good.
		br.isRefValid=true; 
		//set ScriptureWindow
		sw.currentSettings=Cols[this.iSettings];
		if (Cols[this.iMode]=="R0")
			sw.setupMode="Reading";
		else
			sw.setupMode="Study";			
		sw.readFromModeOptions("current", false);
		uncoverGodsWord.processScriptureData(incre,true);
	},
	saveToDB: function(){
	
		//!!!! first update RH Local Variables from RH Arr.
		//!!!! first get DB data before trying to merge new data here?
		let i=0;
		let RHArrStrNew="";
		let RHArrStrModify="";
		let cDate=new Date();
		let mDate=new Date();
		let uDate=new Date();

		//get date to enter into RH after success
		let UpdateRHToDBDate=Date.now();
		//maybe sort on dates later? 
		for (i=0;i<RH.Arr.length;i++)
			if(RH.Arr[i][RH.iCreateDate]>RH.ToDBDate) { 
				//create one SQL Insert in php with each line as an addiitional insert
//$QryTxt="INSERT INTO `ReferenceHistory`(`UserID`, `RHId`, `UniqueHandle`, `createDate`, `LastModifiedDate`, `LastUsedDate`, `RHRow`, `deletedate`)";
				//get dates
				////console.log (RH.Arr[i][RH.iCreateDate]);
				cDate=new Date(Number(RH.Arr[i][RH.iCreateDate]));
				mDate=new Date(Number(RH.Arr[i][RH.iLastModifiedDate]));
				uDate=new Date(Number(RH.Arr[i][RH.iLastUsed]))

				RHArrStrNew=RHArrStrNew + '(USERIDQQ,"' + 
											RH.Arr[i][RH.iRHId].substr(2) + '","' + 
											RH.Arr[i][RH.iRHRandomId] + '","' + 
											cDate.toISOString().slice(0, 19).replace("T", " ") + '","' + 
											mDate.toISOString().slice(0, 19).replace("T", " ")  + '","' + 
											uDate.toISOString().slice(0, 19).replace("T", " ") + '","' + 
											localStorage.getItem(RH.Arr[i][RH.iRHId]) + '","' +
											 '"),';
			}								 
			else if (RH.Arr[i][RH.iLastModifiedDate]>RH.ToDBDate){
				//compare to DB download and only modify what has changed. Each RH update is it's own SQL statement
				RHArrStrModify=localStorage.getItem(RH.Arr[i][RH.iRHId]) + "^";
			}	

		//Nothing new so STOP	
		if(RHArrStrNew=="" && RHArrStrModify=="")
			return;

		//remove the last comma for New RH inserts
		if (RHArrStrNew!="")
			RHArrStrNew=RHArrStrNew.substr(0,RHArrStrNew.length-1);

			////console.log(RHArrStrNew);	

		$.post("saveRH.php", {
			RHArrStrNew:RHArrStrNew,
			RHArrStrModify:RHArrStrModify
		},
		function (result) {
			RH.ToDBDate=UpdateRHToDBDate;
			window.localStorage.setItem("ToDBDate",UpdateRHToDBDate);			
			util.openModalBox(result,"RH2DB qry");
		}
		);
	},
	getFromDB: function(){
		let dbSyncDateTxt=new Date(Number(RH.ToDBDate)).toISOString().slice(0, 19).replace("T", " ")
		let getFromDbDate=Date.now();
		let RHDbWork=[];
		let RHDbArr=[];
		let i=0;

		$.post("getRH.php", {
			dbSyncDateTxt:dbSyncDateTxt
		},
		function (result) {
			RH.ToDBDate=getFromDbDate;
			let lastId="RH" + RH.LastNum;
			window.localStorage.setItem("RHToDBDate",getFromDbDate);
			if (result=="no rows") { //no new records
				////console.log("no new DB records");
				return;
			}

			RHDbWork=result.split("|");

			for(i=0;i<RHDbWork.length;i++){
				if (!RHDbWork[i].includes("~")) //is a blank at end of Db returned
					continue;
				RHDbArr=RHDbWork[i].split("~");
				if (RH.findRow(RH.iRHRandomId,RHDbArr[RH.iRHRandomId])==-1 && RH.findRow(RH.iRHId,RHDbArr[RH.iRHId])==-1){
					window.localStorage.setItem(RHDbArr[RH.iRHId],RHDbWork[i]);
					if(RHDbArr[RH.iRHId]>lastId)
						lastId=RHDbArr[RH.iRHId]
				}	
				else 
					console.warn ("Either a dup in RandomId or RHId has occured");	
			}

			RH.LastNum=lastId.substr(2);
			window.localStorage.setItem("RHLastNum",lastId.substr(2));
			RH.load2Arr();
			RH.loadSideBar();
		}
		);		
		//util.openModalBox (dbSyncDateTxt,"Last DB Sync Text");
	}
}

var accountControl = {
	isLoggedIntoWGS: false,
	passwordVerified: true,
	stayLoggedIn: false,
	email: "",
	userID: "",
	sharedName: "",
	firstName: "",
	lastName: "",
	religionGroup: "",
	commentLine: "",
	hasGroup: false,
	hasNote: false,
	hasGroupFMListener: false,
	//echo $recentRead["GroupID"]."|".$recentRead["groupNameShort"]."|".$recentRead["groupName"]."|".$recentRead["Type"]."|".$recentRead["Moderator"].
	//"|".$recentRead["Role"]."|".$recentRead["CreatorID"]."|".$recentRead["Description"]."~"; 	
	IDGP: 0, namGP: 1, nameGP: 2, typeGP: 3, modGP: 4, roleGP: 5, crtrGP: 6, desGP: 7,
	openDialog: function () {
		console.log ("In accountControl.opendialog");
		//	var myX = event.pageX - 285;
		//	var myY = event.pageY;
		document.getElementById('msgboxbackground').style.display = 'block';
		if (accountControl.email=='".$email."'){
			accountControl.isLoggedIntoWGS =false;
			accountControl.email="";
		}	

			if (accountControl.isLoggedIntoWGS == true) {
			//		document.getElementById('logOutShowEmail').innerHTML=accountControl.email; //"test@test.org";
			document.getElementById('logoutPopUp').style.display = 'block';
		}
		else {
			document.getElementById('loginPopUp').style.display = 'block';
		}
	},

	doRegister: function () {
		var pwrd = document.getElementById("loginPassword").value;
		var vrfy = document.getElementById("verifyPassword").value;
		if (vrfy !== pwrd) {
			util.openModalBox("The passwords do not match.", "Passwords Not Match");
			return;
		}

		var email = document.getElementById("loginEmail").value;
		//	accountControl.email= email;

		if ((email.length < 3) || (!email.includes("@")) || (!email.includes(".", email.substr("@")))) {
			$("#loginResults").html("Invalid Email");
			return;
		}

		var password = document.getElementById("loginPassword").value;
		var sharedName = document.getElementById("sharedName").value;
		var firstName = document.getElementById("firstName").value;
		var lastName = document.getElementById("lastName").value;
		var religionGroup = document.getElementById("religionGroup").value;

		$("#logOutShowEmail").html("Waiting for you to verify your email.");

		$.post("register.php", {
			email: email,
			password: password,
			sharedName: sharedName,
			firstName: firstName,
			lastName: lastName,
			religionGroup: religionGroup
		},
			function (result) {
				util.openModalBox(result, "Result of Sign Up");
			}
		);
	},
	doLogin: function () {
		var email = document.getElementById("loginEmail").value;
		//accountControl.email= email;
		if (email=='".$email."'){
			accountControl.isLoggedIntoWGS =false;
			accountControl.email="";
		}
		var password = document.getElementById("loginPassword").value;

		if ((email.length < 3) || (!email.includes("@")) || (!email.includes(".", email.substr("@")))) {
			util.openModalBox("Invalid Email", "Log In Status");
			return;
		}

		$.post("login.php", {
			email: email,
			password: password
		},
			function (result) {
				$("#checkLogin").load("checkLogin.php", "", accountControl.checkLogin());

				if (result == "This email is not registered with WhatsGodSay.<br>Please Sign Up.") {
					accountControl.processSignInUp('Up');
					document.getElementById('signUpRadio').checked = true;
				}
				else {
					if (result.includes("You are Logged In.") == true) {
						accountControl.isLoggedIntoWGS = true;
						document.getElementById("accountBtn").style.borderColor="var(--txtbtn)";
					}

					document.getElementById('loginPopUp').style.display = 'none';
					document.getElementById('msgboxbackground').style.display = 'none';
				}
				util.openModalBox(result, "Log In Status");
			}
		);
	},
	doLogOut: function () {
		$.post("logout.php", {},
			function (result) {
				util.openModalBox(result, "Log In Status");
				document.getElementById('logoutPopUp').style.display = 'none';
				document.getElementById('msgboxbackground').style.display = 'none';
				accountControl.isLoggedIntoWGS = false;
				accountControl.clearLoginData();
				document.getElementById("accountBtn").style.borderColor="var(--danger)";

			}
		);
	},

	processSignInUp: function (typ) {
		if (typ == "In") {
			$("#verifyPasswordLabel").hide();
			$("#verifyPassword").hide();
			$("#sharedNameLabel").hide();
			$("#lastNameLabel").hide();
			$("#firstNameLabel").hide();
			$("#sharedName").hide();
			$("#lastName").hide();
			$("#firstName").hide();
			$("#religionGroupLabel").hide();
			$("#OnLineGroupSelectLabel").hide();
			$("#religionGroup").hide();
			$("#OnLineGroupSelect").hide();
			$("#signUpButton").hide();
			$("#signInButton").show();
		}
		else {
			$("#signInButton").hide();
			$("#verifyPasswordLabel").show();
			$("#verifyPassword").show();
			$("#sharedNameLabel").show();
			$("#lastNameLabel").show();
			$("#firstNameLabel").show();
			$("#sharedName").show();
			$("#lastName").show();
			$("#firstName").show();
			$("#religionGroupLabel").show();
			$("#OnLineGroupSelectLabel").show();
			$("#religionGroup").show();
			$("#OnLineGroupSelect").show();
			$("#signUpButton").show();
		}
	},

	checkLogin: function () {
		 accountControl.isLoggedIntoWGS = false;

		$.ajax({
			dataType: 'text',
			url: 'checkLogin.php',
			success: function (result) {
				if (result.includes("You are Logged In.") == true) {
					var step1 = result.split("~");
					accountControl.userID = step1[1];
					accountControl.email = step1[2];
					accountControl.sharedName = step1[3];
					accountControl.firstName = step1[4];
					accountControl.lastName = step1[5];
					accountControl.religionGroup = step1[6];
					accountControl.commentLine = step1[7];
					accountControl.isLoggedIntoWGS = true;
					if (step1[8] == "1")
						accountControl.passwordVerified = true;
					document.getElementById("accountBtn").style.borderColor="var(--txtbtn)";
					document.getElementById('logOutShowEmail').innerHTML = "Currently logged in as <br>" + accountControl.email;
					accountControl.getGroups();
					siteControl.getDBSiteSettings();
				}
				else {
					accountControl.clearLoginData();

					//??? should clear groupData. 
				}
			},
			error: function () {
				util.openModalBox("Error getting Login value.", "Login Check Error")
				accountControl.isLoggedIntoWGS = false;
			}
		});

		if (accountControl.email=='".$email."' || accountControl.email==""){
			accountControl.isLoggedIntoWGS =false;
			accountControl.email="";
			document.getElementById("accountBtn").style.borderColor="var(--danger)";
			//return;
		}


	},
	clearLoginData: function () {
		this.isLoggedIntoWGS = false;
		this.email = "";
		this.userID = "";
		this.sharedName = "";
		this.firstName = "";
		this.lastName = "";
		this.religionGroup = "";
		this.commentLine = "";
		this.hasGroup = false;
		this.groupData = "";
		this.groupDataList = "";
		noteControl.noteList = [['0', '0'], ['0', '0']];
		noteControl.listNoteText = "";
	},
	getGroups: function () {
		if (accountControl.isLoggedIntoWGS==false)
			return;
		$.post("getGroups.php", {},
			function (result) {
				let i = 0;
				let step1 = [];
				accountControl.groupData = [];
				accountControl.groupDataList = '<datalist id="groupDataList">';
				step1 = result.split("~");
				for (i = 0; i < step1.length; i++) {
					if (step1[i].includes("|") == true) {  //don't read in blank value.
						accountControl.groupData[i] = step1[i].split("|");
						accountControl.groupDataList = accountControl.groupDataList + '<option value="' + accountControl.groupData[i][accountControl.namGP] + '">';
					}
				}
				if (accountControl.groupDataList == '<datalist id="groupDataList">') {
					accountControl.hasGroup = false;
					//??? should remove value of groupData also.
					accountControl.groupDataList = "No groups yet.";
				}
				else {
					accountControl.groupDataList = accountControl.groupDataList + "</datalist>";
					accountControl.hasGroup = true;
					accountControl.setForumGroupTitles();
				}
			}
		);
		//	////console.log("accountControl.hasGroup:" + this.hasGroup);
	},
	setForumGroupTitles: function () {
		if ((this.isLoggedIntoWGS == false) || (this.hasGroup == false)) //???? should still allow showing public groups or notes?
			return;

		var i = 0;
		var j = 0;
		for (i = 0; i < this.groupData.length; i++) {
			document.getElementById("groupFM" + i).innerHTML = this.groupData[i][accountControl.namGP];
			document.getElementById("groupFM" + i).style.display = "block";
		}
		j = i;
		//set listeners
		//hide unused groupFM elements. //
		////console.log("j=" + j);
		for (i = j; i < 11; i++)
			document.getElementById("groupFM" + i).style.display = "none";

		noteControl.getNoteList(false);
	},

	setForumNotes: function () {
		var GID = "";
		var ForumNote = "";
		var i = 0;
		var j = 0;
		for (i = 0; i < this.groupData.length; i++) {
			GID = this.groupData[i][this.IDGP];
			ForumNote = "";
			for (j = 0; j < noteControl.noteList.length; j++)
				if (noteControl.noteList[j][3] == GID)
					ForumNote = ForumNote + "<button class='midBtn' style='width:95%' onclick='noteControl.showNote(" + noteControl.noteList[j][noteControl.ID] + "," + noteControl.noteList[j][noteControl.userID] + ")'>" + noteControl.noteList[j][noteControl.title] + "<span style='float:right'>" + noteControl.noteList[j][noteControl.displayName] + "</span></button><br>";

			document.getElementById("groupFM" + i + "P").innerHTML = ForumNote;
		}

		setGroupFMListeners(0, this.groupData.length);
	},
	getGroupNam: function (groupID) {
		for (i = 0; i < this.groupData.length; i++)
			if (this.groupData[i][this.IDGP] == groupID)
				return this.groupData[i][this.namGP];

		return "false";
	},
	getGroupID: function (groupNam) {
		for (i = 0; i < this.groupData.length; i++)
			if (this.groupData[i][this.namGP] == groupNam)
				return this.groupData[i][this.IDGP];

		return "false";
	}
}//end object accountControl

var searchControl = {
	entry: "",
	versionCount: 1,
	version: "",
	language: "English",
	root: false,
	phrase: true,
	openDialog: function () {
		document.getElementById('msgboxbackground').style.display = 'block';
		document.getElementById('search').style.display = 'block';
		document.getElementById("searchEntry").focus();
	},
	closeDialog: function () {
		document.getElementById('msgboxbackground').style.display = 'none';
		document.getElementById('search').style.display = 'none';
	},
	doSearch: function () {
		if (document.getElementById("searchEntry").value == "") {
			return;
		}
		if (siteControl.activeWindowLanguage === "Greek") {
			getWordData(document.getElementById("searchEntry").value, "", "Greek", "");
		}
		else //English
			getWordData(document.getElementById("searchEntry").value, "", "English", "");
	}
} //end object searchControl

var trackRead = {
	bRef: 1,  //BibleRef object increment 
	sRef: 1,  //ScriptureWindow object increment
	listMARtext: "", //this is the text that goes in the dialog box.
	showMARrowCnt: 7, //number of MARrows to display.
	showMARshortDate: false,  //change date display to format Mon dd
	showMARMethod: false,
	showMARComment: false,
	viewFilter: "List",
	versionFilter: "All",
	dateFilter: "All",
	MARrowCnt: 0, //total Mark As Read rows with NO delete date in fullMAR. 
	MARcnt: 0,  //total Mark As Read rows with NO delete date in fullMAR.
	englishVersionCount: 12,
	ID: 0, ReadDate: 1, ReadDate2: 2, ReferenceText: 3, Reference: 4, ReferenceTo: 5,
	Version: 6, TitleNum: 7, DeleteDate: 8, method: 9, comment: 10,

	openDialog: function (param) {
		//checked if logged in.
		if (accountControl.isLoggedIntoWGS === false) {
			util.openModalBox("If you wish to mark your reading, please log in.<br> To log in select the account button (<button class='smallBtn fa fa-users'></button>) in the top right hand corner.", "Requires a Log In");
			return;
		}
		if (param === false)
			document.getElementById('addMAR').style.display = "none";

		var vrsn = window["BibleRef" + this.bRef].version;
		var RefText = window["BibleRef" + this.bRef].refText;
		var i = 0;
		//var d = new Date();
		//var LocalTimeString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();

		//create and fill markAsRead window
		document.getElementById('markAsRead').style.top = '5px';
		document.getElementById('markAsRead').style.left = '5px';
		document.getElementById('markAsReadReference').innerHTML = RefText;
		document.getElementById('markAsReadVersion').innerHTML = vrsn;
		document.getElementById('contextMenu').style.display = "none";

		if ('fullMAR' in trackRead == false) {  //have not loaded MAR from table
			//get the load marked as Read into object
			//			 ////console.log("In trackRead.openDialog - about to run getFullMAR");
			trackRead.getFullMAR();
		}
		else {
			trackRead.getRecentMAR();
		}
	},
	openFilter: function () {
		 ////console.log("In openFilter");
		document.getElementById('showMARrowCnt').value = trackRead.showMARrowCnt;
		document.getElementById("filterMAR").style.display = "block";
		document.getElementById("filterMAR").style.left = "350px";
		document.getElementById("filterMAR").style.top = "75px";
	},
	updateShowMARrowCnt: function () {
		trackRead.showMARrowCnt = document.getElementById('showMARrowCnt').value;
		trackRead.getRecentMAR();
	},
	updateShowMARshortDate: function () {
		trackRead.showMARshortDate = document.getElementById("showMARshortDate").checked;
		trackRead.getRecentMAR();
	},
	changeToShortDate: function (dateTxt) {
		if (trackRead.showMARshortDate == false)
			return dateTxt;
		dateTxt = dateTxt.substr(4, 6);
		return dateTxt;

	},
	changeFilterMARVerAll: function () {
		if (document.getElementById("MARAll").checked == true) {
			for (i = 0; i < versionData.length; i++)
				document.getElementById("MAR" + versionData[i][0]).checked = true;

			document.getElementById("MARAllEnglish").checked = true;
			document.getElementById("MARAllGreek").checked = true;
		}
		else {
			for (i = 0; i < versionData.length; i++)
				document.getElementById("MAR" + versionData[i][0]).checked = false;

			document.getElementById("MARAllEnglish").checked = false;
			document.getElementById("MARAllGreek").checked = false;

		}
		trackRead.changeFilterMARVer();
	},
	changeFilterMARVerAllEnglish: function () {
		if (document.getElementById("MARAllEnglish").checked == true) {
			for (i = 0; i < trackRead.englishVersionCount; i++)
				document.getElementById("MAR" + versionData[i][0]).checked = true;
			if (document.getElementById("MARAllGreek").checked == true)
				document.getElementById("MARAll").checked = true;
		}
		else {
			for (i = 0; i < trackRead.englishVersionCount; i++)
				document.getElementById("MAR" + versionData[i][0]).checked = false;
			document.getElementById("MARAll").checked = false;

		}
		trackRead.changeFilterMARVer();
	},
	changeFilterMARVerAllGreek: function () {
		if (document.getElementById("MARAllGreek").checked == true) {
			for (i = trackRead.englishVersionCount; i < versionData.length; i++)
				document.getElementById("MAR" + versionData[i][0]).checked = true;
		}
		else {
			for (i = trackRead.englishVersionCount; i < versionData.length; i++)
				document.getElementById("MAR" + versionData[i][0]).checked = false;
			document.getElementById("MARAll").checked = false;

		}
		trackRead.changeFilterMARVer();
	},
	changeFilterMARVer: function () {
		var EngCnt = 0;
		var GrkCnt = 0;
		trackRead.versionFilter = "";
		for (i = 0; i < versionData.length; i++)
			if (document.getElementById("MAR" + versionData[i][0]).checked == true) {
				trackRead.versionFilter = trackRead.versionFilter + versionData[i][0] + ",";
				if (i < trackRead.englishVersionCount)
					EngCnt++;
				else
					GrkCnt++;
			}

		if (trackRead.versionFilter.length > 0)
			trackRead.versionFilter = trackRead.versionFilter.substr(0, trackRead.versionFilter.length - 1);

		if (EngCnt == trackRead.englishVersionCount)
			document.getElementById("MARAllEnglish").checked = true;
		else
			document.getElementById("MARAllEnglish").checked = false;

		if (GrkCnt == versionData.length - trackRead.englishVersionCount)
			document.getElementById("MARAllGreek").checked = true;
		else
			document.getElementById("MARAllGreek").checked = false;

		if (GrkCnt + EngCnt == versionData.length) { //All checked
			document.getElementById("MARAll").checked = true;
			trackRead.versionFilter = "All";
			document.getElementById("filterMARVer").innerHTML = "Versions:All"
		}
		else {  //Not All Checked
			document.getElementById("MARAll").checked = false;
			if (GrkCnt == 0 && EngCnt == trackRead.englishVersionCount)
				trackRead.versionFilter = "All English";
			else if (EngCnt == 0 && GrkCnt == versionData.length - trackRead.englishVersionCount)
				trackRead.versionFilter = "All Greek";
		}

		////console.log ("changeFilterMARVer:" + trackRead.versionFilter);	
		if (trackRead.versionFilter.length > 21)
			document.getElementById("filterMARVer").innerHTML = "Versions:Multiple";
		else
			document.getElementById("filterMARVer").innerHTML = "Versions:" + trackRead.versionFilter;

		trackRead.getRecentMAR();
	},
	changeFilterMARDate: function (dateOpt) {
		////console.log ("dateOpt:" + dateOpt + "  MARDateTo:" + document.getElementById('MARDateTo').value );
		if (dateOpt == 'All') {
			document.getElementById('filterMARDate').innerHTML = "Read Dates:All";
			trackRead.dateFilter = "All";
		}
		else {
			if (document.getElementById('MARDateTo').value != "") {
				document.getElementById('filterMARDate').innerHTML = "Read Dates:" + document.getElementById('MARDateFrom').value + " - " + document.getElementById('MARDateTo').value;
				trackRead.dateFilter = document.getElementById('MARDateFrom').value + " - " + document.getElementById('MARDateTo').value;
			}
			else {
				document.getElementById('filterMARDate').innerHTML = "Read Dates:" + document.getElementById('MARDateFrom').value + " - Now";
				trackRead.dateFilter = document.getElementById('MARDateFrom').value + " - Now";
			}
		}

		trackRead.getRecentMAR();
	},
	matchFilter: function (i) {
		if (trackRead.fullMAR[i][trackRead.DeleteDate] == "") {
			if (trackRead.versionFilter != "All") {//check if version filter match
				if (trackRead.versionFilter.substr(0, 3) == "All") {
					for (l = 0; l < versionData.length; l++) {
						if (trackRead.fullMAR[i][trackRead.Version] == versionData[l][0])
							verRow = l;
					}
					if (trackRead.versionFilter == "All English" && verRow > (trackRead.englishVersionCount - 1))
						return false;
					else if (trackRead.versionFilter == "All Greek" && verRow < trackRead.englishVersionCount)
						return false;
				}
				else
					if (trackRead.versionFilter.includes(trackRead.fullMAR[i][trackRead.Version]) == false)
						return false;
			}
			if (trackRead.dateFilter != "All") {
				if (trackRead.dateFilter.includes("Now") === true) {
					////console.log(trackRead.dateFilter.substr(0,10) + " " + trackRead.fullMAR[i][trackRead.ReadDate2]);
					if (trackRead.dateFilter.substr(0, 10) > trackRead.fullMAR[i][trackRead.ReadDate2])
						return false;
				}
				else {
					////console.log(trackRead.dateFilter.substr(13,10) + " " + trackRead.fullMAR[i][trackRead.ReadDate2]);
					if (trackRead.dateFilter.substr(0, 10) > trackRead.fullMAR[i][trackRead.ReadDate2] || trackRead.dateFilter.substr(13, 10) < trackRead.fullMAR[i][trackRead.ReadDate2])
						return false;
				}
			}

		}
		else
			return false;

		return true;
	},
	getFullMAR: function () {
		////console.log("In getFullMAR");
		$.post("getfullMAR.php", {},
			function (result) {
				trackRead.step1 = [];
				trackRead.fullMAR = [];
				trackRead.step1 = result.split("~");
				for (i = 0; i < trackRead.step1.length; i++)
					trackRead.fullMAR[i] = trackRead.step1[i].split(",");
				//trackRead.fullMAR=result;
				if (trackRead.fullMAR[0][trackRead.ID] == "0") {
					trackRead.MARcnt = 0;
					trackRead.MARrowCnt = 0;
					trackRead.listMARtext = "Nothing marked yet.";
					document.getElementById("listMAR").innerHTML = trackRead.listMARtext;
					document.getElementById('markAsRead').style.display = 'block';
				}
				else {  //fullMAR has row(s) 
					trackRead.MARcnt = trackRead.fullMAR.length;
					trackRead.MARrowCnt = trackRead.fullMAR.length;
					////console.log("In getFullMAR set MARcnt to " + trackRead.MARcnt); // + " and newMARcnt=" + trackRead.newMARcnt + " about to run getRecentMAR.");
					trackRead.getRecentMAR();
				}
			}

		);
	},
	getRecentMAR: function () {
		var i = 0;
		var j = 0;
		var k = Number(trackRead.showMARrowCnt) - 1;
		var l = 0;
		var verRow = 0;

		 ////console.log("In getRecentMAR MARcnt=" + trackRead.MARcnt); // + " and newMARcnt=" + trackRead.newMARcnt);
		if (trackRead.MARcnt == 0) { //nothing has been Marked as Read yet.
			////console.log("getRecentMAR-no rows");
			trackRead.listMARtext = "No references marked.";
			document.getElementById("listMAR").innerHTML = trackRead.listMARtext;
			document.getElementById('markAsRead').style.display = 'block';
		}
		else {  //create listMARtext from fullMAR			
			////console.log("getRecentMAR-use fullMAR");
			if (trackRead.versionFilter == "") {
				trackRead.listMARtext = "The filter has no version selected.";
			}
			else {
				trackRead.listMARtext = "<table>";
				for (i = trackRead.MARcnt - 1; i > -1; i--) {
					if (trackRead.matchFilter(i) === true) {
						trackRead.listMARtext = trackRead.listMARtext + "<tr><td>"
							+ trackRead.fullMAR[i][trackRead.ReferenceText] + "</td><td>"
							+ trackRead.fullMAR[i][trackRead.Version] + "</td><td>"
							+ trackRead.changeToShortDate(trackRead.fullMAR[i][trackRead.ReadDate]) + "</td><td>"
							+ trackRead.fullMAR[i][9].replace("MAR", "").replace("MAR", "").replace("_", " ") + "</td><td>"
							+ trackRead.fullMAR[i][10] + "</td><td>"
							+ '<i onclick=\"trackRead.deleteMAR(' + trackRead.fullMAR[i][trackRead.ID] + ');\" class=\"fa fa-trash\" title=\"Delete\"></i></td>'
							+ " </td></tr>";
						j = j + 1;
						if (j > k)
							break;
					}
				}
				if (trackRead.listMARtext == "<table>")
					trackRead.listMARtext = "No matches on the current filter.";
				else
					trackRead.listMARtext = trackRead.listMARtext + "</table>"
			}

			document.getElementById("listMAR").innerHTML = trackRead.listMARtext;

			trackRead.showMarkedReadChapter();
			trackRead.showFilterView(trackRead.viewFilter);
		}
	},
	deleteMAR: function (rID) {
		 ////console.log("In deleteMAR");
		for (i = 0; i < trackRead.fullMAR.length; i++) {
			if (trackRead.fullMAR[i][trackRead.ID] == rID) {
				if (confirm("delete " + trackRead.fullMAR[i][trackRead.ReadDate] + " " + trackRead.fullMAR[i][trackRead.Version] + " " + trackRead.fullMAR[i][trackRead.ReferenceText] + "?") == true) {
					////console.log("deleting record via fullMAR with ID of " + rID);
					// !!!! needs to set Reference
					$.post("deleteMarkRead.php", { ID: rID },
						function (result) {
							////console.log(result);
						});
					trackRead.fullMAR[i][trackRead.DeleteDate] = "2018-12-12";
					trackRead.getRecentMAR();
				}
				break;
			}
		}
	},
	markAsReadButton: function () {
		var reference = window["BibleRef" + trackRead.bRef].refList.substr(0, 8);
		var referenceTo = "";
		var vrsn = window["BibleRef" + trackRead.bRef].version;
		var RefText = window["BibleRef" + trackRead.bRef].refText;
		var method = document.getElementById('markAsReadMethod').value;
		var comment = document.getElementById('markAsReadComment').value;
		if (window["BibleRef" + trackRead.bRef].refList.includes("-") === true)   // more than one chapter
			referenceTo = window["BibleRef" + trackRead.bRef].refList.substr(9, 8);

		var d = new Date();
		var LocalTimeString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
		////console.log(LocalTimeString);
		 ////console.log("In mark As Read before post");

		$.post("markAsRead.php", {
			reference: reference,
			referenceTo: referenceTo,
			vrsn: vrsn,
			RefText: RefText,
			//paragraph: paragraph,
			LocalTimeString: LocalTimeString,
			comment: comment,
			method: method
		},
			function (result) {
				trackRead.getNewMAR();
				document.getElementById('addMAR').style.display = "none";
			}
		);
	},
	getNewMAR: function () {
		$.post("getNewMAR.php", {
		},
			function (result) {
				result = result.trim();
				////console.log(result);
				trackRead.fullMAR.push(result.split(","));
				trackRead.MARcnt = Number(trackRead.MARcnt) + 1;
				trackRead.getRecentMAR();
			}
		);

	},
	showMarkedReadChapter: function () {
		var i = 0;
		var j = 0;
		var ref = "";


		//document.getElementById('markAsRead').style.display = 'none';

		//makes each book and chapter the default color (not read).
		for (i = 1; i < 67; i++) {
			document.getElementById(util.padNum(i, 2)).style.color = "var(--txt3)";
			//"var(--txt3)"
			for (j = 1; j < 151; j++) {
				if (document.getElementById(util.padNum(i, 2) + util.padNum(j, 3)) != undefined)
					document.getElementById(util.padNum(i, 2) + util.padNum(j, 3)).style.color = "var(--txt3)";
				else
					break;
			}
		}
		//Set each chapter the red color.
		for (i = 0; i < trackRead.fullMAR.length; i++) {
			if (trackRead.matchFilter(i) === true) { //rec matches filter so process it.
				ref = trackRead.fullMAR[i][trackRead.Reference].substr(0, 5);
				if (ref.substr(2, 3) == "000") //ref has no chapter... 
					ref = ref.substr(0, 2);    //so set ref to book id
				if (document.getElementById(ref) != undefined) { //sets book name or single chapter
					document.getElementById(ref).style.color = "var(--danger)";
					if (ref.length == 2) { //do each chapter in the book
						for (j = 1; j < 151; j++) {
							if (document.getElementById(ref + util.padNum(j, 3)) != undefined)
								document.getElementById(ref + util.padNum(j, 3)).style.color = "var(--danger)";
							else
								break;
						}
					}
				}
				if (trackRead.fullMAR[i][trackRead.ReferenceTo] != "") {
					while (ref < trackRead.fullMAR[i][trackRead.ReferenceTo].substr(0, 5)) {
						ref = ref.substr(0, 2) + util.padNum(Number(ref.substr(2)) + 1, 3);
						if (document.getElementById(ref) != undefined)
							document.getElementById(ref).style.color = "var(--danger)";
					}
				}

			}
		}
		document.getElementById('chapterMAR').style.display = "block";
		//}
		//);
	},
	showFilterView(viewFilter) {
		trackRead.viewFilter = viewFilter;
		switch (trackRead.viewFilter) {
			case "List":
				document.getElementById("listMAR").style.display = "block";
				document.getElementById("chapterMAR").style.display = "none";
				document.getElementById("markAsRead").style.width = "auto";
				document.getElementById("MARHistory").style.minHeight = "auto";
				break;
			case "Chapter":
				document.getElementById("chapterMAR").style.display = "block";
				document.getElementById("listMAR").style.display = "none";
				document.getElementById("markAsRead").style.width = "690px";
				document.getElementById("MARHistory").style.minHeight = "75vh";
				break;
			case "Both":
				document.getElementById("viewsMAR").style.display = "flex";
				document.getElementById("listMAR").style.display = "block";
				document.getElementById("chapterMAR").style.display = "block";
				document.getElementById("markAsRead").style.width = "95vw";
				document.getElementById("MARHistory").style.minHeight = "75vh";
				break;
		}
		document.getElementById('markAsRead').style.display = 'block';
	}
} //end object trackRead

var noteControl = {
	IDAN: "0", titleAN: "", ToAN: "self", toGroupAN: "", toMemberAN: "", tagTypeAN: "word", tagAN: "", purposeAN: "note",
	maxNoteID: 0,
	localTimeString: "",
	isSaved: true,
	isChanged: false,
	isNew: true,
	oId: "",
	oType: "",
	noteList: [['0', '0'], ['0', '0']],
	// createDate:"", 	// lastModifyDate:"", 	// toAN:"none", // none, web developer, group, world 	// tagType:"word",//English word, Greek word, sentence, paragraph, section, verse, chapter, book  	// tagValue:"", //identifier of word or last word - where the N tag will show. 	// purpose:"note", //note, topic, translation, share, question, reference, cross reference, other, web developer("data" or "website") // title:"", //noteList fields
	ID: 0, title: 1, To: 2, groupID: 3, tagType: 4, tag: 5, purpose: 6, createDate: 7, modifyDate: 8, userID: 9, displayName: 10, note: 11,

	openWritingEditor: function (incre, noteID, objID, objType, objValue) {
		var i = 0;
		var titleEditor = "";
		var foundNote = false;
		var isNewNote = false;

		if (accountControl.isLoggedIntoWGS === false) {
			util.openModalBox("If you wish to write, please log in.<br> To log in select the account button (<button class='smallBtn fa fa-users'></button>) in the top right hand corner.", "Requires a Log In");
			return;
		}

		this.oId = objID;
		this.oType = objType;


		if (noteID == 0) { //is new note
			isNewNote = true;
			this.tagTypeAN = objType;
			this.noteID = 0;
			//set default values for writing.	
			document.getElementById('noteID').value = 0;
			document.getElementById('purposeAN').value = this.purposeAN;
			document.getElementById('ToAN').value = this.ToAN;
			noteControl.processToAN();

			if (this.ToAN == "group")
				document.getElementById('toGroup').value = accountControl.getGroupNam(this.noteList[i][noteControl.groupID]);
			// else {
			// 	////console.log(typeof document.getElementById('toGroup'));
			// 	if (typeof document.getElementById('toGroup')!= "undefined")
			// 		document.getElementById('toGroup').value="";
			// 	}		
			document.getElementById('tagTypeAN').value = this.tagTypeAN;
			document.getElementById('tagAN').value = "";
			//document.getElementById('tagAN').value=  !!!Based on clicked element
			document.getElementById('titleAN').value = "";
			titleEditor = "New " + this.purposeAN + " to " + this.ToAN;
		}
		else {  //is reopening a prior note to update
			isNewNote = false;
			//find matching noteList row in values 
			for (let i = 0; i < this.noteList.length; i++) {
				if (this.noteList[i][noteControl.ID] == noteID) {
					if (this.noteList[i][noteControl.userID] == accountControl.userID) {
						foundNote = true;
						break;
					}
				}
			}
			//pull in values from noteList
			titleEditor = "Cannot find Writing."
			if (foundNote == true) {
				document.getElementById('noteID').value = this.noteList[i][noteControl.ID];
				document.getElementById('titleAN').value = this.noteList[i][noteControl.title];
				document.getElementById('ToAN').value = this.noteList[i][noteControl.To];
				noteControl.processToAN();
				if (this.noteList[i][noteControl.To] == "group") {
					document.getElementById('toGroup').value = accountControl.getGroupNam(this.noteList[i][noteControl.groupID])
				}
				//document.getElementById('').value=this.noteList[i][noteControl.groupID];
				document.getElementById('tagTypeAN').value = this.noteList[i][noteControl.tagType];
				document.getElementById('tagAN').value = this.noteList[i][noteControl.tag] + "";
				document.getElementById('purposeAN').value = this.noteList[i][noteControl.purpose];
				//nicEditors.findEditor("writingEditorTextArea").setContent(this.noteList[i][noteControl.note]);

				titleEditor = "Edit " + this.noteList[i][noteControl.purpose] + " to " + this.noteList[i][noteControl.To];
			}
			else { //couldn't find note id
				util.openModalBox("Could not find Writing with an ID of " + noteID, " Error Writing ID");
				return;
			}
		}

		//open editor	
		document.getElementById('writingEditor').style.top = "50px";
		//$('.nicEdit-panelContain').parent().width('99%');
		//$('.nicEdit-panelContain').parent().next().width('99%');
		//$('.nicEdit-main').width('99%');
		//$('.nicEdit-main').css('padding', '5px');
		document.getElementById('writingEditorTitle').innerHTML = titleEditor;
		document.getElementById('writingEditorPopupHeader').innerHTML = "";
		document.getElementById('writingEditorBtn').innerHTML = "Save " + document.getElementById('purposeAN').value;
		document.getElementById('writingEditorPopupHeader').innerHTML = "Edit " + document.getElementById('purposeAN').value + " Options";
		document.getElementById('writingEditor').style.display = 'block';
		document.getElementById('wordStudyBox').style.display = 'none';
	},
	closeDialog: function (incre) {
		if (isChanged == true)
			alert("Window" + incre + " is not saved");
	},
	openOptions: function () {
		document.getElementById('writingEditorPopUp').style.top = event.pageY + "px";
		document.getElementById('writingEditorPopUp').style.left = event.pageX + "px";
		document.getElementById('writingEditorPopUp').style.display = "block";
	},
	saveNote: function (incre) {
		var i = 0;
		var isNewNote = false;
		var noteID = document.getElementById('noteID').value;
		var ToAN = document.getElementById('ToAN').value;
		var toGroup = "";
		var titleAN = document.getElementById('titleAN').value;
		var tagType = document.getElementById('tagTypeAN').value;
		var tag = document.getElementById('tagAN').value;
		var purpose = document.getElementById('purposeAN').value;

		//var nicInstance = nicEditors.findEditor('writingEditorTextArea');
		//var note = nicInstance.getContent();
        var note = document.getElementById("writingEditorTextArea").value;
		var foundGroup = "";
		var d = new Date();
		var LocalTimeString = (d.getMonth() + 1) + "-" + d.getDate() + "-" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();

		if (noteID == 0) {
			isNewNote = true;
			noteID = ++this.maxNoteID;
		}
		////console.log("isNewNote:" + isNewNote);

		if (ToAN == "group") {
			toGroup = document.getElementById('toGroup').value;
			foundGroup = accountControl.getGroupID(toGroup);
			if (foundGroup != "false")
				toGroup = foundGroup;
			else {
				util.openModalBox("Error getting ID of Group " + toGroup, "Error: Group ID");
				return;
			}
		}


		$.post("saveNote.php", {
			isNewNote: isNewNote,
			noteID: noteID,
			LocalTimeString: LocalTimeString,
			note: note,
			ToAN: ToAN,
			toGroup: toGroup,
			tagType: tagType,
			tag: tag,
			purpose: purpose,
			titleAN: titleAN
		},
			function (result) {
				//!!!! need to either add note or update note to noteList!!
				document.getElementById('noteID').value = noteID;
				noteControl.localTimeString = LocalTimeString
				noteControl.updateNoteList(false, isNewNote, noteID, titleAN, ToAN, toGroup, tagType, tag, purpose, note);
				util.openModalBox(result, "Save " + purpose + " Results");

			}
		);
	},
	getNoteList: function (showDialog) {
		var topNoteID = 0;
		if (accountControl.isLoggedIntoWGS === false) {
			if (showDialog == true)
				util.openModalBox("If you wish to view notes, please log in.<br> To log in select the account button (<button class='smallBtn fa fa-users'></button>) in the top right hand corner.", "Requires a Log In");
			return;
		}

		if (noteControl.noteList[0][0] == "0") {
			$.post("getNotesList.php", {},
				function (result) {
					if (result == "No Notes") {
						document.getElementById('wordStudyBoxMain').innerHTML = "No Notes created yet.";
						document.getElementById('wordStudyBoxHeader').innerHTML = "No Note List";
						document.getElementById('wordStudyBox').style.display = 'block';
						this.maxNoteID = -1;
						return;
					}

					var step1 = result.split("~");
					noteControl.noteList = [];
					for (i = 0; i < step1.length; i++) {
						noteControl.noteList[i] = step1[i].split("|");
						if (typeof noteControl.noteList[i][noteControl.tagType] != "undefined")
							noteControl.noteList[i][noteControl.tagType] = noteControl.noteList[i][noteControl.tagType];
						if (typeof noteControl.noteList[i][noteControl.purpose] != "undefined")
							noteControl.noteList[i][noteControl.purpose] = noteControl.noteList[i][noteControl.purpose];
						if (typeof noteControl.noteList[i][noteControl.To] != "undefined")
							noteControl.noteList[i][noteControl.To] = noteControl.noteList[i][noteControl.To];


						noteControl.noteList[i][noteControl.createDate] = noteControl.noteList[i][noteControl.createDate].substr(0, 16);
						noteControl.noteList[i][noteControl.modifyDate] = noteControl.noteList[i][noteControl.modifyDate].substr(0, 16);

						if (noteControl.noteList[i][noteControl.ID] > topNoteID)
							topNoteID = noteControl.noteList[i][noteControl.ID];
					}
					noteControl.maxNoteID = topNoteID;
					if (showDialog == false)
						accountControl.setForumNotes();
					else
						noteControl.makeNoteListText(true);
				}

			);

		}
		else //already have noteList
			if (showDialog == true)
				noteControl.makeNoteListText(true);
	},
	updateNoteList: function (showDialog, isNewNote, noteID, titleAN, ToAN, toGroup, tagType, tag, purpose, note) {
		// insert/edit row in noteList
		//ID:0,title:1,To:2,groupID:3,tagType:4,tag:5,purpose:6,createDate:7,modifyDate:8,userID:9, displayName:10, note:11,
		var i = 0;
		var foundNote = false;

		if (isNewNote == true) //add new note
			this.noteList.push([noteID, titleAN, ToAN, toGroup, tagType, tag, purpose, this.localTimeString, this.localTimeString, accountControl.userID, accountControl.sharedName, note]);
		else { //edit current note
			for (i = 0; i < this.noteList.length; i++) {
				if (this.noteList[i][noteControl.ID] == noteID) {
					if (this.noteList[i][noteControl.userID] == accountControl.userID) {
						foundNote = true;
						break;
					}
				}
			}

			if (foundNote == true) {
				this.noteList[i][noteControl.title] = titleAN;
				this.noteList[i][noteControl.To] = ToAN;
				this.noteList[i][noteControl.tagType] = tagType;
				this.noteList[i][noteControl.tag] = tag;
				this.noteList[i][noteControl.purpose] = purpose;
				this.noteList[i][noteControl.modifyDate] = this.localTimeString;
				//this.noteList[i][noteControl.userID]=accountControl.userID;
				//this.noteList[i][noteControl.displayName]=accountControl.sharedName;
				this.noteList[i][noteControl.note] = note;
				noteControl.makeNoteListText(showDialog);
			}
			else
				util.openModalBox("Error getting ID of Note " + noteID, "Error: Note ID");
		}
	},
	processToAN: function () {
		if (document.getElementById('ToAN').value == "group")
			if (accountControl.hasGroup == false) {
				util.openModalBox("To Share With a group you must first join a group<br><br>Use the account button (<button class='smallBtn fa fa-users'></button>) is in the top right hand corner.", "No group selected yet.");
			}
			else {
				document.getElementById('toSubOptions').innerHTML = "Select Group: <input id='toGroup' class='optionItems' list='groupDataList'>" + accountControl.groupDataList;
				document.getElementById('toSubOptions').style.display = "block";
			}
		else //not groupAN
			document.getElementById('toSubOptions').style.display = "none";
	},
	makeNoteListText: function (showDialog) {
		this.listNoteText = "<table><tr><th>Edit</th><th>Purpose</th><th>Title</th><th>To</th><th>Tagged</th><th>Create Date</th><th>Modified Date</th><th>Written By</th><th>Del</th></tr>";
		for (i = 0; i < this.noteList.length; i++) {
			if (this.noteList[i][this.purpose] != "") {
				if (this.noteList[i][this.userID] == accountControl.userID)
					this.listNoteText = this.listNoteText + '<tr><td><i onclick=\"noteControl.openWritingEditor(0,\'' + this.noteList[i][this.ID] + '\',0,\'\');\" class=\"fa fa-edit\" title=\"Edit\"></i></td>';
				else
					this.listNoteText = this.listNoteText + '<tr><td> </td>';

				this.listNoteText = this.listNoteText + "<td>" + this.noteList[i][this.purpose] + "</td><td>" + this.noteList[i][this.title] + "</td><td>" + this.noteList[i][this.To] + "</td><td>" + this.noteList[i][this.tagType] + "</td><td>" + this.noteList[i][this.createDate] + "</td><td>" + this.noteList[i][this.modifyDate] + "</td><td>" + this.noteList[i][this.displayName] + "</td>";
				if (this.noteList[i][this.userID] == accountControl.userID)
					this.listNoteText = this.listNoteText + '<td><i onclick=\"noteControl.deleteNote(' + this.noteList[i][this.ID] + ');\" class=\"fa fa-trash\" title=\"Delete\"></i></td></tr>'
				else
					this.listNoteText = this.listNoteText + '<td> </td></tr>';
			}
		}
		this.listNoteText = this.listNoteText + "</table>";

		if (showDialog == true) {
			document.getElementById('wordStudyBoxMain').innerHTML = noteControl.listNoteText;
			document.getElementById('wordStudyBoxHeader').innerHTML = "Writings List";
			document.getElementById('wordStudyBox').style.display = 'block';
		}
	},
	showNote: function (noteID, userID) {
		var i = 0;
		var foundIt = false;

		for (i = 0; i < this.noteList.length; i++)
			if (this.noteList[i][this.ID] == noteID) {
				if (this.noteList[i][noteControl.userID] == userID) {
					foundIt = true;
					break;
				}
			}
		if (foundIt == false) {
			util.openModalBox("System Error: unable to get Note by ID", "Finding Note Error");
			return;
		}
		document.getElementById('wordStudyBoxMain').innerHTML = this.noteList[i][this.note];
		document.getElementById('wordStudyBoxHeader').innerHTML = this.noteList[i][this.purpose] + ":" + this.noteList[i][this.title] + "<span style='position:absolute; right:32px'>" + this.noteList[i][this.displayName] + "</span>";
		document.getElementById('wordStudyBox').style.display = 'block';
	},
	deleteNote: function (noteID) {
		var foundNote = false;
		var i = 0;
		for (i = 0; i < this.noteList.length; i++) {
			if (this.noteList[i][noteControl.ID] == noteID) {
				if (this.noteList[i][noteControl.userID] == accountControl.userID) {
					foundNote = true;
					break;
				}
			}
		}

		if (foundNote == true) {
			if (confirm("delete " + noteControl.noteList[i][noteControl.purpose] + " entitled " + noteControl.noteList[i][noteControl.title] + "?") == true) {
				$.post("deleteWriting.php", {
					noteID: noteID
				},
					function (result) {
						if (result.includes("Writing deleted") == true) {
							noteControl.noteList[i][noteControl.title] = "";
							noteControl.noteList[i][noteControl.To] = "";
							noteControl.noteList[i][noteControl.tagType] = "";
							noteControl.noteList[i][noteControl.tag] = "";
							noteControl.noteList[i][noteControl.purpose] = "";
							noteControl.noteList[i][noteControl.modifyDate] = "";
							noteControl.noteList[i][noteControl.note] = "";
							noteControl.makeNoteListText(true);
						}

						util.openModalBox(result, "Delete Writing Result")
					});
			}
		}
	},

} //end object noteControl
    
var makeAudioDataFile= {   
	//used to fill (and reset?) the second for each verse start in an audio Bible 
	// (Already need the audiofile and meta tables) 
	
	timelen:0,
	wordCount:0,
	MetaID:0,  //NEW - will be read from Developer Area entry
	MatchVersion:"VER",
	MatchBook:-1, //will be read from Developer Area entry
	MatchBook2:-1, //will be read from Developer Area entry
	IntroLen:-1,    //Def 4  ERV 3  BYZ 2 
	BookIntroLen:-1,  //Def 6  ERV 12
	EndingLen:-1,    //Def 2  ERV 7  BYZ 0
	PunctAfterLen:-1, //Def 0.02  ERV 0.08
	ActiveRow:-1,
	CVWlen:2, //length for Chap, Verse, Word.  Is 3 for Psalms.

	findVoiceFileDataRow: function(mb) {
		for (let i = 1; i < window["voiceFileData"].length; i++) {
			if ( window["voiceFileData"][i][7] == mb && window["voiceFileData"][i][13] == this.MetaID )
				return i;
		}
		return -1;
	},

	makeTimingFile: function(){  //This reads from the first to last book entered - it runs computeTiming() for each book. 
		this.MetaID=document.getElementById("DA-MtID").value;
		this.MatchBook=document.getElementById("DA-BS").value;
		this.MatchBook2=document.getElementById("DA-BE").value;
		this.MatchVersion=audioFileMeta[this.MetaID][1];
		this.IntroLen=audioFileMeta[this.MetaID][11]; 
		this.BookIntroLen=audioFileMeta[this.MetaID][12]; 
		this.EndingLen=audioFileMeta[this.MetaID][13]; 
		this.PunctAfterLen=audioFileMeta[this.MetaID][14];
	
		
		for (let i=this.MatchBook;i<=this.MatchBook2;i++) {
			//console.log("Doing Book " + i);
			this.ActiveRow=this.findVoiceFileDataRow(i);
			//console.log ("voiceFileData Active Row:" + this.ActiveRow + " Active Row Book:" + voiceFileData[this.ActiveRow][7] );
			if (this.ActiveRow>-1){
				this.computeTiming(voiceFileData[this.ActiveRow][7]);
			}
		}		
	},
	computeTiming: function(MB){
		let timeAt=0;
		let timeLeft=-1;
		let timeInterval=-1;
		let timingBy=22;
		let j=0;
		let k=0;
		let i=0;
		let chp=1;
		//get Book Data and column intervals
		let bibFN=window["B" + bibleBookData[MB][8] + this.MatchVersion];
		let iID=getColumnIncre(bibFN[0],"id"); //get the column increment whose title matches
		let iPuncAft=getColumnIncre(bibFN[0],"PunctAfter"); //ditto
		let puncCnt=0;
		let refLen=util.refPadCount(MB);
		let firstWord=util.padNum(1,refLen); 
		let fileID=0;

		//Read for each chapter in this book
		if (voiceFileData[this.ActiveRow][4]=="Chapter"){ 
			while (voiceFileData[this.ActiveRow][7]==MB){ //Read voiceFileData for each chapter in this book
				if (voiceFileData[this.ActiveRow][8]==1) //first Chapter may have book intro
					timeAt=this.BookIntroLen;
				else
					timeAt=this.IntroLen;
				timeLeft=voiceFileData[this.ActiveRow][12]-timeAt;
				//get count for each punctuation of [,;.? etc]
				puncCnt=0;
				// for (i=j;i<j + voiceFileData[this.ActiveRow][11];i++)  //voiceFileData[this.ActiveRow][11] is the total number of words in this audio file section					if (typeof (bibFN[i][iPuncAft]) != 'undefined') //bibFN[i][iPuncAft].includes(",")==true || bibFN[i][iPuncAft].includes(".")==true || bibFN[i][iPuncAft].includes(";")==true || bibFN[i][iPuncAft].includes("!")==true || bibFN[i][iPuncAft].includes("?")==true)
				// 		puncCnt++;
				//WRONG ABOVE? Doesn't it need to only count IF the Bible Book Data has a ",;.?!" in the words row? 
				timeInterval=(timeLeft - (puncCnt* this.PunctAfterLen + this.EndingLen))/voiceFileData[this.ActiveRow][11];
				//puncCnt=0;     //above was (timeLeft - (puncCnt* this.PunctAfterLen)) divided by the total number of words in this audio file section 

				//***************** Create Timing Table for this voice File ***************/
				//loop through every word in Bible Data File for this section
				fileID=voiceFileData[this.ActiveRow][0];	
				for (i=1;i<=voiceFileData[this.ActiveRow][11];i++){ 
					if (Number(bibFN[j+i][iID].substring(0,refLen))==voiceFileData[this.ActiveRow][8]) 
						if ( bibFN[j+i][iID].slice(-refLen)==firstWord) {
							//this.saveTiming(fileID,Number.parseFloat(timeAt).toFixed(2),bibFN[j+i][iID].substring(0, 2),bibFN[j+i][iID].substring(2, 4),"01");
							console.log (fileID + "," + Number.parseFloat(timeAt).toFixed(2) + "," + timingBy + "," + bibFN[j+i][iID].substring(0, 2) + "," + bibFN[j+i][iID].substring(2, 4) + ",01")
						}	
					else
						if (typeof (bibFN[i][iPuncAft]) != 'undefined') 
							puncCnt= this.PunctAfterLen;
						else
							puncCnt=0;	 
						
					timeAt += timeInterval + puncCnt;	 
					}
					chp++;
					

					j=util.findRowIn2DArr("B" + bibleBookData[MB][8] +this.MatchVersion,iID,util.padNum(chp,refLen) + util.padNum(1,refLen)+ util.padNum(1,refLen));
					j=j-1;
					this.ActiveRow++;
			}	
			//this.ActiveRow=-1;
		}
		else if (voiceFileData[this.ActiveRow][4]=="Book"){
			//while (voiceFileData[this.ActiveRow][7]==MB){ //Read voiceFileData for each chapter in this book
			////console.log(this.MatchVersion + MB + "=[");
			timeAt=this.BookIntroLen;
			timeLeft=voiceFileData[this.ActiveRow][12]-timeAt;


			puncCnt=0;
			for (i=j;i<j + voiceFileData[this.ActiveRow][11];i++)
				if (typeof (bibFN[i][iPuncAft]) != 'undefined') 
					puncCnt++;
			timeInterval=(timeLeft - (puncCnt* this.PunctAfterLen + this.EndingLen))/voiceFileData[this.ActiveRow][11];
			puncCnt=0;    


			//***************** Create Timing Table for this voice File ***************/
			//loop through every word in Bible Data File for this section
			for (i=1;i<bibFN.length;i++){ 
				if ( bibFN[i][iID].slice(-2)=="01") { 
					////console.log("['" + bibFN[i][iID] + "','"+ bibFN[i][iWord] + "'," + Number.parseFloat(timeAt).toFixed(2) + "],");
				}
				if (typeof (bibFN[i][iPuncAft]) != 'undefined') 
					puncCnt= this.PunctAfterLen;
				else 
					puncCnt=0;		 					
				timeAt += timeInterval + puncCnt;	 
			}	
			////console.log("];");
		}							
	},

	saveTiming: function (fileID, timing, chapRef, verRef, wordRef) {
		let i = 0;
		$.post("saveTiming.php", {
			FileID: fileID,
			Timing:timing,
			ChapRef:chapRef,
			VerRef:verRef,
			WordRef:wordRef
		},
		function (result) {
			console.log (result);  
			//console.log("php saved " + ChapRef + VerRef + WordRef + " settings in fileID of " + fileID + " with timing of " + timing);
		}
		);
	},

	//DONE (getFirstTimingLength & getTimingLength)  open voice file for length  (chap or book?)
	//DONE on PC - count words for that version 
	// divide length by number of words to get estimate of chapters/verses/sentences
	// save to db by userid. 
	//*********** Enable editing of the auto marking of chapters/verses/sentences
	//select edit option
	//dialog box with auto play of each chapter/verse/ or sentence
	//listen to audio and find in text? 
    getFirstTimingLength: function(){        
		makeAudioDataFile.rowNum=util.findRowIn2DArr("voiceFileData",1,makeAudioDataFile.MatchVersion);
		////console.log(voiceFileData[makeAudioDataFile.rowNum][0]);
		if (makeAudioDataFile.rowNum > -1){
				document.getElementById("ScriptureHeaderAudio1").src = voiceFileData[makeAudioDataFile.rowNum][2] + "\\" +  voiceFileData[makeAudioDataFile.rowNum][3];
				voiceControl0.setDuration();
				setTimeout(makeAudioDataFile.getTimingLength,2000);
		}	
	},
	getTimingLength(){
		let i=makeAudioDataFile.rowNum;
		let str="";
		////console.log("ID nd Ver: " + voiceFileData[i][0] + voiceFileData[i][1] );
		str="['" + voiceFileData[i][0] + "','" + voiceFileData[i][1] + "','" + voiceFileData[i][2] + "','"  + voiceFileData[i][3] + "','" + voiceFileData[i][4] + "','" + voiceFileData[i][5] + "','" + voiceFileData[i][6] + "'," + voiceFileData[i][7] + "," + voiceFileData[i][8] + ",," + voiceFileData[i][10] + "," + voiceFileData[i][11] + "," + voiceControl0.TimeToSeconds(voiceControl0.duration) + "],"
		////console.log(str);
		
		i++; 
		makeAudioDataFile.rowNum=i;
		if (voiceFileData[i][1]==makeAudioDataFile.MatchVersion){
			document.getElementById("ScriptureHeaderAudio1").src=voiceFileData[i][2] + "/" +  voiceFileData[i][3];
			voiceControl0.setDuration();
			setTimeout(makeAudioDataFile.getTimingLength,2000);
		}

			// setVoiceFileDuration(incre){
	// 	let pend = document.getElementById("ScriptureHeaderAudio" + incre).currentTime;
	// 	let i= document.getElementById("ScriptureHeaderAudio"+ incre).duration;
	// 	if(isNaN(i)) {
	// 		setTimeout(window["VoiceControl" + incre].setVoiceFileDuration,100,incre);
	// 		return;
	// 	}
	// 	else
	// 		VoiceControl.duration=VoiceControl.SecondsToTime(i);
	// 	document.getElementById("AudioTime" + incre).innerHTML = VoiceControl.SecondsToTime(pend) + "/" + VoiceControl.duration;
	// }
	}
}
// window.speechSynthesis.onvoiceschanged = function() {
   
// }	

class BibleRef {
	constructor(windowID) {    
		this.refList = "";       	//this is the reference for computer usage such as 60001001-60001003WEB; separate multiple references with a semicolon(;)
		this.version = "";    		//Keep? or add to RefList //computed           !used all over  
		this.language ="English";
		this.versionArray=[];
		this.topic = "";            // entered 
		this.windowID = windowID;  	//must match to a ScriptureWindow windowID 
		this.refEntered = ""; 		//this is the reference as entered by the user such as 1 Peter 1:1-3
		this.isRefValid = false;	//computer setting   !used to stop version change from trying to load if reference was invalid
		this.initialLoad = true;	//computer setting  keep? !used to force ChangeVersion call to load even if version is the same 
		this.refText = "";			//computed			 !used to put human readable reference in the reference input line 	
		this.refFromTo="";			//computed  changes each reference to matching from-to with BCVW format 60010101-60010125 or 19001001001  
		this.bookNam = "";          //computed - used to get refList to determine if new book or use previous
		this.bookNum = "";			//computed		!used to grab BookNum in multple reference with a single listing of Book title - Rom 3:23; 10:28 	
		this.ScrollToId = "";       //move to SW? 
		this.prevChapter = "0";     //computed  used to grab chapter in multple reference with a single listing of Chapter number - Rom 3:23,29
		this.RHNum = "000";         //is this needed?  Used to tie reference with reference history
		this.createDate = Date.now();    //
		this.modifyDate = this.createDate;    // to add to history - to sort it and to remove if not used
		this.lastUsedDate = this.createDate;  //
		this.multipleBooks=false;  //set in uncoverGodsWord
		this.refCount=0; 			//set in uncoverGodsWord
	}
	clearBibleRef(){
		this.isRefValid = false;
		this.refList = "";
		this.refText = "";
		this.refFromTo = "";
		this.RHNum=""; 
		this.bookNam = "";
		this.bookNum = "";
		//window["VoiceControl"+ this.windowID].bookNum=this.bookNum; //sync with audio to prevent loading wrong audio to RH
		window["VoiceControl"+ this.windowID].currentTime=0;
		this.ScrollToId = "";
		this.multipleBooks=false;
		this.versionArray=[];
		this.refWordArr=[];
		window.speechSynthesis.cancel();
	}
	changeVersion(ver) {  //this only run when a person changes the version
		////console.log("In changeVersion for " + ver);
		let i = 0;
		let j = 0;
		let scrollGuessId="";
		//If same version (and has text) then STOP
		if (this.version === ver) {
			$("#VerDD" + this.windowID).hide();
			if (document.getElementById("Scripture" + + this.windowID).innerHTML.substr(0, 20) != "The selected book of")
				return;
		}
		//Not have versions listed available yet.
		//if (ver=="BRG") {
		//   util.errmsg("Scripture" + this.windowID, "The BRG Version is not yet available. Check back soon.");
		//   return;
		//}
		//If reference not valid then STOP
		if (this.isRefValid === false) {
			util.openModalBox("Please re-enter the reference before changing the version.");
			return;
		}
		//get ScrollToIdD of a top word //mark verse object to keep the same place in new viersion
		scrollGuessId=get1stVerseInViewport(this.windowID, this.version);
		if (scrollGuessId!="")
			this.ScrollToId = scrollGuessId;

		//If Refence Book NOT in new Version then STOP
		i = util.getVersionrow(ver); //inPSD
		j = Number(this.bookNum);
		if (versionData[i][3].indexOf(bibleBookData[j][3]) == -1) {
			util.errmsg("Scripture" + this.windowID, "The selected book of " + bibleBookData[j][1] + " is in the " + bibleBookData[j][3] + ". But the " + versionData[i][1] + " version only has the " + versionData[i][3] + ".");
			$("#VerDD" + this.windowID).hide();
			return;
		}

		//save the ver to the BibleRef object
		this.version = ver;
		//clear voiceControl settings
		//window["VoiceControl"+ this.windowID].reset();

		// call process Scripture Data
		uncoverGodsWord.processScriptureData(this.windowID,false);
	}
	parseRefEntered() {
		var refr = document.getElementById('enterVerse' + this.windowID).value;
		 ////console.log("In parseRefEntered for " + refr);
		 ////console.log("In parseRefEntered old text " + this.refText);	
		var i = 0;
		var refp = [];
		var checkRef = "";
		var refBreakChar = "";
		let chkchr="";
		let rowI=-1;
		let prevRefText=this.refText;

		//exit if the reference entered is blank
		if (refr.length === 0) {
			return;
		}

		//exit if the reference is the same
		if (((refr === this.refEntered) || (refr === this.refText)) && (this.isRefValid === true))
			return;
			

		//update to RH BEFORE loading new reference entered.
		// ????/ if updating every time RHupdated then it should be fine? 
		// The "if" should be finding RHrow or not ((this.RHNum!="0") && (this.RHNum>-1))
		RH.updateRHRow(this.windowID, this.RHNum);

		//clear reference data   
		this.clearBibleRef();

		//********   Do a lot of refEntered cleanup/prep **************************/
		this.refEntered = refr;

		//do a lot of  clean up
		refr = refr.replace(/%20/g, " ");
		refr = refr.replace(/%3A/g, " ");
		while (refr.includes("+") == true)
			refr = refr.replace("+", " ");

		while (refr.includes(".") == true){	
			chkchr=refr.substring(refr.indexOf(".")-1,refr.indexOf("."));
			if (isNaN(chkchr))
				refr = refr.replace(".", "");
			else
				refr = refr.replace(".", ":");
		}
			refr = refr.replace(".", " ");

		while (refr.includes("–") == true)
			refr = refr.replace("–", "-");

		while (refr.includes(",") == true)
			refr = refr.replace(",", ";");
		//replace all double spaces with single spaces
		while (refr.indexOf("  ") > -1) {
			refr = refr.replace(/  /g, " ");
		}
	
		//Split Reference
		refp = refr.split(";");
		if (refp[refp.length - 1] === "")
			refp.pop();

		//exit if array length is 0
		if (refp.length === 0) {
			return;
		}
	
		for (i = 0; i < refp.length; i++) {
			//still more references cleanup process   
			// remove space between first character of 1 or 2 or 3 or 4 and the book name
			refp[i] = refp[i].replace(/1 /g, "1");
			refp[i] = refp[i].replace(/2 /g, "2");
			refp[i] = refp[i].replace(/3 /g, "3");
			refp[i] = refp[i].replace(/4 /g, "4");

			refp[i] = MakeSpaceBeforeNumber(refp[i]);

			refp[i] = refp[i].toUpperCase();
			//remove spaces in Song of Solomon
			if (refp[i].includes("G O"))
				refp[i] = refp[i].replace("G O", "GO");
			if (refp[i].includes("F S"))
				refp[i] = refp[i].replace("F S", "FS");

			if (refp.length == 1) { //only has book
				refp[i] = refp[i].replace(/ALL/g, " ALL ");
				refp[i] = refp[i].replace(/  ALL/g, " ALL");
				refp[i] = refp[i].replace(/ALL  /g, "ALL ");
			}
			else
				//Stop if loading a full book & more than one reference
				if (refr.toUpperCase().includes("ALL") == true) {
					util.openModalBox("Cannot load complete books and multiple references", "Error in Reference");
					return;
				}

			//************** Call the function that parses each reference separately   ****************/	
			//parse Single Reference return BCV like 600010
			checkRef = this.parseSingleRefEntered(refp[i], i);
			//exit if an Error on a reference
			if (checkRef === "Error!")
				break;
			//check if book has that many chapters
			if (Number(checkRef.substr(2, 3)) > bibleBookData[Number(checkRef.substr(0, 2))][2]) {
				util.errmsg("Scripture" + this.windowID, "The selected book of " + bibleBookData[Number(checkRef.substr(0, 2))][1] + " only has " + bibleBookData[Number(checkRef.substr(0, 2))][2] + " chapters.");
				checkRef = "Error!";
				break;
			}

			if (this.refList !== "")
				refBreakChar = ";";

			this.refList = this.refList + refBreakChar + checkRef;
		}
		if (checkRef === "Error!")
			return;

		//made it to here it must be good reference
		this.isRefValid = true;
		this.refText= buildRefText(this.refList,1);

		document.getElementById('enterVerse' + this.windowID).value = this.refText;

		//if same refText then exit
		if(prevRefText==this.refText) { //same reference as in now
			document.getElementById("enterVerse" + this.windowID).value=this.refText;	
			return; 	
		}
		//If in History pull RH row & load2SW else  -
		//-else add to RH row  - call PSD directly  
		if (this.topic.length>1) {//If topic then update topic reference and process
			rowI=RH.findRow(RH.iTopic,this.topic);
			if (rowI>-1){
				this.RHNum=RH.Arr[rowI][RH.iRHId].replace("RH","");
				RH.updateRHRow(this.windowID,this.RHNum);
			}	
		}				
		else
			rowI=RH.findRow(RH.iRefList,this.refList,RH.iTopic);

		if (rowI >= 0){   
			this.RHNum=RH.Arr[rowI][RH.iRHId].replace("RH","");
			RH.load2SW(this.windowID,this.RHNum);	
		}	  
		else { //not in history - Creating NEW RH
			//clear voiceControl RH data
			//voiceControl.timingFile="";
			window["VoiceControl"+ this.windowID].currentTime=0;
			this.ScrollToId = this.version + this.refList.substring(0,2) + getRefCVW(this.refList,this.version,true)+ "-" + this.windowID;
			if(this.refList.includes(";")==true && this.topic=="") //first entry of multiple ref
				openTRBox(this.windowID);
			else {		
				RH.addToRH(this.windowID); 
				uncoverGodsWord.processScriptureData(this.windowID,false);
			}
		}	
	}
	parseSingleRefEntered(refr, cntCurrentLoop) {
		var i = 0;
		var BookNum = 0;
		var bNStr = "00";
		var cStr = "000";
		var Booknam = "";
		var refp = [];
		var bookHasOneChap = false;
		var numType = "!";
		var buildRefList = "";

		let slice2i=-1;
		let slice3i=-1;

		//should be no semicolons, so remove if exist.
		refr = refr.replace(/;/g, "");
		//remove a beginning or ending space
		refr = refr.trim();
		
		//check if ends in a version add to versionArr with default version or entered version
		slice2i=util.findRowIn2DArr("versionData",1,refr.slice(-2));
		slice3i=util.findRowIn2DArr("versionData",1,refr.slice(-3));
		if (slice3i>-1){
			this.versionArray.push(versionData[slice3i][0]);
			refr=refr.substring(0,refr.length-3);
		}	
		else if (slice2i>-1){
			this.versionArray.push(versionData[slice2i][0]);
			refr=refr.substring(0,refr.length-2);
		}	
		else
			this.versionArray.push(this.version);
		
		//Add space at the end if no space all (i.e. 2John) 
		if (!refr.includes(" "))
			refr = refr + " ";
	

	
		//parseSingleRefEntered=function - get book
		Booknam = refr.substring(0, refr.indexOf(" "));
		BookNum = this.getBookNumberFromEnteredName(Booknam);
		//check if valid BookNum was found
		if (BookNum === 0) {
			if (Number(cntCurrentLoop) === 0) {
				//if there is no book and this is the first reference then exit
				util.errmsg("Scripture" + this.windowID, "Cannot find a matching book by the name " + Booknam);
				this.isRefValid = false;
				return "Error!";
			}
			else {
				//no book in this reference so use the previous book. This is for reference such as Romans 3:23; 10:9;
				////console.log("Reference before adding Book and chapter:" + refr);
				BookNum = this.bookNum;
				if (refr.includes(":") == false) //need to add chapter also
					refr = bibleBookData[BookNum][8] + " " + this.prevChapter + ":" + refr;
				else
					refr = bibleBookData[BookNum][8] + " " + refr;
				////console.log("Reference after adding Book and chapter:" + refr);
				////console.log("Assigned book of " + Booknam + " to " + BookNum + " based on previous book in reference. This is for reference such as Romans 3:23; 10:9; ");
			}
		}

		if (Number(bibleBookData[BookNum][2]) === 1) {
			bookHasOneChap = true;
		}

		//set BibleRef Book Properties
		this.bookNum = Number(BookNum);
		this.bookNam == bibleBookData[BookNum][1];

		bNStr = util.padNum(BookNum, 2);

		//ensure there is at least one space to indexOn. This will be removed 
		refr = refr + " ";
		//Remove Book name portion
		refr = refr.substring(refr.indexOf(" ") + 1);
		//Remove all spaces 
		refr = refr.replace(/ /g, "");

		//!!!!!   Whole Book Check won't work if the Version ends the reference!!!!	

		//Whole Book load of Book with one chapter
		if (bookHasOneChap === true && ((refr.length == 1 && refr[0] == 1) || (refr.length == 0))) {
			buildRefList = bNStr + "001000"
			return buildRefList;
		}

		//Whole Book load as shown by no chapter entered or "ALL"
		if ((refr.length === 0 || refr === "ALL")) {
			buildRefList = bNStr + "000000"
			return buildRefList;
		}


		//********************************************** parse the number part of reference *************************************
		//Add spaces before and after connectors so that it can split on them and number
		refr = refr.replace(/-/g, " - ");
		refr = refr.replace(/:/g, " : ");
		refr = refr.replace(/,/g, " , ");
		refr = refr + " ";
		refp = refr.split(" ");
		//ensure starts and ends with a number and has a connector between each number...!!!!!!!!!!!!!!!!!


		//			if (isNaN(refp[1])==true){
		//					util.errmsg("Scripture" + this.windowID, "Cannot read the chapter number. Instead of a number it shows as " + refp[1]);	
		//					this.isRefValid=false;
		//					return;

		//if only one number after Book then process the Chapter verse and return it.
		if (refp.length === 2) {
			if (bookHasOneChap === true) {
				buildRefList = bNStr + "001" + util.padNum(refp[0], 3)
				this.prevChapter = "1";
			}
			else {
				buildRefList = bNStr + util.padNum(refp[0], 3) + "000";
				this.prevChapter = refp[0];
			}
			return buildRefList;
		}

		//number refrence has more than 1 number		
		//set the easy global numtypes
		if (refr.includes(":") === false)
			if (bookHasOneChap === true)
				numType = "verse";
			else
				numType = "chap";

		//?????  seems to work without the cryptic thoughts below. Not sure if it is needed.
		//add a last connector of "!" so that it is always a [number][connector] pair. 		
		//		refp.push("!");

		//Start first pair
		switch (numType) {
			case "!":
				for (i = 0; i < refp.length; i = i + 2) {
					if (refp[i + 1] === ":") {
						cStr = util.padNum(refp[i], 3);
						this.prevChapter = refp[i];
					}
					else
						buildRefList = buildRefList + bNStr + cStr + util.padNum(refp[i], 3) + refp[i + 1];
				}
				//buildRefList = buildRefList.replace("!", ";");
				return buildRefList;
				break;
			case "chap":
				for (i = 0; i < refp.length; i = i + 2) {
					buildRefList = buildRefList + bNStr + util.padNum(refp[i], 3) + "000" + refp[i + 1];
					this.prevChapter = refp[i];
				}
				//buildRefList = buildRefList.replace("!", ";");
				return buildRefList;
				break;
			case "verse":
				cStr = "001";
				this.prevChapter = "1";
				for (i = 0; i < refp.length; i = i + 2) {
					buildRefList = buildRefList + bNStr + cStr + util.padNum(refp[i], 3) + refp[i + 1];
				}
				//buildRefList = buildRefList.replace("!", ";");
				return buildRefList;
		}
	}
	getBookNumberFromEnteredName(Booknam) {
		var BookNum = 0;
		var i = 0;
		//check by unique start
		for (i = 1; i < 86; i++) {
			if (Booknam.indexOf(bibleBookData[i][4]) == 0) {
				BookNum = Number(i);
				break;
			}
		}
		//console.log("First check of book for " + Booknam + " is " + BookNum);
		
		//check by start with and contains
		if (BookNum === 0) {
			for (i = 1; i < 86; i++) {
				if (bibleBookData[i][5] !== "9") {
					if ((Booknam.indexOf(bibleBookData[i][5]) === 0) && (Booknam.lastIndexOf(bibleBookData[i][6]) > 0)) {
						BookNum = Number(i);
						break;
					}
				}
			}
			//console.log("Second check of book for " + Booknam + " is " + BookNum);
		}
	
		//some common defaults 
		if (BookNum === 0) {
			if (Booknam.includes("JUD")==true)
					BookNum=65; //book of Jude
			else if (Booknam.substr(0,2)=="PH")
					BookNum=49; //Philippians	
			//console.log("Fourth check of book for " + Booknam + " is " + BookNum);

		}	


		//check on one more possible match
		if (BookNum === 0) {
			for (i = 1; i < 86; i++) {
				if (bibleBookData[i][7] != 9) {
					if (Booknam.indexOf(bibleBookData[i][7]) == 0) {
						BookNum = Number(i);
						break;
					}
				}
			}
			//console.log("Third check of book for " + Booknam + " is " + BookNum);
		}

		return Number(BookNum);

	}
	fillRefFromTo(callVoiceControlStart=true) {
	//called from uncoverGodsWord.displayScripturE.  This calls VC.startAudioFileProcesS 
	let refListArr=this.refList.split(";");
	let semicolon="";
	//clear current values
	this.refFromTo="";	

	for (let j=0;j<refListArr.length;j++){
		if (j==1)
			semicolon=";"; //change from "" to ";" on second pass to use between each refItem
		if (this.versionArray.length==refListArr.length)
			this.refFromTo+=semicolon + this.reformat2RefFromTo(refListArr[j],this.versionArray[j]);
		else
			this.refFromTo+=semicolon + this.reformat2RefFromTo(refListArr[j],this.version);				
		}
		//console.log ("br.refFromTO:" + this.refFromTo);
		if (callVoiceControlStart==true)
			window["VoiceControl" + this.windowID].startAudioFileProcess(this.version,this.refFromTo);
	}
	reformat2RefFromTo(refListItem,version="WEB", includesBook=true){
		//just one reference - may be 8 character like BCV 60-001-000 or a "from and to" in that BCV format 60001010-600010017 
		let i=1;
		let k=1;
		let bookNum=refListItem.substring(0,2);
		let bookNam=bibleBookData[Number(bookNum)][8];
		let CVW = getRefCVW(refListItem,version,false,false); 
		//CVW will be a length of 2 or 3 for each C,V, and W value. Book is always 2. 
		let pnum=0;
		let nines="";
		if(CVW.length==17 || CVW.length==13){
			pnum=2;   //bbccvvww-bbccvvww 8-8  OR ccvvww-ccvvww 6-6
			nines="99";
		}	
		else if (CVW.length==23 || CVW.length==19) {
		 	pnum=3; //bbcccvvvwww-bbcccvvvwww 11-11 OR cccvvvwww-cccvvvwww 9-9
			nines="999";
		}
		 else {
			console.error ("CVW length is incorrect.");
			return "-1";
		}

		let zeroOne=util.padNum(1,pnum); //01 or 001
		let startAt = CVW.substring(0, 3*pnum);  //chapter verse word order that reference starts at
		let endAt = CVW.substring(3*pnum+1); //grab CVW ref after dash

		//console.log ("startAt:" + startAt + "  endAt:"+ endAt);
		
		//get Bible book data.   
		let wordArr = window["B" + bookNam + version];
		//added for clarity in coding below
		let lastCh=util.padNum(bibleBookData[Number(bookNum)][2],pnum);
		let endAtCh=endAt.substring(0,pnum);
		let endAtChVs=endAt.substring(0,pnum+pnum);
		let lastVs="00";
		let endAtVs="00";

		if (nines.repeat(3)==endAt){  //CVW of 999999 or 999999999 shows is a full book
			//replace startAT Chapter of 00 or 000 with 01 or 001
			startAt=zeroOne.repeat(3); //the getRefCVWW function only has the wrong startAT for full book because it leaves chapter as 00
			//replace endAT all 9s with last CVW reference
			endAt=wordArr[wordArr.length-1][0];
		}
		else if (endAt.slice(0-(pnum+pnum))==nines.repeat(2)){  //has chapter but 9s for VW
			if (endAtCh==lastCh)
				endAt=wordArr[wordArr.length-1][0];
			else { //not last chapter of booK so find first row on next chapter and step back one.
				i=util.findRowIn2DArr("B" + bookNam + version,0,util.padNum(Number(endAtCh)+1,pnum) + zeroOne.repeat(2));
				if (i==-1){ //error return "-1"
					console.error("Could not find row in Bible data"); return "-1";				
				}
				endAt=wordArr[i-1][0];
			}	
		}
		else if(endAt.slice(0-pnum)==nines) {  //only the Word has 9s 
			//if last chap and verse then get last ref from Book
			endAtVs=endAt.substring(pnum,pnum+pnum);
			lastVs=util.padNum(getTopVerse(Number(bookNum),endAtCh),pnum); 
			if (endAtCh==lastCh && endAtVs==lastVs)
				endAt=wordArr[wordArr.length-1][0];
			else { //find first ref for CV and increment until the CV changes. Then get the ref before CVW.
				i=util.findRowIn2DArr("B" + bookNam + version,0, endAtChVs + zeroOne);
				if (i==-1){ //error return "-1"
					console.error("Could not find row in Bible data"); return "-1";				
				}
				for (k=i; k < wordArr.length; k++)
					if (endAtChVs != wordArr[k][0].substring(0,pnum+pnum)) {
						break;
					}	
				endAt=wordArr[k-1][0];
			}					
		}
		if (includesBook==true)
			return bookNum + startAt + "-" + bookNum + endAt;					
		else		
			return startAt + "-" + endAt;					
	}
	clearVideoLinks() {
		//console.log("In clearVideoLinks");
		document.getElementById("ScriptureHeaderLinks" + this.windowID).style.display = 'none';
		document.getElementById("ScriptureHeaderLinksB" + this.windowID).style.display = 'none';
		document.getElementById("ScriptureHeaderLinksC" + this.windowID).style.display = 'none';
		document.getElementById("ScriptureHeaderLinksD" + this.windowID).style.display = 'none';
		document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "none";
		document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "none";
		document.getElementById("ScriptureHeaderLinksDttt" + this.windowID).innerHTML = "Visual Bible Movie - Word for Word using Good News Translation"

	}
	setVideoLinks() {  
		this.clearVideoLinks();
		//console.log("In saveVideoLinks");
		var addedVideo = false;
		let bookNum=Number(this.bookNum);
		if (bookNum != 0) {
			//set Bible project 1 or 2 video links
			if (bibleBookData[bookNum][9] != '9') {
				document.getElementById("ScriptureHeaderLinks" + this.windowID).href = bibleBookData[bookNum][9];
				document.getElementById("ScriptureHeaderLinks" + this.windowID).style.display = 'inline';
				addedVideo = true;
			}
			if (bibleBookData[bookNum][10] != '9') {
				document.getElementById("ScriptureHeaderLinksB" + this.windowID).href = bibleBookData[bookNum][10];
				document.getElementById("ScriptureHeaderLinksB" + this.windowID).style.display = 'inline';
			}

			if (bookNum >= 40 && bookNum <= 43) {
				var linkVid3 = document.getElementById("ScriptureHeaderLinksC" + this.windowID);
				var linkVid4 = document.getElementById("ScriptureHeaderLinksD" + this.windowID);

				switch (bookNum) {
					case 40:
						linkVid3.href = "https://www.youtube.com/watch?v=VED-6OkM7Js&list=PLcJVIuhI8isJJgv2R7PgPTFK5hpZSwckj";
						linkVid4.href = "https://youtu.be/woAhReBytBk";
						document.getElementById('ScriptureHeaderLinksImgD' + this.windowID).src = "Image/TheVisualBible.jpg";
						document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=9edidowCjVk&list=PLPHfRgSDBQL2hYVnCyGWJLiypOx6teS36";
						document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
						document.getElementById("ScriptureHeaderLinksFttt" + this.windowID).innerHTML = "Narrated Greek Video";
						document.getElementById('ScriptureHeaderLinksImgF' + this.windowID).src = "Image/LUMO.jpg";
						document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=qZZfpeJBsoY&list=PLea-iHHZAgbUjKlcNZCgE8iLMwmySLMC1";
						document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
						break;
					case 41:
						linkVid3.href = "https://www.youtube.com/watch?v=sqMX1caGRhk&list=PLcJVIuhI8isJMzXK9iJ_UhJrcRu7lgtiN";
						linkVid4.href = "https://www.youtube.com/watch?v=DjoNWOwXVqM&list=PLea-iHHZAgbWWvaBg7pMjx4lA7wV2HvIW";
						document.getElementById("ScriptureHeaderLinksDttt" + this.windowID).innerHTML = "Narrated BYZ Greek Video";
						document.getElementById('ScriptureHeaderLinksImgD' + this.windowID).src = "Image/LUMO.jpg";
						document.getElementById("ScriptureHeaderLinksFttt" + this.windowID).innerHTML = "Video of Book playlist";
						document.getElementById('ScriptureHeaderLinksImgF' + this.windowID).src = "Image/BibleProject.jpg";
						document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=OVRixfameGY";
						document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
						break;
					case 42:
						linkVid3.href = "https://youtu.be/fUmktYvg7CQ";
						linkVid4.href = "https://www.youtube.com/watch?v=W9UcImEiF9o";
						document.getElementById('ScriptureHeaderLinksImgD' + this.windowID).src = "Image/TheJesusFilm.jpg";
						document.getElementById("ScriptureHeaderLinksFttt" + this.windowID).innerHTML = "Video of Book playlist";
						document.getElementById('ScriptureHeaderLinksImgF' + this.windowID).src = "Image/BibleProject.jpg";
						document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=_OLezoUvOEQ&list=PLH0Szn1yYNec6O3ZOZzAMb2WW2abJwzZ-";
						document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";

						break;
					case 43:
						linkVid3.href = "https://www.youtube.com/watch?v=G2qjPDtQnk4&list=PLcJVIuhI8isK1RYcLxY0L929cnN3vALi8";
						linkVid4.href = "https://www.youtube.com/watch?v=2mgUPt2KI08";
						document.getElementById('ScriptureHeaderLinksImgD' + this.windowID).src = "Image/TheVisualBible.jpg";
						break;
				}
				linkVid3.style.display = "inline";
				linkVid4.style.display = "inline";
			}
			else if (bookNum == 1) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=3PF7J32Aq0Y";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=KOUV7mWDI34&list=PLH0Szn1yYNee8aedW_5aCpnzkxnV7VQ3K";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 2) {
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=0uf-PgW7rqE&list=PLH0Szn1yYNee8aedW_5aCpnzkxnV7VQ3K&index=3";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 3) {
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=WmvyrLXoQio";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 4) {
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=zebxH-5o-SQ";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 5) {
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=NMhmDPWeftw";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 18) {
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=GswSg2ohqmA";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 19) {
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=dpny22k_7uk";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 20) {
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=Gab04dPs_uA";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 21) {
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=VeUiuSK81-0";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 44) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=G0iqDzcFkow&list=PLPHfRgSDBQL1Urp5l4AAvT4x8sfIeMEpf";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).href = "https://www.youtube.com/watch?v=JQhkWmFJKnA&list=PLH0Szn1yYNec6O3ZOZzAMb2WW2abJwzZ-&index=6";
				document.getElementById("ScriptureHeaderLinksF" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 45) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=YE4Q3WIy26g&list=PLPHfRgSDBQL1cGwWDbOmmnGQRgjA9Y9ic";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 48) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=V9Y9bA20UIM&list=PLPHfRgSDBQL1IYhirEOQD5fnNrQCxeV7p";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 49) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=8yFwDTTteQQ&list=PLPHfRgSDBQL16XsF2wJjcur5h7YPV_aRg";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 51) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=9oLFKo-dmRc&list=PLPHfRgSDBQL1UfdbZ9YpKyh8csdfgqtpZ";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 52) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=TGCUuR_KIvg&list=PLPHfRgSDBQL2UOpIKvlSAX30bDP7iNSJj";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 54) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=yqGff1X9Z9s&list=PLPHfRgSDBQL1TSPLyuZJ1rEH-0DhJOBMe";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 55) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://youtu.be/LJhq6Zn1FMQ";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
			}
			else if (bookNum == 58) {
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).href = "https://www.youtube.com/watch?v=NckrslnaeeM&list=PLPHfRgSDBQL2NRgPa3nj9iP6xR0uGWMEy";
				document.getElementById("ScriptureHeaderLinksE" + this.windowID).style.display = "inline";
			}

		}
		if (addedVideo == false)
			document.getElementById('VideoBar' + this.windowID).style.display = 'none';
		else if (document.getElementById('Scripture' + this.windowID).showVideoBar == true)
			document.getElementById('VideoBar' + this.windowID).style.display = 'flex';
	}
	setPDFLinks() {
		document.getElementById("PDFLinks" + this.windowID).style.display = "none";
		document.getElementById("LEBInterlinear" + this.windowID).style.display = "none";
		document.getElementById("FBVPDF" + this.windowID).style.display = "none";

		////console.log(this.ScrollToId);
		if (this.bookNum!=undefined)
			if (this.refList.substr(2,3)!="000")
				document.getElementById("NETNotes" + this.windowID).href="https://netbible.org/bible/" + bibleBookData[Number(this.bookNum)][1].replace(" ","+") + "+" + Number(this.refList.substring(2,5));
			else
				document.getElementById("NETNotes" + this.windowID).href="https://netbible.org/bible/" + bibleBookData[Number(this.bookNum)][1].replace(" ","+") + "+1";
		else
 			document.getElementById("NETNotes" + this.windowID).href="https://netbible.org/bible";		

		if (this.version == "FBV") {
			document.getElementById("PDFLinks" + this.windowID).style.display = "inline";
			document.getElementById("FBVPDF" + this.windowID).href = "http://www.freebibleversion.org/" + bibleBookData[this.bookNum][1] + "2.0.pdf";
			document.getElementById("FBVPDF" + this.windowID).style.display = "inline";
		}

		if ((this.version == "LEB" && this.bookNum > 39) || this.version == "SBL") {
			document.getElementById("PDFLinks" + this.windowID).style.display = "inline";
			document.getElementById("LEBInterlinear" + this.windowID).href = "http://sblgnt.com/download/revint/" + (Number(this.bookNum) + 21) + "-" + bibleBookData[this.bookNum][1] + ".pdf";
			document.getElementById("LEBInterlinear" + this.windowID).style.display = "inline";
		}
	}
} //end BibleRef Class

class ScriptureWindow {
	constructor(windowID, showWindow) {
		//, fontSize, showVerseNumbers, displayVerseNewLine, displaySentenceNewLine, showTranslatorNotes, showReferenceNotes, showGloss, showStrongs, showLemma, showSectionTitles,showParsing,showVideoBar
		this.windowID = windowID;
		this.bibleRefId = windowID;
		this.showWindow = showWindow; //WC					//human selected setting
		this.setupMode = "Reading";
		this.currentSettings = "";
		//		this.fontSize=siteControl.fontSize;// = fontSize;      //WC
		this.showVerseNumbers = false;//= showVerseNumbers; 	  //WC						//human selected setting	
		this.displayVerseNewLine = false; // = displayVerseNewLine;//WC	//human selected setting
		this.displaySentenceNewLine = false; // = displaySentenceNewLine;//WC	//human selected setting
		this.showTranslatorNotes = false; // = showTranslatorNotes;//WC 	//human selected setting
		this.showReferenceNotes = false; // = showReferenceNotes //WC       //human selected setting
		this.showGloss = 0; // = showGloss; //WC 					//human selected setting of 0 to 10 	
		this.showStrongs = false; // = showStrongs; //WC 					//human selected setting	
		this.showLemma = false; // = showLemma; 	//WC					//human selected setting
		this.showSectionTitles = false; // = showSectionTitles;
		this.showParsing = false; //=showParsing;
		this.showVideoBar = false; // = showVideoBar;
//		this.glossRedoCnt = 0; //used for a 1-time auto do a gloss to 1 and then 0 when gloss is 0. Done since 0 glosses are not being hidden until flip to 1 and then 0.
		this.startAt = "000000";  //used for SectionTitle calls
		this.endAt = "999999";    //used for SectionTitle calls

		//used to get SW sizing
		this.windowHeight=0;
		this.top=0;
		this.bottom=0;
		this.left=0;
		this.right=0;
	}
	setScriptureHeight() {
		let AVheight = 0; //External Links Bar Height (Audio/Video)
		let rct="";
		if (document.getElementById("VideoBar" + this.windowID).style.display != "none") // External Links Bar is on
			AVheight = -10 + -1 * document.getElementById("VideoBar" + this.windowID).offsetHeight;
		if (window.innerHeight > 600)
			this.windowHeight = -47 + AVheight + window.innerHeight - ($("#SiteHeading").innerHeight() + $("#ScriptureHeader" + this.windowID).innerHeight() + $("#ScriptureFooter" + this.windowID).innerHeight());
		else
			this.windowHeight = -57 + AVheight + window.innerHeight;

		$("#Scripture" + this.windowID).height(this.windowHeight);
		rct=window["Scripture" + this.windowID].getBoundingClientRect();
		this.top=rct.top;
		this.bottom=rct.bottom;
		this.left=rct.left;
		this.right=rct.right;   //was rct.lft???

	}
	showSWTopic() {
		document.getElementById("enterVerse" + this.windowID ).style.display="none";
		document.getElementById("enterTopic" + this.windowID+ "Group").style.display="inline";
		document.getElementById("refLabel" + this.windowID).innerHTML="Topic:&nbsp;";
	}
	showSWReference() {	
		document.getElementById("enterVerse" + this.windowID).style.display="inline";
		document.getElementById("enterTopic" + this.windowID + "Group").style.display="none";
		document.getElementById("refLabel" + this.windowID).innerHTML="Ref:&nbsp;";	
		document.getElementById("enterTopic" + this.windowID).innerHTML="0";					
	}
	readFromModeOptions(readFrom, changeByUser) {
		 ////console.log("In sw readFromModeOptions");
		//
		let setFrom=null; 
		if (readFrom=="Reading"){
			// if (window["BibleRef" + this.windowID].refCount > 1) {
			// 	util.openModalBox("Reading mode requires only one reference. Current reference is more than one.", "Cannot Setup for Reading");
			// 	document.getElementById("ReadingMode1").checked = false;
			// 	document.getElementById("StudyMode1").checked = true;
			// 	return;
			// }	
			this.setupMode="Reading";
			readFrom="Default";
			$(".StudyOnly").hide();
		}
		if (readFrom=="Study"){
			this.setupMode="Study";
			readFrom="Default";
			$(".StudyOnly").show();
		}
		if (readFrom=="Default"){ 
			if (this.setupMode=="Reading") 
				setFrom=siteControl.ReadingDefault;

			if (this.setupMode=="Study")
				setFrom=siteControl.StudyDefault;
		}
		if (readFrom=="current")
			setFrom=this.currentSettings;

		if(setFrom==null) {
			console.error("Error: didn't set the place to readFrom in ScriptureWindow.setupMode");
			return;
		}

		this.showSectionTitles = digitToBoolean(setFrom[1]);
		this.showVideoBar = digitToBoolean(setFrom[2]);
		this.showVerseNumbers = digitToBoolean(setFrom[3]);
		this.displayVerseNewLine = digitToBoolean(setFrom[4])
		this.displaySentenceNewLine = digitToBoolean(setFrom[5]);
		this.showTranslatorNotes = digitToBoolean(setFrom[6]);
		this.showStrongs = digitToBoolean(setFrom[7]);
		this.showLemma = digitToBoolean(setFrom[8]);
		this.showParsing = digitToBoolean(setFrom[9]);
		this.showGloss = setFrom[10];
		this.ResetOptions(false);
		document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		this.toggleModeOptions(false);

		if (this.setupMode=="Study" && changeByUser == true){ //reload to add Greek Lemma/Parsing even if hidden
			uncoverGodsWord.processScriptureData(this.windowID,false);
		}	

	}
	toggleModeOptions(showEachOption) { 
		if (showEachOption == true) {  //toggle to hide them
			document.getElementById("modeOptionsChoices1").style.display = "block";
			document.getElementById("modeOptionsDDBtnDown1").style.display = "none";
			document.getElementById("modeOptionsDDBtnUp1").style.display = "inline";
			document.getElementById("modeOptions1").innerHTML = "Hide " + this.setupMode + " Options";
			document.getElementById("modeOptionsBtn1").style.display = "none";
		}
		else {  //toggle to show them
			document.getElementById("modeOptionsChoices1").style.display = "none";
			document.getElementById("modeOptionsDDBtnDown1").style.display = "inline";
			document.getElementById("modeOptionsDDBtnUp1").style.display = "none";
			document.getElementById("modeOptions1").innerHTML = "Show " + this.setupMode + " Options";
			document.getElementById("modeOptionsBtn1").style.display = "none";
		}
	}
	matchDefault() {
		let defaultOptions
		//Check each option if matches mode default, break with false on first mismatch else return true.
		if (this.modeType == "Reading")
			defaultOptions = siteControl.ReadingDefault
		else
			defaultOptions = siteControl.StudyDefault

		if (this.showSectionTitles != digitToBoolean(defaultOptions[1]))
			return false;

		if (this.showVideoBar != digitToBoolean(defaultOptions[2]))
			return false;

		if (this.showVerseNumbers != digitToBoolean(defaultOptions[3]))
			return false;

		if (this.displayVerseNewLine != digitToBoolean(defaultOptions[4]))
			return false;
		if (this.displaySentenceNewLine != digitToBoolean(defaultOptions[5]))
			return false;
		if (this.showTranslatorNotes != digitToBoolean(defaultOptions[6]))
			return false;
		if (this.showStrongs != digitToBoolean(defaultOptions[7]))
			return false;
		if (this.showLemma != digitToBoolean(defaultOptions[8]))
			return false;
		if (this.showParsing != digitToBoolean(defaultOptions[9]))
			return false;
		if (this.showGloss != defaultOptions[10]) {
			console.log("Screen Gloss:" + this.showGloss + " Default Gloss:" + defaultOptions[10]);
			if (this.showGloss != 10 || !(this.showGloss == 10 && defaultOptions[10] == 9))
				return false;
		}

		return true;
	}	
	OptionshowVideoBarChange(changeByUser) {		
		if (changeByUser == true) {
			this.showVideoBar = document.getElementById("showVideoBar" + this.windowID).checked;
			if (window["BibleRef" + this.bibleRefId].multipleBooks==true)
				util.openModalBox("The VideoBar does not show when multiple Bible Books are referenced.","Multiple Bible Books Referenced")
			window["BibleRef" + this.bibleRefId].showVideoBar = this.showVideoBar;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById("showVideoBar" + this.windowID).checked = this.showVideoBar;

		//set the window to match the new property
		if ((this.showVideoBar == false) || (window["BibleRef" + this.bibleRefId].multipleBooks==true))
			document.getElementById("VideoBar" + this.windowID).style.display = "none";
		else
			document.getElementById("VideoBar" + this.windowID).style.display = "flex";
		resizeWindows();
	}
	OptionshowVerseNumbersChange(changeByUser) {

		//Set the BibleRef object property
		if (changeByUser == true) {
			this.showVerseNumbers = document.getElementById("showVerseNumbers" + this.windowID).checked;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById("showVerseNumbers" + this.windowID).checked = this.showVerseNumbers;

		//set the window to match the new property
		if (this.showVerseNumbers == false) {   // False  //don't show verse reference
			if (this.displayVerseNewLine == false) { // False False  //break default of paragraph
				$("#Scripture" + this.windowID + " span.vrs").css('display', 'inline');
				//$("#Scripture" + this.windowID + " span.vrs").css('color','var(--bgSW)');
				$("#Scripture" + this.windowID + " span.vrs").hide();
			}
			else { //False True //break on each verse
				$("#Scripture" + this.windowID + " span.vrs").css('color', 'var(--bgSW)');
				$("#Scripture" + this.windowID + " span.vrs").show();
				$("#Scripture" + this.windowID + " span.vrs").css('display', 'block');
			}
		}
		else {  //show verse reference
			if (this.displayVerseNewLine == false) { // True False  //break default of paragraph
				$("#Scripture" + this.windowID + " span.vrs").css('display', 'inline');
				$("#Scripture" + this.windowID + " span.vrs").css('color', 'var(--txtSW)');
				$("#Scripture" + this.windowID + " span.vrs").show();
			}
			else { //True True //break on each verse
				$("#Scripture" + this.windowID + " span.vrs").css('color', 'var(--txtSW)');
				$("#Scripture" + this.windowID + " span.vrs").show();
				$("#Scripture" + this.windowID + " span.vrs").css('display', 'block');
			}
		}

	}
	OptiondisplayVerseNewLine(changeByUser) {
		var opt = "displayVerseNewLine";
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.displayVerseNewLine = document.getElementById(opt + this.windowID).checked;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById(opt + this.windowID).checked = this.displayVerseNewLine;

		//set the window to match the new property (check if hidden to reset after inline/block set)
		this.OptionshowVerseNumbersChange(false);

	}
	OptiondisplaySentenceNewLine(changeByUser) {
		var opt = "displaySentenceNewLine";
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.displaySentenceNewLine = document.getElementById(opt + this.windowID).checked;
			document.getElementById("Scripture" + this.windowID).innerHTML = "";
			uncoverGodsWord.processScriptureData(this.windowID,false);
			//displayScripture(this.windowID, window["BibleRef" + this.bibleRefId].bookNum, window["BibleRef" + this.bibleRefId].bookNam, window["BibleRef" + this.bibleRefId].version, window["BibleRef" + this.bibleRefId].refList);
			this.OptiondisplayVerseNewLine(false);

			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";

		}
		else
			document.getElementById(opt + this.windowID).checked = this.displaySentenceNewLine;

		//set the window to match the new property (check if hidden to reset after inline/block set)
		

	}
	OptionshowNotesChange(changeByUser) {
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.showTranslatorNotes = document.getElementById("showTranslatorNotes" + this.windowID).checked;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}

		else
			document.getElementById("showTranslatorNotes" + this.windowID).checked = this.showTranslatorNotes;
		//set the window to match the new property
		if (this.showTranslatorNotes == false) {
			$("#Scripture" + this.windowID + " span.tnote").hide();
			$("#Scripture" + this.windowID + " span.rnote").hide();
		}
		else {
			$("#Scripture" + this.windowID + " span.tnote").show();
			$("#Scripture" + this.windowID + " span.rnote").show();
		}

	}
	OptionshowLemmaChange(changeByUser) {
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.showLemma = document.getElementById("showLemma" + this.windowID).checked;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			if (document.getElementById("showLemma" + this.windowID).checked != this.showLemma)
				document.getElementById("showLemma" + this.windowID).checked = this.showLemma;


		//set the window to match the new property
		if (this.showLemma == false)
			$("#Scripture" + this.windowID + " a.lmma").hide();
		else
			$("#Scripture" + this.windowID + " a.lmma").show();
	}
	OptionshowGlossChange(changeByUser) {
		//Set the BibleRef object property
		//this hides or shows the "Set as New Default" button 
		if (changeByUser == true) {
			this.showGloss = document.getElementById("showGloss" + this.windowID).value;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById("showGloss" + this.windowID).value = this.showGloss;

		//this hides or shows the gloss (ew) based on gloss level. 
		for (let i = 1; i <= this.showGloss; i++) {

			$("#Scripture" + this.windowID + " a.ew" + i).show();
			//console.log("show gloss of " + i);
		}
		for (let i = 10; i > this.showGloss; i--) {
			$("#Scripture" + this.windowID + " a.ew" + i).hide();
			//console.log("hide gloss of " + i);
		}
	}
	OptionshowStrongsChange(changeByUser) {
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.showStrongs = document.getElementById("showStrongs" + this.windowID).checked;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById("showStrongs" + this.windowID).checked = this.showStrongs;

		//set the window to match the new property
		if (this.showStrongs == false)
			$("#Scripture" + this.windowID + " a.strngs").hide();
		else
			$("#Scripture" + this.windowID + " a.strngs").show();
	}
	OptionshowParsingChange(changeByUser) {
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.showParsing = document.getElementById("showParsing" + this.windowID).checked;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById("showParsing" + this.windowID).checked = this.showParsing;

		//set the window to match the new property
		if (this.showParsing == false)
			$("#Scripture" + this.windowID + " a.prs").hide();
		else
			$("#Scripture" + this.windowID + " a.prs").show();
	}
	OptionshowSectionTitlesChange(changeByUser) {
		 ////console.log("In sw Optionshow Section Titles Change and changeByUser is " + changeByUser);
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.showSectionTitles = document.getElementById("showSectionTitles" + this.windowID).checked;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById("showSectionTitles" + this.windowID).checked = this.showSectionTitles;

		////console.log("In OptionshowSectionTitlesChange showSectionTitles:" + this.showSectionTitles);
		//set the window to match the new property
		if (this.showSectionTitles == false)
			$("#Scripture" + this.windowID + " p.secTitle").hide();
		else //showSectionTitles == true
			if (typeof (sectionTitles) == 'undefined' || sectionTitles == null)
				if (window["BibleRef" + this.windowID].bookNum!="" ) //bookNum is not set so this setting change is part of loading a reference. 
					displaySectionTitles(window["BibleRef" + this.windowID].bookNum, window["BibleRef" + this.windowID].bookNam, window["BibleRef" + this.windowID].version, this.windowID, this.startAt, this.endAt, "SW");
			else {
				var k = document.getElementsByClassName("secTitle").length; //get the number of secTitle class in HTML Scripture element 
				if (k == 0) {//if none then
					if (window["BibleRef" + this.windowID].bookNum!="" ) //bookNum is not set so this setting change is part of loading a reference. 
						displaySectionTitles(window["BibleRef" + this.windowID].bookNum, window["BibleRef" + this.windowID].bookNam, window["BibleRef" + this.windowID].version, this.windowID, this.startAt, this.endAt, "SW");
				}
				else //has them so show them. 
					$("#Scripture" + this.windowID + " p.secTitle").show();
			}
	}
	ResetOptions(changeByUser) {
		 ////console.log("In sw Reset Options and changeByUser is " + changeByUser);
		this.OptionshowSectionTitlesChange(changeByUser);
		this.OptionshowVideoBarChange(changeByUser);
		//Audio
		this.OptiondisplayVerseNewLine(changeByUser);
		this.OptiondisplaySentenceNewLine(changeByUser);
		this.OptionshowVerseNumbersChange(changeByUser);
		//this.OptionshowNotesChange(changeByUser);
		//this.OptionshowStrongsChange(changeByUser);
		this.OptionshowLemmaChange(changeByUser);
		this.OptionshowParsingChange(changeByUser);
		this.OptionshowGlossChange(changeByUser);
		if (this.setupMode == "Reading") {
			if (document.getElementById("ReadingMode" + this.windowID).checked == false) {
				document.getElementById("ReadingMode" + this.windowID).checked = true;
				document.getElementById("StudyMode" + this.windowID).checked = false;
			}
		}
		else {
			if (document.getElementById("StudyMode" + this.windowID).checked == false) {
				document.getElementById("ReadingMode" + this.windowID).checked = false;
				document.getElementById("StudyMode" + this.windowID).checked = true;
			}
		}
	}
	closeVideoBar() {
		this.showVideoBar = false;
		document.getElementById('VideoBar1').style.display = 'none';

		ScriptureWindow1.OptionshowVideoBarChange(true); ScriptureWindow1.showVideoBar = false; ScriptureWindow1.setScriptureHeight();

	}
} //end class ScriptureWindow

class VoiceControl {
	constructor(windowID){
	this.windowID = windowID;  	//must match to a ScriptureWindow windowID 
	this.fileMetaID=[]; //an array containing the audioFileMeta IDs for each reference with a match. Needed to create MYSQL requests for each reference with audio. should be aligned with RefList.   Will also be needed for Multiple Version References (MVR)
	this.refFromToArr=[]; //splits refFromTO
	this.refFromToIncr=0; //increment for refFromToArr (1 to 1 with fileMetaID)
	this.refFromToTop=0;  //number of elements in refFromTO
	this.voiceFle={};  //an object for each voice File with name of file and timing. 
	this.voiceFleIncr=0; //used to walk thru voiceFle array in voiceFle
	this.voiceFleTop=0;  //number of elements in voiceFle which is the number of voice files. 
	//voiceFle={r00={file1={file="https=//ebible.org/webaudio/Heb04.mp3";ref="58004014-58004999";timing=[134.5]}};r01={file2={file="https=//ebible.org/webaudio/Heb05.mp3";ref="58005001-58005002";timing=[3;14];stop=21}};r10={file1={file="WEB/WinfredHenson/46_1Cor13.mp3";ref="46013001-47013005";timing=[3;11.5;23;32;40];stop=48}}};

	this.refWordArr=[];  //holds Bible refernce Arr wordList subset of a single reference sent to audio/synth voice 
	this.rWAIncr=1; // in Synth this is the current word/row in refWordArR to add to the batch for synth
	this.rWAFrstIncr=1; // in Synth this is the First word/row in refWordArR to batch send to synth  (currently first word of the sentence)
	this.rWALstIncr=-1; // in Synth this is the Last word/row in refWordArR to send to synth  (currently last word of the sentence)
	this.iPunctAfter=-1; // the column of refWordArr that has the punctuation after the word. (used to find and end of sentence)

	this.duration= "";  //total time of voice use voiceFle[voiceFleIncr].dur
	this.timingStop=30000.03;  //Used to halt at reference end if before the voice file end.
	this.timingIncr=1;   //used to go through all items in the nested timing object in the voiceFle object
	this.autoPlay= false;
	this.sayRef=false;	
	this.autoScroll= 0;
	this.autoScrollTiming= 100;
	this.currentTime=0; //to save and restore from RH
	this.RHNum="";
	this.iRHrow=-1;

	this.defaultSynth= false; //used to set default to synth voice instead of person voice file when available.
	this.callbackControl="";   //set for synth 
	this.callbackFunction="";  //set for synth to start reading next portion 
	this.fullStop=false; //flag for synth voice end
	this.isPaused=false;
	this.versionDataCol= 6;  //column in versionData.  Column contains the Row number(s) of audioFileMeta ID(s) for that version in order of use.  A '0' value means no audiofile.

	this.markTextArr=[];
	this.cntTo=999;
	this.cntFrom=0;

	
	this.bookNum=-1;
	this.bookNam="";

	this.voices=[];
	}
	startAudioFileProcess(version, refFromTo){
		//called from  BibleRef#.fillRefFromTO which is called from uncoverGodsWord.displayScripture after last Reference is processed
		//empties & fills: fileMetaID array, voiceFle object 
		//check each ref with versionData and local audioMetaFile to determine if it has audio file 
		//Get MetaID and call getAudioFileTiming.php to get database filenames and timing data, if applicable
		// fileMetaID item of 0 means a Synth voice
		//voiceFle object is a array of objects - 1 object per voice file and/or reference on synth
		//voicFle is what is iterated in load function.  
	    //!!!!MV needs to be changed when a reflist can contain multiple versions
		//console.log("zq in startAudioFileProcesS with RefFromTO:" + refFromTo);
	
		if (this.windowID==0) //do NOT run for hidden 0 window.
			return;

		this.clearVoiceData();  //clears object Arrays and values		
		let audioMetaOrder='-1';
		let metaID=0;
		let audioMetaOrderArr=[0,0];
		this.refFromToArr=refFromTo.split(";");
		this.refFromToTop=this.refFromToArr.length;
		let voiceFleStr="{";
		let bk=0;
		let bkSctn="";
		let k=0;
		
	
		if (siteControl.audioTypeAllowed=="None") //exit function if user set audio option to None. Remove the view of the audio controls
		{
			document.getElementById('AudioTimeSpacer' + this.windowID).style.display = "none";
			document.getElementById('AudioTime' + this.windowID).style.display = "none";
			document.getElementById("AudioDDBtn" + this.windowID).style.display = "none";
			document.getElementById("AudioPlayBtn"+ this.windowID).style.display = "none";
			document.getElementById("AudioPauseBtn"+ this.windowID).style.display = "none";
			console.log ("Audio set to none");
			return;
		}
		     		
		//*********** Set HTML audio buttons (mostly set in Play/Pause functions) ***********/		
		//set responsive for screen size for Spacer and AudioTime AND initialize Play/Pause
		var a = document.getElementById("Scripture" + this.windowID).getBoundingClientRect()
		if (a.width > 624){
			document.getElementById('AudioTimeSpacer' +  this.windowID).style.display = "none";
			document.getElementById('AudioTime' +  this.windowID).style.display = "inline";			
			console.log ("AudioTime set to inline");
		}
		else {
			document.getElementById('AudioTimeSpacer' +  this.windowID).style.display = "inline";
			document.getElementById('AudioTime' +  this.windowID).style.display = "none";
			console.log ("AudioTime set to none");
		}
		document.getElementById("AudioDDBtn" + this.windowID).style.display = "inline";
		document.getElementById("AudioPlayBtn"+ this.windowID).style.display = "inline";
		document.getElementById("AudioPauseBtn"+ this.windowID).style.display = "none";

		//check if there is a voicefile or user setting wants Synth
		audioMetaOrder=versionData[util.findRowIn2DArr("versionData",0,version)][this.versionDataCol];
		audioMetaOrderArr=audioMetaOrder.split(","); //for Version/Ref with more than one audio file set
	//**** Create items for this.fileMetaID
		if (audioMetaOrder=='0' || siteControl.audioTypeAllowed.includes("Synth")) {//no audio for version or user set to Synth
			for (let i = 1; i <= this.refFromToArr.length; i++)
				this.fileMetaID.push("0");
		
			//console.log("fileMetaID:" + JSON.stringify(this.fileMetaID));
		}
		else { //has audio file
			for (let i=0;i<this.refFromToArr.length;i++){  //check each ref if has voice file
				bk=this.refFromToArr[i].substring(0,2);
				bkSctn=util.getBookSection(bk);
		
				for (let j=0;j<audioMetaOrderArr.length;j++){  //check if Ref has audio File match based on audioMetaFile row in audioMetaOrder
					k=audioMetaOrderArr[j]; //k is now the metaID being checked;
					//see if audio based on Full Section has Audio has this Ref OR list has this book
					if( (bkSctn=="NT" && audioFileMeta[k][8]==1) || (bkSctn=="OT" && audioFileMeta[k][9]==1) || (bkSctn=="AP" && audioFileMeta[k][10]==1) || audioFileMeta[k][15].includes(bk)==true ){
						metaID=k;
						break;
					}							
				}
				this.fileMetaID[i]=metaID;  //will be 0 if none; if none should be synth voice
				metaID="0"; //prime for next reflist	
			}
		}	
		console.log("fileMetaID:" + JSON.stringify(this.fileMetaID));
	//****Create items for this.voiceFle object */
		//check if all references are without a voicefile (all zeroes) which means they are only synth options. 
		if(0==this.fileMetaID.reduce((accumulator, currentValue) => {return accumulator + currentValue},0)){
			//build this.voiceFle object format of objects in object is "o1":{"rArrI":"0","file":"none","ref":"67001001"},
			for (let i = 0; i < this.refFromToArr.length; i++) {
				if (voiceFleStr!="{")  //add comma after previous object
					voiceFleStr=voiceFleStr + ",";
				voiceFleStr=voiceFleStr + '"o' + (i+1) + '":{"rArrI":"' + i + '","file":"none","ref":"' + this.refFromToArr[i] + '"}'; 
			}
			voiceFleStr=voiceFleStr + "}";
			this.voiceFle=JSON.parse(voiceFleStr);
			console.log(voiceFleStr);
			this.voiceFleTop=this.refFromToArr.length;
			this.load(this.windowID);
			return;
		}
		//The below is ONLY run if there is a voice file.
		let fMetaID=JSON.stringify(this.fileMetaID).replace("[","").replace("]","");
		// let rFromToArr=JSON.stringify(this.refFromToArr);
		var increPst= this.windowID;
		var vc="VoiceControl" + increPst;
		console.log("fMetaID:" + fMetaID);
		console.log("refFromTo:" + refFromTo);
		//call PHP with an array 
		$.post("getAudioFileTiming.php", {
			metaID: fMetaID,
			refFromTo: refFromTo,
			},
			function (result) {
				console.log(result);
				//get voiceFle and nonchanging values with it.
				let splt=result.split("~");
				window[vc].voiceFleTop=splt[1];
				window[vc].voiceFle=JSON.parse(splt[0]); 
				window[vc].load(increPst);	
		}
		);			
	}
	load(incre) {
		//called from startAudioFileProcesS and Ended
		//this function runs for each voicefile (object) in voiceFle
		console.log("zq in VoiceControl" + incre + ".load()");

		//let refBook=0;		
		let resetToStart=false;
		//for easier readability in code
		let vFIncr=window["VoiceControl" + incre].voiceFleIncr; //voiceFle Increment is set to 1 initially and then ++ in EndeD() which calls VC.loaD() again for each reference file.
		console.log("vFIncr:" + vFIncr);


		//check if set to reload first file as prime.
		if (vFIncr> window["VoiceControl" + incre].voiceFleTop){
			console.log("in voice file reset");
			window["VoiceControl" + incre].autoPlay=false;
			window["VoiceControl" + incre].voiceFleIncr=1; 
			vFIncr=1;
			resetToStart=true;  
		}

		//get Bible Reference Word Array
		window["VoiceControl" + incre].getRefWordArr(incre);


		//check if NOT first run or if repeat is true and if either is true then autoPlay all subsequent loads
		if ((vFIncr>1) || document.getElementById('audioRepeat' + incre).checked==true){
			console.log("autoplay turned on");
			window["VoiceControl" + incre].autoPlay=true; //set to auto play all subsequent voice files in window["VoiceControl" + incre].voiceFileNames[] list.
		}


		//run synth and exit load
		if (window["VoiceControl" + incre].voiceFle["o" + vFIncr].file=="none"){ //is synth
			console.log("in load synth"); 
			if (window["VoiceControl" + incre].autoPlay==true)
				window["VoiceControl" + incre].primeSynthRef(vFIncr);
			return;
		}	
		console.log("in load but not synth");
	
		//Get current Reference and Book
		////console.log(window["VoiceControl" + window["VoiceControl" + incre].windowID].voiceFle)[window["VoiceControl" + incre].voiceFleIncr].rArrI);
		//refBook=window["VoiceControl" + incre].voiceFle["o" + vFIncr].ref.substring(0,2);
		//window["VoiceControl" + incre].refFromToArr[window["VoiceControl" + incre].refFromToIncr];
		//console.log("refBook:" + refBook);


	
		//*********** Load voice & timing files and details ***********/
        //set Load Audio Filename and set timingFile and Audio Chapters start & end 
		document.getElementById("ScriptureHeaderAudio" + incre).src = window["VoiceControl" + incre].voiceFle["o" + vFIncr].file;
		console.log ("loaded Audio file:" +  window["VoiceControl" + incre].voiceFle["o" + vFIncr].file);
		//set at first time in timing
		document.getElementById("ScriptureHeaderAudio" + incre).currentTime =  window["VoiceControl" + incre].voiceFle["o" + vFIncr].timing[0];
		//get duration as time once (it is repeated several times a second as the timer counts so do it once here)
		window["VoiceControl" + incre].duration= window["VoiceControl" + incre].SecondsToTime(window["VoiceControl" + incre].voiceFle["o" + vFIncr].dur);
		window["VoiceControl" + incre].timingStop=window["VoiceControl" + incre].voiceFle["o" + vFIncr].stop;
		document.getElementById("AudioTime" + incre).innerHTML = window["VoiceControl" + incre].duration;
		
		//set aud Chapters	
		////console.log("currentTime:" + document.getElementById("ScriptureHeaderAudio" + window["VoiceControl" + incre].currentTime);
		
		
		//when RH is enabled will need to goto time and text on screen based on Reference History;

		//If user already pressed Play it should go through all audiofiles and play for the entire references in SW
		if (window["VoiceControl" + incre].autoPlay == true)
			window["VoiceControl" + incre].Play(incre);		
	
		if(resetToStart==true) //go back to top if have reached end of voice files.
			setTimeout(window["VoiceControl" + incre].GoToTop,250,incre);
		else
			setTimeout(window["VoiceControl" + incre].trackVoicePlaying, 300, incre);
	}
	getRefWordArr(incre){
		//called from VC.load
		window["VoiceControl" + incre].refWordArr=[]; //empty array before pushing new reference to it.

		let refItem=window["VoiceControl" + incre].voiceFle["o" + window["VoiceControl" + incre].voiceFleIncr].ref; //ref is FromTo format with BBCCVVWW-BBCCVVWW in 2 or 3 digit CVW
		window["VoiceControl" + incre].bookNum=Number(refItem.substring(0,2));
		if (refItem=="-1") //reference not exist
			return;  //exit because can't process the nonexisting reference of -1  

		let pnum=util.refPadCount(window["VoiceControl" + incre].bookNum,window["BibleRef"+incre].version);
		let refItem1=refItem.substring(2,2+pnum*3);
		let refItem2=refItem.substring(pnum*3+5); //the ref after the dash. Either 9 or 12 the added 3 is 2 for book plus one for dash
		
		window["VoiceControl" + incre].bookNam=bibleBookData[window["VoiceControl" + incre].bookNum][8];

		//Get refWordArr to include only the refItem portion of the book.
		//if whole book
		if (window["B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+incre].version][1][0]==refItem1 && window["B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+incre].version][window["B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+incre].version].length-1][0]==refItem2){  //Whole Book
			window["VoiceControl" + incre].refWordArr=window["B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+incre].version];  //whole book 2d array
			//console.log("refWordArr is the whole book");
		}
		else {
			//e.g. find in B1PEWEB  ref 4:5 as "040501"
			let iRow=util.findRowIn2DArr("B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+incre].version,0,refItem1);
			let iRow2=util.findRowIn2DArr("B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+incre].version,0,refItem2);
			window["VoiceControl" + incre].refWordArr.push(window["B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+incre].version][0]); //prime row 0 with column names		

			for (let i=iRow;i<=iRow2;i++)
					window["VoiceControl" + incre].refWordArr.push(window["B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+incre].version][i]);
		}
		//set refWordArr values
		window["VoiceControl" + incre].iPunctAfter=getColumnIncre(window["B" + window["VoiceControl" + incre].bookNam + window["BibleRef"+window["VoiceControl" + incre].windowID].version][0], "PunctAfter");
		window["VoiceControl" + incre].rWAIncr=1;
		window["VoiceControl" + incre].rWAFrstIncr=1;
		window["VoiceControl" + incre].rWALstIncr=window["VoiceControl" + incre].refWordArr.length-1;	
	}
	trackVoicePlaying (incre) {
		let pend = document.getElementById("ScriptureHeaderAudio" + incre).currentTime;
	
		//stop if at or after timingSTOP and call Ended
		if (pend>=window["VoiceControl" + incre].timingStop) {
				document.getElementById('ScriptureHeaderAudio' + incre).pause();
				//console.log("in timingStop");
				console.log("current:" + pend + "  stop:"+ window["VoiceControl" + incre].timingStop);
				window["VoiceControl" + incre].Ended(incre);
				return;
			}
        
		//reset HTML voice file timer
		document.getElementById("AudioTime" + incre).innerHTML = window["VoiceControl" + incre].SecondsToTime(pend) + "/" + window["VoiceControl" + incre].duration;
		
		//*************** Get timing and html object name to send to scrolling during the audio playing */
		//get audio currentTime's match to timing item for assigning when at next timingIncr
		if (pend>=window["VoiceControl" + incre].voiceFle["o" + window["VoiceControl" + incre].voiceFleIncr].timing[window["VoiceControl" + incre].timingIncr]) { 
			//get previous verse start and loop through until in next verse (or chapter...or end)
			
			let pnum=util.refPadCount(window["VoiceControl" + incre].bookNum,window["BibleRef"+incre].version);
			let currVrs=window["VoiceControl" + incre].refWordArr[window["VoiceControl" + incre].rWAIncr][0].substring(0,pnum*2); //The refWordArr reference CCVV ither 4 or 6 the added 3 is 2 for book plus one for dash
			do {
				window["VoiceControl" + incre].rWAIncr++;
			} while (currVrs==window["VoiceControl" + incre].refWordArr[window["VoiceControl" + incre].rWAIncr][0].substring(0,pnum*2))

			let myStr=window["BibleRef"+incre].version + util.padNum(window["VoiceControl" + incre].bookNum,2) + window["VoiceControl" + incre].refWordArr[window["VoiceControl" + incre].rWAIncr][0]+ "-" + incre;
			console.log ("scrolling to Obj " + myStr);
			window["VoiceControl" + incre].timingIncr++;
			
			window["VoiceControl" + incre].trackScroll(myStr,incre);
		}	

		rootBody("auto");
		//recursive call if voice file not paused by user.
		if (document.getElementById('AudioPauseBtn' + incre).style.display != "none")
			setTimeout(window["VoiceControl" + incre].trackVoicePlaying, 1000, incre);
		else 
			console.info("in trackVoicePlaying at end. But it seems to think it is paused and did NOT recursively call this function.");	
		}
	trackScroll(myId, incre){
		//console.log ("zq in trackScrolL with Id of:" + myId + "  and incre of " + incre);
		let wrd1Ele = document.getElementById(myId).getBoundingClientRect();
		if (wrd1Ele.top< (window["ScriptureWindow" + incre].windowHeight/1.5)) {
			window["VoiceControl" + incre].autoScroll = 0; //in next run of audiocontrol.pageScroll() stop delayed recursive call.
			//console.log("In autoScroll=1");			
		}
		else if ((wrd1Ele.top>window["ScriptureWindow" + incre].windowHeight/1.5)){

			if (window["VoiceControl" + incre].autoScroll == 0) {  //only start autoscrolling if not currently doing so.
				//console.log("In autoScroll=0");			
				////console.log("autoScrollTiming=" + window["VoiceControl" + incre].autoScrollTiming);
				////console.log("autoScroll=" + window["VoiceControl" + incre].autoScroll);
				window["VoiceControl" + incre].autoScroll = 1;
				window["VoiceControl" + incre].pageScroll(incre);
				//console.log("autoScroll=" + window["VoiceControl" + incre].autoScroll);
				setTimeout(window["VoiceControl" + incre].pageScroll,window["VoiceControl" + incre].autoScrollTiming,incre);

			}
			
		}

		
	}
	pageScroll(incre) {
		//console.log ("zq in pageScrolL with incre of " + incre);		
		if (window["VoiceControl" + incre].autoScroll>0) {
			document.getElementById('Scripture'+ incre).scrollBy(0,1);
			setTimeout(window["VoiceControl" + incre].pageScroll,window["VoiceControl" + incre].autoScrollTiming,incre);
		}
	}
	PlayChoice (incre) {
		console.log("zq In audio PlayChoicE for incre " + incre);
		if (window["VoiceControl" + incre].fileMetaID[window["VoiceControl" + incre].refFromToIncr] == 0)
			window["VoiceControl" + incre].PlaySynth(incre);
		else 
			window["VoiceControl" + incre].Play(incre);	
	}
	Play (incre) {
		console.log("zq In audio Play for incre " + incre);
		document.getElementById('AudioPlayBtn' + incre).style.display = "none";
		document.getElementById('AudioPauseBtn' + incre).style.display = "inline";
		document.getElementById('ScriptureHeaderAudio' + incre).playbackRate = document.getElementById('audioRate' +  incre).value;
		setTimeout(window["VoiceControl" + incre].trackVoicePlaying, 1000, incre);
		document.getElementById('ScriptureHeaderAudio' + incre).play();
	}
	PlaySynth (incre) {
		console.log("zq In VC.PlaySynth");
		if (this.isPaused==true){
			window.speechSynthesis.resume();
			this.isPaused=false;
			this.fullStop=false;   
		}
	    else {
			//console.log("primeSynthReF(" + this.voiceFleIncr + ")"); 
			this.isPaused=false;
			this.fullStop=false;   
			this.primeSynthRef(this.voiceFleIncr);
		 }
		 document.getElementById('AudioPlayBtn' + incre).style.display = "none";
		 document.getElementById('AudioPauseBtn' + incre).style.display = "inline";
	}
	PauseChoice (incre) {
		console.log("zq in PauseChoice for incre " + incre);

		//stop autoScroll if put back to first refItem
		window["VoiceControl" + incre].autoScroll=0;

		//if synth
		if (window["VoiceControl" + incre].fileMetaID[window["VoiceControl" + incre].refFromToIncr] == 0)
			window["VoiceControl" + incre].PauseSynth(incre);	
		else { //if human voice
			window["VoiceControl" + incre].Pause(incre);
		}
	}
	Pause (incre) {
		console.log("zq in Pause for incre " + incre);
		let RHNum=window["BibleRef" + incre].RHNum;		
		document.getElementById('AudioPauseBtn' + incre).style.display = "none";
		document.getElementById('AudioPlayBtn' + incre).style.display = "inline";
		document.getElementById('ScriptureHeaderAudio' + incre).pause();
		if (RHNum!="0")
			RH.updateRHRow(incre,RHNum);
	}
	PauseSynth (incre) {
		console.log("zq in PauseSynth for incre " + incre);
		window.speechSynthesis.pause();
		this.isPaused=true;
			this.fullStop=true;

		document.getElementById('AudioPauseBtn' + incre).style.display = "none";
		document.getElementById('AudioPlayBtn' + incre).style.display = "inline";
	//	this.speechFullStop();
	}
	Ended (incre=1) {
		//called from html and trackVoicePlaying
		// stop auto scrolling
		console.log("zq in VoiceControl.EndeD()");
		window["VoiceControl" + incre].autoScroll=0;
		if (window["VoiceControl"+ this.windowID].fullStop==true){
			window["VoiceControl"+ this.windowID].fullStop=false;
		}

		//set html audio controls
		document.getElementById('AudioPauseBtn' + incre).style.display = "none";
		document.getElementById('AudioPlayBtn' + incre).style.display = "inline";
		//increment to next file ref
		//Get voiceFle info
		
		window["VoiceControl" + incre].voiceFleIncr++;
		//console.log ("in Ended with voiceFleIncr new value of " + window["VoiceControl" + incre].voiceFleIncr);

		window["VoiceControl" + incre].load(incre);			
	}
	OpenDialog (event, incre) {
		document.getElementById('audioPopUp' + incre).style.top = event.pageY + 15 + "px";
		if (window.innerWidth < event.pageX + 150)
			document.getElementById('audioPopUp' + incre).style.right = 0 + "px";
		else
			document.getElementById('audioPopUp' + incre).style.left = event.pageX + "px";
		document.getElementById('audioPopUp' + incre).style.display = "block";
	}
	setLoop (incre) {
		//document.getElementById("ScriptureHeaderAudio" + incre).loop = document.getElementById('audioRepeat' + incre).checked;
	}
	GoToTime(incre,setTime){
		document.getElementById("ScriptureHeaderAudio"+ incre).currentTime = setTime;
		this.trackVoicePlaying(incre)		
	}
	GoTo (incre, autoPlay) {
		var curTime = document.getElementById('audioGoTo' + incre).value;
		if (curTime.includes(":"))
			curTime = this.TimeToSeconds(curTime);
		else
			////console.log("curTime " + Math.floor(curTime / 60) + ":" + (curTime - (Math.floor(curTime / 60) * 60)));

		document.getElementById("ScriptureHeaderAudio" + incre).currentTime = curTime;
		this.trackVoicePlaying(incre);
		if (autoPlay == true)
			this.Play(incre);
	}
	GoToTop(incre){
		document.getElementById("Scripture"+incre).scroll({ top: 0, left: 0, behavior: 'auto' });
	}
	setPlaybackRate (incre) {
		document.getElementById("ScriptureHeaderAudio" + incre).playbackRate = document.getElementById('audioRate' + incre).value;
	}
	SecondsToTime (sec) {
		var AudioHours = Math.floor(sec /3600);
		sec=sec-(AudioHours*3600);
		var AudioMinutes = Math.floor(sec / 60);
		var AudioSeconds = Math.floor(sec - AudioMinutes * 60);
		if (AudioHours==0)
			return AudioMinutes + ":" + util.padNum(AudioSeconds, 2);
		else 
			return AudioHours + ":" + util.padNum(AudioMinutes, 2) + ":" + util.padNum(AudioSeconds, 2);

	}
	TimeToSeconds (tm) {
		var hrs=0;
		if (tm.indexOf(":")!=tm.lastIndexOf(":")){
			hrs=Number(tm.substr(0, tm.indexOf(":")))*3600;
			tm=tm.substr(tm.indexOf(":") + 1);
		}
		var mins = Number(tm.substr(0, tm.indexOf(":"))) *60;
		var secs = Number(tm.substr(tm.indexOf(":") + 1));
		return hrs + mins + secs;

	}
	clearVoiceData(){
		//called at start of startAudioFileProcesS
		console.log("zq In voiceControl?.clearVoiceData()");		
		this.fileMetaID=[];
		this.refFromToArr=[];
		this.refFromToIncr=0;
		this.voiceFle={};
		this.voiceFleIncr=1;
		this.voiceFleTop=0;
		this.autoPlay=false;

		this.iRHrow = -1;
		this.RHNum = "";
		this.autoScroll= 0;
		//this.autoScrollTiming=100;			
	}
	reset () {
		// Only called as VoiceControl.reset in BibleRef# and in uncoverGodsWord   ???Does it need both?
		console.log("zq In voiceControl?.reset()");
		this.timingFile="";
		this.timingIncr=1;
		this.currentTime=0;
		//this.duration = "";
		this.autoPlay = false;

		this.iRHrow= -1;
		//set visible audio html elements
		document.getElementById("AudioTime" + this.windowID).style.display = "none";
		document.getElementById("AudioTimeSpacer" + this.windowID).style.display ="none";
		document.getElementById("AudioTime" + this.windowID).innerHTML = "";
		document.getElementById("ScriptureHeaderAudio" + this.windowID).style.display = "none";
		if (siteControl.audioTypeAllowed!="None"){
			document.getElementById("AudioDDBtn" + this.windowID).style.display = "inline";
			document.getElementById("AudioPlayBtn" + this.windowID).style.display = "inline";
		}
		document.getElementById("AudioPauseBtn" + this.windowID).style.display = "none";
		document.getElementById("ScriptureHeaderAudio" + this.windowID).src = "";
		document.getElementById("audioGoTo" + this.windowID).value = "";
		document.getElementById("audioEndAt" + this.windowID).value = "";
	}
	populateVoiceList() {
		 let i=0;		
		 let voiceSelect = document.getElementById("voiceSelect" + siteControl.activeWindow);

		 for(i = 0; i < this.voices.length ; i++) {
			var option = document.createElement('option');
			if (this.voices[i].lang.substr(0,3)=="en-" || this.voices[i].lang.substr(0,3)=="he-" || this.voices[i].lang.substr(0,3)=="gr-" ){
				option.textContent =this.voices[i].name + ' (' + this.voices[i].lang + ')';
				option.setAttribute('value', this.voices[i].name);
				voiceSelect.appendChild(option);
			}
		}
	  }
    speechFullStop(){	
		this.fullStop=true;

		msg.removeEventListener('end',function () {
		window[this.callbackControl][this.callbackFunction]();
		});

		window["VoiceControl" + incre].voiceFleIncr++;
		window.speechSynthesis.cancel();		
	  }
    sayIt (sayMsg, callbackControl, callbackFunction) {
		//This is called from BibleRef?.primeSynthReF() for first time and BibleRef?.speechSayNext() for subsequent times.
		//console.log("zq In VC.sayIt");
		let msg ={};
		let incre=callbackControl.slice(-1);
		
		if (this.fullStop==true){
				window["VoiceControl" + incre].Ended(incre);
				return;
		}	
		if (this.isPaused!=true) {
			let selectedVoice=document.getElementById('voiceSelect'+incre).value;	
		
			//keep to be able to remove the listener from anywhere.
			this.callbackControl=callbackControl;
			this.callbackFunction=callbackFunction;

			//create speech object passing text
			sayMsg=sayMsg.replaceAll(" – ",", ");
			sayMsg=sayMsg.replaceAll("Job","Jobe");
			sayMsg=sayMsg.replaceAll(" live "," liv ");
			sayMsg=sayMsg.replaceAll(" lives "," livs ");
			//sayMsg=sayMsg.replaceAll(" lived ","liv");
			sayMsg=sayMsg.replaceAll("Elisha","ah-lye-sha");
			sayMsg=sayMsg.replaceAll("Nazirite","Naz-uh-rite");
						
			//console.log("zq sayMsg=" + sayMsg);
			msg = new SpeechSynthesisUtterance(sayMsg);
			//set speech settings 
			for(let i = 0; i < this.voices.length ; i++) 
				if(this.voices[i].name == selectedVoice) 
					msg.voice = this.voices[i];
			msg.rate=document.getElementById("audioRate" + incre).value;
			msg.pitch=document.getElementById("audioPitch" + incre).value;
			if (msg.rate<0.5)
				msg.rate=1;
			if (msg.pitch<0.5)
				msg.pitch=1;	
			}
		else
			this.isPaused=false;

		
		window.speechSynthesis.speak(msg);
		//console.log ("at end of sayIt next removing and then recalling " + callbackControl + "." + callbackFunction); 
		msg.removeEventListener('end',function () {
			window[callbackControl][callbackFunction]();
		});
		msg.addEventListener('end', function () {
			window[callbackControl][callbackFunction]();
		});
	}

	sayReference(ref){
		if (ref.substring(1,2)==" "){ //means it is a 1 2 3 or 4 such as 4 Maccabees
			if (ref.substring(0,1)=="1")
				ref="First " + ref.substring(2);
			else if (ref.substring(0,1)=="2")
				ref="Second " + ref.substring(2);				
			else if (ref.substring(0,1)=="3")
				ref="Third " + ref.substring(2);
			else if (ref.substring(0,1)=="4")
				ref="Fourth " + ref.substring(2);
			//console.log ("ref with 1st, 2nd, 3rd, or 4th:" + ref);	
		}

		ref=ref.replaceAll(":", " verse ");
		ref=ref.replaceAll("-"," to ");
		ref=ref.replaceAll("Job","Jobe");
		return ref  + ". ";
	}
	
	primeSynthRef(vFIncr) {
		//For a single refIteM, this should prime and read the first sentence (highlighting the text) 
		//and call back to speechSayNext to continue
			//console.log("zq primeSynthReF refItem:" + vFIncr);
			let refTextArr=window["BibleRef"+this.windowID].refText.split(";");
	
			if (window["BibleRef"+this.windowID].language=="Greek")
				this.cntTo=5;   //the most words sent to speak at one time
			else	
				this.cntTo=999;  //the most words sent to speak at one time
			
			//mark refWordArr (sWA) First Increment of 1 and Last Increment used in getSpeechTexT() 
										
		
			if (window["VoiceControl" + this.windowID].refFromToTop>1) //more than one reference so read aloud the reference. 
				this.sayIt(this.sayReference(refTextArr[this.voiceFle["o" + vFIncr].rArrI]) + this.getSpeechText() ,"VoiceControl"+ this.windowID,"speechSayNext");
			else
				this.sayIt(this.getSpeechText(),"VoiceControl"+ this.windowID,"speechSayNext");
	}

	speechSayNext(){
		//console.log("zq In speechSayNext -start");
		//UnMark Text
		if (this.markTextArr.length>0)
				for (let i=0; i<this.markTextArr.length;i++)
					if (document.getElementById(this.markTextArr[i])!=null)
						document.getElementById(this.markTextArr[i]).style.backgroundColor="var(--bgSW)";
		//prime for next set
		this.markTextArr=[];				

		
		// if (this.fullStop==true)
		// 	return;		
		
		//set to read the next sentence
		this.rWAFrstIncr=this.rWALstIncr;
		//console.log ("sWA Last Increment:" + this.rWALstIncr +  "  Top Increment:" + this.refWordArr.length)

		if (this.rWAFrstIncr+2>=this.refWordArr.length)  {  	
			this.fullStop=true;
		}
		if (this.fullStop==true)
			this.Ended(this.windowID);
		else {
			let scriptText = this.getSpeechText();
			this.sayIt(scriptText,"VoiceControl"+ this.windowID,"speechSayNext");
		}
	}

	getSpeechText(){
		//console.log("zq In getSpeechText");	
		//let i=0;
		let sayStr="";
		let bkNum=util.padNum(this.bookNum,2);
		
				
		//STOP if needed
			if (this.fullStop==true)
			return;
			
		//Get New Text to Say
		this.rWAIncr=this.rWAFrstIncr;
		this.cntFrom=this.rWAIncr;	
		do { 
			//check if at end of refWordArr
			if (this.rWAIncr>=this.refWordArr.length){
				break;
			}	
			//add word to sayStr	
			if (window["BibleRef"+this.windowID].language=="Greek")
				sayStr = sayStr + " " + util.Greek2English(this.refWordArr[this.rWAIncr][1]);
				else 	
				sayStr = sayStr + " " + this.refWordArr[this.rWAIncr][1];

			//add punctuation if present
			if (this.iPunctAfter<this.refWordArr[this.rWAIncr].length)
				sayStr = sayStr + this.refWordArr[this.rWAIncr][this.iPunctAfter];

			// mark word 
			if (null!=document.getElementById(window["BibleRef"+this.windowID].version + bkNum + this.refWordArr[this.rWAIncr][0]+ "-" + this.windowID)){	
				document.getElementById(window["BibleRef"+this.windowID].version + bkNum + this.refWordArr[this.rWAIncr][0]+ "-" + this.windowID).style.backgroundColor="var(--bgSWMark)";
				this.markTextArr.push(window["BibleRef"+this.windowID].version + bkNum + this.refWordArr[this.rWAIncr][0]+ "-" + this.windowID);
			}	
			
		} while(this.checkSpeechTextEnd());
		this.rWALstIncr=this.rWAIncr;

		if (typeof(this.refWordArr[this.rWAFrstIncr][0])=="undefined")
			console.info("Mark this line to find out why it went wrong");

		//scroll to verse
		let myStr=window["BibleRef"+this.windowID].version + bkNum + this.refWordArr[this.rWAFrstIncr][0]+ "-" + this.windowID;
		myStr=myStr.replaceAll(" ","");
		this.trackScroll(myStr,this.windowID);
		
		return sayStr;

	}
	checkSpeechTextEnd(){
		let rVal=true;

		if (this.rWAIncr>=this.refWordArr.length)
			return false;

			if ((this.rWAIncr-this.cntFrom)>=this.cntTo)
				rVal=false;	
				

		if (this.iPunctAfter<this.refWordArr[this.rWAIncr].length) 		
			if (this.refWordArr[this.rWAIncr][this.iPunctAfter].includes(".") || this.refWordArr[this.rWAIncr][this.iPunctAfter].includes("?") || this.refWordArr[this.rWAIncr][this.iPunctAfter].includes("!"))
				rVal=false;
				
		this.rWAIncr++;	

		if (this.rWAIncr>=this.refWordArr.length)
			rVal=false;

		return rVal;
	}

	

} //end object voiceControl

var uncoverGodsWord = {
	incre: 1,
	br:null, //will be BibleRef + incre
	vc:null, //will be VoiceControl + incre
	refCount: 0,
	refIncre: 0, //will count through refCount until done. 
	hasTopic:false,
	refListArr:[],
	refTextArr: [],
	refVersionArr:[], //enables each reference to have its own version
	version:"", //default version for these references - used if none specified on refList
	versionCount:0,
	paragraphId: 0,
	resetEnterVerse: false,
	arryW:[], //will have the bible book data 2d array
	
	//Run once:starting process - setup BR,SW, and UGW variables
	//called from RH.load2SW, SW.changeVersion, BR.parseRefEntered, closeTRBox (via BR.parseRefEnterd), and a couple others settings -
	//(Break on Sentence, Change Greek Display, setMode away from Reading to add show Lemma etc.)
	processScriptureData: function(incre,skipRHRowUpdate) {
		//Called from siteControl & SW setting changes
					//RH.load2SW 
					//BibleRef#.parseRefEntered & BibleRef#.ChangeVersion
					//closeTRBox (Topic/Reference)
		//stop any speech synthesis that may be reading. 
		window.speechSynthesis.cancel();

		this.incre=incre; //calls with SW/br window ID
		this.refIncre=0;  //initilize which ref from refListArr 
		this.resetEnterVerse=false;
		this.br = window["BibleRef" + incre];
		this.refVersionArr=this.br.versionArray;
		let i=0;
		 let prevBook="";
	
		if(this.br.topic.length>1){
			window["ScriptureWindow" + incre].showSWTopic();
			document.title=this.br.topic;	
		}	
		else {
			window["ScriptureWindow" + incre].showSWReference();
			document.title = this.br.refText;
		}	
	
		//set values 
		this.br.initialLoad = false;
	
		document.getElementById("ScriptureHeaderAudio1").style.display = "none";
		//update br variables 
		this.br.bookNum = this.br.refList.substr(0,2);
		this.br.refCount = (this.br.refList.match(/;/g) || []).length + 1;
		this.refCount=this.br.refCount;
		
		this.version=this.br.version; //later should be based on each refList
		////console.log("refCount:" + this.br.refCount);
	
		//set HTML Version and refText
		//get Version row
		i= util.getVersionrow(this.br.version);
		document.getElementById("VerBtn" + incre).innerHTML = versionData[i][1] + "  <i class='fa fa-caret-down caret-down' style='font-size:20px;'></i>";
		document.getElementById("enterVerse" + incre).value=this.br.refText;
	
		//set ScriptureFooter for the version
		if (window.matchMedia("(max-width: 625px)").matches)
			document.getElementById("ScriptureFooter" + incre).innerHTML = '<i id="ftrDD" class="fa fa-angle-double-down" onclick="siteControl.toggleFooter();"></i>' + versionData[i][5];
		else
			document.getElementById("ScriptureFooter" + incre).innerHTML = '<i id="ftrDD" class="fa fa-angle-double-down" onclick="siteControl.toggleFooter();"></i>' + versionData[i][4];
		if (siteControl.showFooter == false)
			document.getElementById("ftrDD").style.display = "inline";
		siteControl.setActiveWindowLanguage();
	
	
		//update RH History
		//maybe shouldn't call here but change Version in changeVersion etc. 
		if (skipRHRowUpdate==false)
			RH.updateRHRow(incre,RH.CurNum);		
			
		//Get arrays of refList and corresponding Versions and refText
		this.refListArr=this.removeVersionFromRefList(this.br.refList.split(";"));
		//this.refVersionArr=this.getVersionFromRefList(this.br.refList.split(";"),this.br.version);
		this.versionCount=this.countNumberOfVersions(this.refVersionArr);
		this.refTextArr = this.br.refText.split(";");


	//process based on mulitple Book references or not
		this.br.multipleBooks=false;

		//get br.multipleBooks boolean
		if (this.refCount>1){
			prevBook=this.br.refList.substr(0,2);
			for(i=0;i<this.refListArr.length;i++){
				if (prevBook!=this.refListArr[i].substr(0,2)){
					this.br.multipleBooks=true;
					break;
				}		
				else
					prevBook=this.refListArr[i].substr(0,2);
				}
		}
		else {   //single refCount
			if (this.br.ScrollToId=="")  //if blank then load first verse
				this.br.ScrollToId = this.br.bookNum + getRefCVW(this.br.refList,this.version,true) + "-" + this.windowID;
			//Set Video links
			this.br.setVideoLinks();
			//set PDF Links
			this.br.setPDFLinks();
		}
		
		//set VideoBar showing now that multipleBooks is set.
		window["ScriptureWindow" + incre].OptionshowVideoBarChange(false);
		
		//make adding Mark As Read visible again.
		document.getElementById('addMAR').style.display = "block";
	
		//Clear previous content in Scripture window.	
		document.getElementById("Scripture" + incre).innerHTML = "";
	
		uncoverGodsWord.loadScriptureData();
		//
	},
	//repeat for next undone reference: this is a separate function to ensure the AJAX calls are done before displaying scripture.
	loadScriptureData: function() {
		var fname = "";
		//more than number of references? if so STOP.
		if (this.refListArr.length < this.refIncre + 1) {
			return;
		}	
		//has a reference so load the data	
		var ver = this.version //this.br.version - leave this line to change when RefList can include versions;
		this.br.bookNum = this.refListArr[this.refIncre].substr(0, 2);
		this.br.bookNam = bibleBookData[Number(this.br.bookNum)][8];
		var arryW = "B" + this.br.bookNam + ver;
		var fname = ver + "/" + this.br.bookNam + ver + ".html";
	
		if (typeof window[arryW] == "undefined") { //This Book's Bible Data has not been loaded yet
		  //!!! Code for checking if in indexedDB
		  //is it there?
			//if yes then load it.
		  //else...			
			$.ajax({
				dataType: 'html',
				url: fname,
				success: function (result) {
					////console.log("this.br.refList Increment:" + this.refIncre);
					$("#ScriptureData").append(result);
					////console.log("success1");
					//this.incre, this.br.bookNum, this.br.bookNam, ver, this.refListArr[this.refIncre], this.refIncre
					uncoverGodsWord.displayScripture();
					uncoverGodsWord.loadScriptureData(this.refIncre);  //is incremented in displayScripture
					//!!! set delayed loading result into indexedDB
				},
				error: function () {
					$('#Scripture' + this.incre).html("Error Loading " + this.refListArr[this.refIncre] + " (by Data)<br><br>");
					console.error ("Could NOT LOAD BIBLE BOOK DATA");
				}
			});
		}
		else {
			uncoverGodsWord.displayScripture();
			uncoverGodsWord.loadScriptureData(this.refIncre); //is incremented in displayScripture
		}
	},	
	//
	displayScripture: function() {
			//Convert 8 digit BCV reference to 6 digit CVW start and end reference 19001002 to 010201-010299 
			//otype list:  p-paragraph, q-poetry line, blank-word,G-gloss(English Word), 
			//L-lemma,z-parse,v-verse, V-wordList verse and title, class "tnote"-translator note, class "rnote"-reference note 
			//t-section title (created in displaySectionTitleS)
		let i=0;
		let j=0;  //major loop increment through each word in wordArr 
		let k=0;
		let iPara=0;
		let ele;
		let nextRefInPara=true; //for
		let spanNoteInner="";
		let spanNote="";

		var endAt="";
		//grab just one reference - may be 8 character like BCV 60-001-000 or a "from and to" in that BCV format 60001010-600010017 
		var CVW = getRefCVW(this.refListArr[this.refIncre], this.version,false);
		var refLength = CVW.indexOf("-");
		var startAt = CVW.substr(0, refLength);  //chapter verse word order that reference starts at 
		if (refLength>5) //has a dash so get endat CVW 
			endAt = CVW.substr(refLength + 1);    //chapter verse word order that reference ends at

		////console.log("Array:" + "B" + this.br.bookNam + this.version + "   CVW startAt:" + startAt + "   CVW endAt:" + endAt);
		var refCVWIncre = refLength / 3;
		var addSentenceBreak = false;
		//set for mutliple reference Titles
		let currentTitleArr=["Title2","60001003-60001007"];
		let prevTitleArr=["Title","60001001-60001002"];

		if (this.resetEnterVerse==false) {
			$("#enterVerse" + this.incre).css("color", "var(--txtSW)");
			$("#VerDD" + this.incre).hide();
			this.resetEnterVerse=true;
		}		

		//get language from versionData table
		var lang = "";
		this.br.language="English";
		for (i = 0; i < versionData.length; i++) {
			if (this.version === versionData[i][0]){
				lang = versionData[i][2].replace("Old ", "");
				this.br.language=lang;
			}	
		}

		//Get Bible Data Arrays for Word and Paragraph
		let wordArr = window["B" + this.br.bookNam + this.version];
		//get row this.increment for each value
		var id = 0, word = 1, root = 2; 
		let lemma = getColumnIncre(wordArr[0], "lemma");
		let parse = getColumnIncre(wordArr[0], "parse");
		let PunctBefore = getColumnIncre(wordArr[0], "PunctBefore");
		let PunctAfter = getColumnIncre(wordArr[0], "PunctAfter");
		let gloss = getColumnIncre(wordArr[0], "ew");
		let glossCnt = getColumnIncre(wordArr[0], "ewLevel");
		let glossNum=1;
	
		var spc = " ";
		//other word variables
		var wordEndIncr = 0;	
		var verseNum = 0;  //used to track when a new verse starts so that can add verse reference
		var nextParaBCV = "99";
		let lastIPara=0;
		//html element variables
		var scrip, para, span, node, element, child, nodeV, spanV,spanT, spanLemma, spanParse,keepParaElement;

		var paraArr = window["para" + this.br.bookNam + this.version];

		//get If it has poetry q1-q4 (indent & line breaks)
		var hasPoet = false;
		if (typeof window["poet" + this.br.bookNam + this.version] != "undefined") {
			hasPoet = true;
			var poetArr = window["poet" + this.br.bookNam + this.version];
			var poeti = 1;
			var divQ; 
		}



		//Set variables
		//get wordArr start and end increment that matches the reference
		for (i = 1; i < wordArr.length; i++)
			if (startAt <= wordArr[i][0]) {
				break;
			}
		k = i;	
		for (i = k; i < wordArr.length; i++)
			if (endAt <= wordArr[i][0]) {
				break;
			}	
		wordEndIncr = i;

		verseNum = 0;  //used to track when a new verse starts so that can add verse reference

		//get poetArr start and end increment based on Scripture reference
		if (hasPoet == true) {
			for (i = 1; i < poetArr.length; i++)
				if (startAt <= poetArr[i]) {
					break;
				}
			var poetStartIncr = i;
			poeti = poetStartIncr;
			for (i = poetStartIncr; i < poetArr.length; i++)
				if (endAt <= poetArr[i]) {
					break;
				}
			var poetEndIncr = i;
			if (poetStartIncr == poetEndIncr)
				poetEndIncr++;
		}

		//get if this bookVer has notes
		var noteArr = window["note" + this.br.bookNam + this.version];
		var hasNote = false;
		if (typeof (noteArr) != "undefined"){
			hasNote = true;
			var notei = 1;
		}

		if (hasNote==true){
			for (i = 1; i < noteArr.length; i++)
				if (startAt <= noteArr[i][0]) {
					break;
				}
			var noteStartIncr = i;
			notei = noteStartIncr;
			for (i = noteStartIncr; i < noteArr.length; i++)
				if (endAt <= noteArr[i][0]) {
					break;
				}
			var noteEndIncr = i;
			if (noteStartIncr == noteEndIncr)
				noteEndIncr++;
	}
	
		//set limits for paragraph based on Scripture reference
		if (typeof (paraArr) == "undefined")
			console.info("no paragraphs in " + this.br.bookNam + this.version);
			//Add paragraphs for each chapter

		else {
			for (i = 0; i < paraArr.length; i++)
				if (startAt <= paraArr[i]) {
					break;
			}
			var paraStartIncr = i
			if ((startAt < paraArr[i] && i > 0) || i == paraArr.length)
				paraStartIncr = i - 1;
			for (i = paraStartIncr; i < paraArr.length; i++)
				if (endAt <= paraArr[i]) {
					break;
				}
			var paraEndIncr = i;
			if (paraStartIncr == paraEndIncr)
				paraEndIncr++;
		}

		//get scripture window
		scrip = document.getElementById("Scripture" + this.incre);

		//add each new paragraph or Chapter/Verse  
		// each word and verse should be a child of the paragraph or its child poetry line.
//************************************** Loop through Paragraphs ***************************************** 		
		for (iPara = paraStartIncr; iPara < paraArr.length && iPara < paraEndIncr; iPara++) {
			lastIPara=iPara; //set to check and break out of nextRefInPara loop below.
			para = document.createElement("p");
			para.setAttribute("id", "p" + this.version + this.br.bookNum + paraArr[iPara] + "-" + this.incre);
			para.setAttribute("data-otype", "paragraph");
			if (iPara + 1 < paraArr.length)
				nextParaBCV = paraArr[iPara + 1];
			else
				nextParaBCV = "Z";
	
			child = document.getElementById(paraArr[iPara]);
			scrip.insertBefore(para, child);
			element = document.getElementById("p" + this.version + this.br.bookNum + paraArr[iPara] + "-" + this.incre);
			keepParaElement=element;
	//****************************************************** Loop - special case of 2 mutiple refs being in same paragraph 
			while(nextRefInPara==true || iPara==lastIPara){ //for multiple separate Refs in same paragraph.   //
				//place each word within paragraph - adds words and punctuation/checks for poetry lines
		//*********************************************************** Loop through each word.		
				for (j = k; j < wordArr.length && j < wordEndIncr; j++) {
					if (wordArr[j][id] >= nextParaBCV) { //finished with this paragraph
						k = j;   //start next paragraph on this word
						////console.log("break for new paragraph on word " + j);
						break;
					}
					//Add poetry line div as a child of paragraph - words are then entered into poetry div
					if (hasPoet == true) {
						if (poeti < poetEndIncr && poeti < poetArr.length) {
							if (poetArr[poeti][0] == wordArr[j][id]) { //start poetry line parent 
								divQ = document.createElement("div");
								divQ.setAttribute("class", "q" + poetArr[poeti][1]);
								divQ.setAttribute("id", "q" + this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
								divQ.setAttribute("data-otype", "poetry line");
								element.appendChild(divQ);
								element = document.getElementById("q" + this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
							}
						}
					}	
					//create word span element
					span = document.createElement("span");
					span.setAttribute("id", this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
					span.setAttribute("class", "wrd");
					span.setAttribute("data-otype", "word");
					if (lang != "Greek") { //make data-rt with Root
						if (wordArr[j][root].slice(0, 1) == "=") //starts with an equals
							if (wordArr[j][root] == "=") //only an = so the root is exactly the same as the word
								span.setAttribute("data-rt", wordArr[j][word]);
							else //has a number to drop off end (i.e. word of 'trusting' has a root of =3 so cut off last three to make root of "trust")
								span.setAttribute("data-rt", wordArr[j][word].slice(0, wordArr[j][word].length - wordArr[j][root].slice(1)));
						else
							span.setAttribute("data-rt", wordArr[j][root]);
					}
					else {  //get English Word for Greek 
						//create Gloss span - if has the column
						if (gloss < 99 && wordArr[j].length > gloss) {
							//if gloss is not an empty string
							if (wordArr[j][gloss].length > 0) {
								spanGloss = document.createElement("a");
								spanGloss.setAttribute("id", "G" + this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
								if ( wordArr[j][glossCnt]==0)  //!!! Should fix data with 0 gloss Level
									wordArr[j][glossCnt]=1;								
								spanGloss.setAttribute("class", "ew" + wordArr[j][glossCnt]);
								spanGloss.setAttribute("href", "#");
								spanGloss.setAttribute("data-otype", "gloss");
								if (window["ScriptureWindow" + this.incre].showGloss < wordArr[j][glossCnt])
									spanGloss.setAttribute("style", "display:none");
								else
									spanGloss.setAttribute("style", "display:inline");
								node = document.createTextNode(util.getGreekText(wordArr[j][gloss]));
								spanGloss.appendChild(node);
							}
						}
					}
					//set data-lm (lemma) and data-parse in word span
					if (wordArr[j].length > lemma) {
						//				////console.log("wordArr length: " + wordArr[j].length + "    lemma column: " + lemma);
						if (lemma != 99 && wordArr[j][lemma].length > 0)
							span.setAttribute("data-lm", wordArr[j][lemma]);
						if (parse != 99 && wordArr[j][parse].length > 0)
							span.setAttribute("data-parse", wordArr[j][parse]);
					}
					
					//set text node for word span with or without punctuation / include spanNote if needed
					if (hasNote==true && notei<noteArr.length){
						if (wordArr[j][0]==noteArr[notei][0]){
							spanNoteInner=document.createElement("span");
							spanNoteInner.setAttribute("id", noteArr[notei][1].toLowerCase() + this.version + this.br.bookNum + wordArr[j][id] + "-" + this.incre);							
							spanNoteInner.setAttribute("class","tooltiptextNote");
							spanNoteInner.innerHTML=noteArr[notei][2];
							spanNote=document.createElement("span");
							spanNote.setAttribute("id",noteArr[notei][1] + this.version + this.br.bookNum + wordArr[j][id] + "-" + this.incre);							
							spanNote.setAttribute("class","tooltipNote tnote");
							if (noteArr[notei][1]=="R")
								spanNote.setAttribute("data-otype","rnote")	
							else	
								spanNote.setAttribute("data-otype","tnote");
							
							spanNote.append(noteArr[notei][1],spanNoteInner);
							notei++;
						}	
					}	 

					//add word to span
					if (wordArr[j].length < PunctAfter) { //without punctuation
						if (lang != "Greek"){
							//node = document.createElement("span");
							span.append(spc + wordArr[j][word], spanNote);
							//node = document.createTextNode(spc + wordArr[j][word] + spanNote);
						}
						else{
							//node = document.createElement("span");
							span.append(spc + util.getGreekText(wordArr[j][word]));
							// node = document.createTextNode(spc + util.getGreekText(wordArr[j][word]));
						}
					}
					else {
						if (lang != "Greek") { //with punctuation - check if SentenceNewLine is on and needed for this punctuation,
							//node = document.createElement("span");
							span.append(spc + wordArr[j][PunctBefore] + wordArr[j][word], spanNote, wordArr[j][PunctAfter]);
														
							// node = document.createTextNode(spc + wordArr[j][PunctBefore] + wordArr[j][word] + spanNote + wordArr[j][PunctAfter]);
							if (window["ScriptureWindow" + this.incre].displaySentenceNewLine == true)
								if (wordArr[j][PunctAfter].includes(".") || wordArr[j][PunctAfter].includes("?") || wordArr[j][PunctAfter].includes("!"))
									addSentenceBreak = true;
						}
						else
							span.append(spc + wordArr[j][PunctBefore] + util.getGreekText(wordArr[j][word]) + wordArr[j][PunctAfter]);
					}
					//add text node to word span
					//span.append(node);
					//span.appendChild(node);
					child = document.getElementById(span);
		
					//add lemma and parsing spans after word span
					if (window["ScriptureWindow" + this.incre].setupMode != "Reading") {
						//create lemma span - if have a lemma column
						if (lemma < 99 && wordArr[j].length > lemma) {
							//if lemma is not an empty string
							if (wordArr[j][lemma].length > 0) {
								spanLemma = document.createElement("a");
								spanLemma.setAttribute("id", "L" + this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
								spanLemma.setAttribute("class", "lmma");
								spanLemma.setAttribute("href", "#");
								spanLemma.setAttribute("data-otype", "lemma");
								if (window["ScriptureWindow" + this.incre].showLemma == 0)
									spanLemma.setAttribute("style", "display:none");
								else
									spanLemma.setAttribute("style", "display:inline");
								node = document.createTextNode(util.getGreekText(wordArr[j][lemma]));
								spanLemma.appendChild(node);
							}
						}
		
						//create parsing span
						if (wordArr[j].length > parse) {
							spanParse = document.createElement("a");
							spanParse.setAttribute("id", "z" + this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
							spanParse.setAttribute("class", "prs");
							spanParse.setAttribute("href", "#");
							spanParse.setAttribute("data-otype", "parse");
							if (window["ScriptureWindow" + this.incre].showParsing == 0)
								spanParse.setAttribute("style", "display:none");
							else
								spanParse.setAttribute("style", "display:inline");
							node = document.createTextNode(wordArr[j][parse]);
							spanParse.appendChild(node);
						}
					}
					//Add verse number
					if (verseNum != Number(wordArr[j][id].substr(refCVWIncre, refCVWIncre))) {
						//does it need Verse title for WordList heading? 
						//check if refListArr[refIncre] matches current CV for first word of verse
						if (this.br.refCount>1 && (wordArr[j][id]==getRefCVW(this.refListArr[this.refIncre], this.version,true))){
							//If multiple references in this.br.refList then get human read reference 
							//get verse reference
							spanV = document.createElement("div");
							spanV.setAttribute("class", "vrsTtl");
							spanV.setAttribute("id", "V" + this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
							spanV.setAttribute("data-otype", "verse list");
							nodeV=document.createTextNode(this.refTextArr[this.refIncre]);
							spanV.appendChild(nodeV);
							element.insertBefore(spanV, child);

							//get title 
							if (this.br.bookNum<=66) {
								currentTitleArr=this.getTitleArray(this.br.bookNum + wordArr[j][id]);	
								if (currentTitleArr[0]!=prevTitleArr[0]){ //not the same as last ref Title 
									prevTitleArr[0]=currentTitleArr[0];
									prevTitleArr[1]=currentTitleArr[1];

									spanT = document.createElement("span");
									spanT.setAttribute("class", "verseTitle");
									spanT.setAttribute("id", "t" + this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
									spanT.setAttribute("data-otype", "verse title");
									if  (currentTitleArr[0]!="No Title")							
										spanT.setAttribute("onclick","displayVerses('" + this.br.version + "','" + "codetext" + "','" + currentTitleArr[1]  + "','" + currentTitleArr[0]  + "');");
									nodeV=document.createTextNode(currentTitleArr[0]);
									spanT.appendChild(nodeV);
									spanV.insertBefore(spanT, child);
								}
							}
						}
						else {
							spanT="";
							spanV = document.createElement("span");
							spanV.setAttribute("class", "vrs");
							spanV.setAttribute("id", "v" + this.version + this.br.bookNum + wordArr[j][id]+ "-" + this.incre);
							spanV.setAttribute("data-otype", "verse");
							if (window["ScriptureWindow" + this.incre].showVerseNumbers == 0)
								spanV.setAttribute("style", "display:none");
							else
								spanV.setAttribute("style", "display:inline");
			
							if (j != k) //not a pragraph beginning
								nodeV = document.createTextNode(Number(wordArr[j][id].substr(refCVWIncre, refCVWIncre)));
							else
								nodeV = document.createTextNode(Number(wordArr[j][id].substr(0, refCVWIncre)) + ":" + Number(wordArr[j][id].substr(refCVWIncre, refCVWIncre)));
							spanV.appendChild(nodeV);
							element.insertBefore(spanV, child);
						}
						verseNum = Number(wordArr[j][id].substr(refCVWIncre, refCVWIncre));
					}
		
					//add word span
					element.insertBefore(span, child);
					//clear value in spanNote which is a childnode of span. Otherwise the last note in noteArr will keep moving the note to the end of the last word.
					spanNote="";
		
					if (lang == "Greek") {
						//add gloss
						if (gloss < 99 && wordArr[j].length > gloss) {
							//if gloss is not an empty string
							if (wordArr[j][gloss].length > 0)
								element.insertBefore(spanGloss, child);
						}
					}
					if (window["ScriptureWindow" + this.incre].setupMode != "Reading") {
						//add lemma span - if lemma in columns
						if (lemma < 99 && wordArr[j].length > lemma) {
							//if lemma is not an empty string
							if (wordArr[j][lemma].length > 0)
								element.insertBefore(spanLemma, child);
						}
						//add parsing span 
						if (parse < 99 && wordArr[j].length > parse) {
							//if parse is not an empty string
							if (wordArr[j][parse].length > 0)
								element.insertBefore(spanParse, child);
						}
					}
		
					//end poetry line stop adding to line and return to adding to paragraph
					if (hasPoet == true) {
						if (poeti < poetArr.length) {
							if (poetArr[poeti][2] == wordArr[j][id]) { //end poetry line parent
								element = keepParaElement; 
								poeti++;
							}
						}
					}
					//break if end of sentence
					if (addSentenceBreak == true) {
						br = document.createElement("br");
						element.insertBefore(br, child);
						//				element.insertBefore(br, span.nextSibling);
						addSentenceBreak = false;
					}
		
				}
				//check if a single refIncre or the  last refIncre
				if (this.refListArr.length<=this.refIncre + 1) 
						nextRefInPara=false;
				//check if next Reference is same book and paragraph (and should do version also) 		
				else if (this.br.bookNum ==this.refListArr[this.refIncre+1].substr(0, 2) && getRefCVW(this.refListArr[this.refIncre+1],this.version,true)<paraArr[paraEndIncr]){
					nextRefInPara=true;
					this.refIncre++;
					CVW = getRefCVW(this.refListArr[this.refIncre], this.version,false);
					startAt = CVW.substr(0, refLength);  //chapter verse word order that reference starts at 
					endAt = CVW.substr(refLength + 1);    //chapter verse word order that reference ends at

						//get wordArr start and end increment that matches the reference
						for (i = 1; i < wordArr.length; i++)
							if (startAt <= wordArr[i][0]) {
								break;
							}
						k = i;
					
						for (i = k; i < wordArr.length; i++)
							if (endAt <= wordArr[i][0]) {
								break;
							}	
						wordEndIncr = i;
						verseNum = 0;  //used to track when a new verse starts so that can add verse reference

						//get poetArr start and end increment based on Scripture reference
						if (hasPoet == true) {
							for (i = 1; i < poetArr.length; i++)
								if (startAt <= poetArr[i]) {
									break;
								}
							var poetStartIncr = i;
							poeti = poetStartIncr;
							for (i = poetStartIncr; i < poetArr.length; i++)
								if (endAt <= poetArr[i]) {
									break;
								}
							var poetEndIncr = i;
							if (poetStartIncr == poetEndIncr)
								poetEndIncr++;
						}
				}	
				else 
					nextRefInPara=false; 
				
				if (nextRefInPara==false)
					lastIPara=-1; //used to break out of this while nextRefInPara loop so can get next paragraph
			} //while nextRefInPara==true	
		} //paragraph loop
			//add white space at bottom of Scripture section.
 			br0 = document.createElement("br");
			br1 = document.createElement("br");
			br2 = document.createElement("br");
			document.getElementById("Scripture" + this.incre).append(br0,br1,br2);

		//add Section Titles
		if (window["ScriptureWindow" + this.incre].showSectionTitles == true)
			if (this.refCount==1) 
				displaySectionTitles(this.br.bookNum, this.br.bookNam, this.version, this.incre, startAt, endAt,"SW");
		
		//if last refIncre after adding a few blank lines at end
		//then scroll to previous place in RH 
		if (this.refListArr.length<=this.refIncre + 1){
			if(this.br.ScrollToId != "") { //if there is a ScrollToId value
				let scrollTo=this.br.ScrollToId;
				//try section Title first
				ele=document.getElementById("t" + siteControl.sectionTitleDefault + scrollTo);
				if(typeof(ele) == 'undefined' || ele == null) 
					//try paragraph
					ele=document.getElementById("p" + this.version + scrollTo);
					if(typeof(ele) == 'undefined' || ele == null) 
					//try Verse Title
					ele=document.getElementById("V" + this.version + scrollTo);
					if(typeof(ele) == 'undefined' || ele == null) 
						//try word (verse may be hidden)
						ele=document.getElementById(this.version + scrollTo);
				
				//if it found any of those		
				if(typeof(ele) != 'undefined' && ele != null) 
					if (elementInViewportTotally(ele) == false){ //don't scroll if already in viewport
							ele.scrollIntoView();
							rootBody("auto");
						}					
				}
		// and then Get RefFromTO the 
		console.log("calling refFromTO");
		this.br.fillRefFromTo(true); //it will fill the refFromTO string and then call startAudioFileProcesS with it.	
		}
			
		this.refIncre++;
	},	
	removeVersionFromRefList: function(refListArr){
		let newArr=[];
		let i=0;
		
		for (i=0;i<refListArr.length;i++){
			if (isNaN(refListArr[i].slice(-3))==true) //should be the Version - so drop it
				newArr.push(refListArr[i].substr(0,refListArr[i].length-3));
			else //no version just add the Reference
				newArr.push(refListArr[i]);
		}
		return newArr;
	},
	getVersionFromRefList: function(refListArr,defaultVersion){
		let newArr=[];
		let i=0;
		
		for (i=0;i<refListArr.length;i++){
			if (isNaN(refListArr[i].slice(-3))==true) //should be the Version - so add it
				newArr.push(refListArr[i].slice(-3));
			else //no version just add the default
				newArr.push(defaultVersion);
		}
		return newArr;
	},
	countNumberOfVersions: function(refVersionArr){
		let i=1;
		let cnt=1;
		let addedAlready=refVersionArr[0] + ",";

		for(i=1;i<refVersionArr.length;i++)
			if (!(addedAlready.includes(refVersionArr[i]+","))){
				addedAlready=addedAlready + refVersionArr[0] + ",";
				cnt++;
			}	
		
		return cnt;	
	},
	getTitleArray: function(refBCVW){
		let returnArr=[]; //format: Title, ccvvww-cc2vv2ww2 (or cccvvvwww-cccvvvwww)
		let refLength=(refBCVW.length-2)/3;
		let beginRow=0;
		let finalRow=0;
		let nine="9";
		let i=0;
	
		let c=0;
		let v=0;

		let ref2="60001002";

		let bb=Number(refBCVW.substr(0,2));
		let cc=Number(refBCVW.substr(2,refLength));
		let vv=Number(refBCVW.substr(2+refLength,refLength));
		
		//get sectionTitles column for version title
		// for (i=4;i<sectionTitles[0].length;i++)
		// 	if (sectionTitles[0][i]==siteControl.sectionTitleDefault)
		// 		break;
		let ttle=4;	
		
		//get the same or first higher BCV
		for (i=0;i<sectionTitles.length;i++)
			if (sectionTitles[i][0]==bb){
				if(sectionTitles[i][1]==cc && sectionTitles[i][2]>=vv)
					break;
				else if (sectionTitles[i][1]>cc)
					break;
			}	
			else if (sectionTitles[i][0]>bb) //past the book 		
					break;
		
		beginRow=i;

		//check if beginRow is outside of array length	
		if (beginRow>=sectionTitles.length){
			if (bb==66 && cc==22) //last book and chapter of Bible
				beginRow=--i;
			else {	
				console.error ("Could NOT find section title row for " + refBCVW);
				returnArr=["No Title","No Reference"];
				return returnArr;
			}
		}

		////console.log ("1st pass  - begin row Title:" + sectionTitles[beginRow][0] + "-" + sectionTitles[beginRow][1] + "-" + sectionTitles[beginRow][2]+ ": " + sectionTitles[beginRow][4]);

		//get BSB section title		
		//find the row with a "BSB" title that equals or proceed the refBCVW
		for (i=beginRow;i>beginRow-20 && i > 0;i--){
			if (bb!=sectionTitles[i][0]) { //not in book
				i--;
				while (sectionTitles[i][ttle].length<2)
					i--;
				break;
			}	

			if (sectionTitles[i][ttle].length<2)
				continue;
		
			if (sectionTitles[i][0]==bb){
			 	if(sectionTitles[i][1]==cc && sectionTitles[i][2]<=vv){
					beginRow=i;
					break;
				}	
				else if (sectionTitles[i][1]<cc){
					beginRow=i;
					break;
				}	
			}
		 }

		beginRow=i;
		
		////console.log ("2nd pass  - begin row Title:" + sectionTitles[beginRow][0] + "-" + sectionTitles[beginRow][1] + "-" + sectionTitles[beginRow][2]+ ": " + sectionTitles[beginRow][4]);
		c=sectionTitles[beginRow][1];
		v= sectionTitles[beginRow][2];
		////console.log ("2st pass  - begin row Title:" + sectionTitles[beginRow][0] + " " + sectionTitles[beginRow][1] + " " + sectionTitles[beginRow][2]+ " " + sectionTitles[beginRow][4]);

		//find the next row with BSB title to get ending for this section
		for (i=beginRow+1;i<sectionTitles.length;i++)
			if (sectionTitles[i][ttle].length>1){
				finalRow=i;
				break;
			}	


		////console.log("beginRow:" + beginRow + "    final row:" + finalRow +  "  i:" + i);
		
		if (i==sectionTitles.length) {// could be last section of Bible OR ERROR 
			if (bb==66)
				ref2="66022021";
			else { //somethings messed up
				console.error ("No Title Found");
				returnArr=["No Title","No Reference"];
				return returnArr;
			}	 
		}
		else{ //get verse before the one with the new title
			////console.log ("get one verse before:" +  util.padNum(sectionTitles[finalRow][0],2) + util.padNum(sectionTitles[finalRow][1],3) + util.padNum(sectionTitles[finalRow][2],3));
			ref2=getOneVerseBefore(util.padNum(sectionTitles[finalRow][0],2) + util.padNum(sectionTitles[finalRow][1],3) + util.padNum(sectionTitles[finalRow][2],3));
		}	
		returnArr.push(sectionTitles[beginRow][ttle],util.padNum(bb,2) + util.padNum(c,3)+ util.padNum(v,3) + "-" + ref2);	
		return returnArr;		
	}
} //end uncoverGodsWord

var origLang={
   oLObj:{},
   oLObj2:{},
   dStrongObj:{},
   parseObj:{},	
    
   loadData: function (vrs){  //vrs is formatted as b.c.v
	//console.log("In OrigLang loadData for verse:" + vrs);

	let ref = [0, 0, 0];

	let sqlText="";
	let sqlText2="";

	ref = vrs.split(".");

	//remove previous oLObj
	origLang.oLObj={};
	origLang.oLObj2={};
	
	if(ref[0]>39 && ref[0]<67) {
		sqlText='SELECT * FROM `AmalGNT` WHERE `Book`=' + ref[0] + ' AND `Chapter`=' + ref[1] + ' AND `Verse`=' + ref[2] + ' Order BY `WordOrder`'
	}
	else if(ref[0]>66){
		sqlText='SELECT * FROM `LXX` WHERE `Book`=' + ref[0] + ' AND `Chapter`=' + ref[1] + ' AND `Verse`=' + ref[2] +' Order BY `WordOrder`'
	}	
	else{ 
		sqlText='SELECT * FROM `AmalHOT` WHERE `Book`=' + ref[0] + ' AND `Chapter`=' + ref[1] + ' AND `Verse`=' + ref[2] +' Order BY `WordOrder`;' ;
		sqlText2='SELECT * FROM `LXX` WHERE `Book`=' + ref[0] + ' AND `Chapter`=' + ref[1] + ' AND `Verse`=' + ref[2] +' Order BY `WordOrder`';
	}

	$.post("loadGeneric2JSON.php", {
		sqlText:sqlText
	},
		function (result) {
			if(result.includes("no rows returned with SQL of")|| (result =="Forbidden SQL Statement"))
				console.error (result);
			else {	
				origLang.oLObj=JSON.parse(result);
				if (sqlText2=="")
					origLang.displayOrigLang();
				else if (Object.keys(origLang.oLObj).length != 0  && Object.keys(origLang.oLObj2).length != 0 )
					origLang.displayOrigLang();
			}		
		}
	);

	if (sqlText2!=""){
		$.post("loadGeneric2JSON.php", {
			sqlText:sqlText2
		},
			function (result) {
				if(result.includes("no rows returned with SQL of")|| result =="Forbidden SQL Statement")
					console.error (result);
				else {					
					origLang.oLObj2=JSON.parse(result);
					if (Object.keys(origLang.oLObj).length != 0  && Object.keys(origLang.oLObj2).length != 0 )
						origLang.displayOrigLang();				
				}
			}
		);
	}
},

displayOrigLang: function(){
	let Language="";
	let tblFormat="";
	let Bk=origLang.oLObj[0].Book;
	let Chp=origLang.oLObj[0].Chapter;
	let Vrs = origLang.oLObj[0].Verse;
	
	if (Bk>39 && Bk<67) { //NT
		Language="Greek";
		
		tblFormat="<table id='Greek" + util.padNum(Bk,2) + util.padNum(Chp,3) + util.padNum(Vrs,3) + "'><tr><th>English</th><th>Word</th><th>Parse</th><th>Lemma</th><th>Strongs</th></tr>"
		for (let i=0;i<origLang.oLObj.length;i++)
			tblFormat+="<tr><td>" + origLang.oLObj[i].English + "</td><td>" + origLang.oLObj[i].Word + " (" + origLang.oLObj[i].Phonetic + ")</td><td><a href='#' onclick='origLang.getParse(\"" + origLang.oLObj[i].Parse + "\")'>" + origLang.oLObj[i].Parse + "</a></td><td>" + origLang.oLObj[i].Lemma + "</td><td><a href='#' onclick='origLang.getStrongs(\"" + origLang.oLObj[i].dStrongs + "\",\"dStrong\")'>" + origLang.oLObj[i].dStrongs  + "</a></td></tr>";
		tblFormat+="</table>";
		document.getElementById('origLangBoxFooter').innerHTML="Data from <a href='www.STEPBible.org'>STEP Bible</a>";		
	}	
	else if (Bk<40) { //OT
		Language="Hebrew and Greek";		
		tblFormat="<table id='Hebrew" + util.padNum(Bk,2) + util.padNum(Chp,3) + util.padNum(Vrs,3) + "'><tr><th>English</th><th>Word</th><th>Grammar</th><th>Strongs</th></tr>";
		for (let i=0;i<origLang.oLObj.length;i++)
			tblFormat+="<tr><td>" + origLang.oLObj[i].Translation + "</td><td>" + origLang.oLObj[i].Hebrew + " (" + origLang.oLObj[i].Transliteration + ")</td><td>" + origLang.markHebrewGrammar(origLang.oLObj[i].Grammar) + "</td><td>" + origLang.markHebrewdStrong(origLang.oLObj[i].dStrongs) + "</td></tr>";
		tblFormat+="</table>";
		document.getElementById('origLangBoxFooter').innerHTML="Hebrew from <a href='www.STEPBible.org'>STEP Bible</a>.  Greek  ";
		
		//get LXX data
		tblFormat+="<br><br>Greek LXX <table id='Greek" + util.padNum(Bk,2) + util.padNum(Chp,3) + util.padNum(Vrs,3) + "'><tr><th>Gloss</th><th>Word</th><th>Parse</th><th>Lemma</th><th>Strongs</th></tr>"
		for (let i=0;i<origLang.oLObj2.length;i++)
			tblFormat+="<tr><td>" + origLang.oLObj2[i].Gloss + "</td><td>" + origLang.oLObj2[i].Word + " (" + origLang.oLObj2[i].transliteration + ")</td><td><a href='#' onclick='origLang.getParsing(\"" + origLang.oLObj2[i].Parsing + "\")'>" + origLang.oLObj2[i].Parsing + "</a></td><td>" + origLang.oLObj2[i].Lemma + "</td><td><a href='#' onclick='origLang.getStrongs(\"" + origLang.oLObj2[i].Strongs + "\",\"eStrong\")'>" + origLang.oLObj2[i].Strongs  + "</a></td></tr>";
		tblFormat+="</table>";
	}
	else {
		//get LXX data
		Language="Greek";
		tblFormat+="<br><br>Greek LXX <table id='Greek" + util.padNum(Bk,2) + util.padNum(Chp,3) + util.padNum(Vrs,3) + "'><tr><th>Gloss</th><th>Word</th><th>Parse</th><th>Lemma</th><th>Strongs</th></tr>"
		for (let i=0;i<origLang.oLObj.length;i++)
			tblFormat+="<tr><td>" + origLang.oLObj[i].Gloss + "</td><td>" + origLang.oLObj[i].Word + " (" + origLang.oLObj[i].transliteration + ")</td><td><a href='#' onclick='origLang.getParsing(\"" + origLang.oLObj[i].Parsing + "\")'>" + origLang.oLObj[i].Parsing + "</a></td><td>" + origLang.oLObj[i].Lemma + "</td><td><a href='#' onclick='origLang.getStrongs(\"" + origLang.oLObj[i].Strongs + "\",\"eStrong\")'>" + origLang.oLObj[i].Strongs  + "</a></td></tr>";
		tblFormat+="</table>";
	}
		
	document.getElementById('origLangMsg').style.display = 'none';
	document.getElementById('origLangBoxHeader').innerHTML = Language + " for " + bibleBookData[Number(Bk)][1] + " " + origLang.oLObj[0].Chapter + ":" + origLang.oLObj[0].Verse;
	document.getElementById('origLangBoxMain').innerHTML = tblFormat;
	//document.getElementById('origLangBoxFooter').innerHTML = version;
	document.getElementById('origLangBox').style.zIndex = 26;
	document.getElementById('origLangBox').style.width = "90vw";
	document.getElementById('origLangBox').style.left = '2rem';
	document.getElementById('origLangBox').style.top = '1rem';
	document.getElementById('origLangBox').style.display = 'block';
},

getStrongs: function(Strongs, Fld) {	
	if (Fld=="eStrong")
		if (Strongs.length<5)
			Strongs=Strongs.substring(0,1) + util.padNum(Strongs.substring(1),4);

	
	let sqlText="SELECT * FROM `eStrongsGreek` WHERE `" + Fld + "`='" + Strongs + "'  ORDER BY `dStrong`;";
	//remove previous 
	origLang.dStrongObj={};

	console.log (sqlText);

	$.post("loadGeneric2JSON.php", {
		sqlText:sqlText
	},
	function (result) {
		if(result.includes("no rows returned with SQL of")|| result =="Forbidden SQL Statement")
			console.error (result);
		else {	
			origLang.dStrongObj=JSON.parse(result);
			console.log("getStrongs result: " + result);
			console.log("getStrongs result as JSON: " + JSON.parse(result));

			document.getElementById('origLangMsgHeader').innerHTML = "Strongs " + origLang.dStrongObj[0].dStrong;
			document.getElementById('origLangMsgMain').innerHTML = "Greek Lemma: " +  origLang.dStrongObj[0].Greek + " (" +  origLang.dStrongObj[0].Transliteration + ")<br> Morphology: " +  origLang.dStrongObj[0].Morph + "<br>Gloss: " +  origLang.dStrongObj[0].Gloss + "<br> Meaning: " +  origLang.dStrongObj[0].BriefMeaning;
			document.getElementById('origLangMsg').style.display = 'block';
			//document.getElementById('origLangMsgFooter').innerHTML = $(v).text();	
		}
	}
	);
},

getParse: function(parse){
	let sqlText="SELECT * FROM `AmalGNTParse` WHERE `Parse`='" + parse + "';";
	//remove previous 
	origLang.parseObj={};

	console.log (sqlText);

	$.post("loadGeneric2JSON.php", {
		sqlText:sqlText
	},
	function (result) {
		if(result.includes("no rows returned with SQL of")|| result =="Forbidden SQL Statement")
			console.error (result);
		else {	
			origLang.parseObj=JSON.parse(result);
			console.log("getparse result: " + result);
			console.log("getparse result as JSON: " + JSON.parse(result));

			document.getElementById('origLangMsgHeader').innerHTML = origLang.parseObj[0].Parse;
			document.getElementById('origLangMsgMain').innerHTML =  origLang.parseObj[0].FullKey.replaceAll(";","<br>");
			document.getElementById('origLangMsg').style.display= 'block';
			//document.getElementById('origLangMsgFooter').innerHTML = $(v).text();	
		}
	}
	);
},

getParsing: function(parse){
	let sqlText='SELECT * FROM `LXXParse` WHERE `Parse`="' + parse + '";';
	//remove previous 
	origLang.parseObj={};

	console.log (sqlText);

	$.post("loadGeneric2JSON.php", {
		sqlText:sqlText
	},
	function (result) {
		if(result.includes("no rows returned with SQL of")|| result =="Forbidden SQL Statement")
			console.error (result);
		else {	
			origLang.parseObj=JSON.parse(result);
			console.log("getparse result: " + result);
			console.log("getparse result as JSON: " + JSON.parse(result));
			document.getElementById('origLangMsgHeader').innerHTML = origLang.parseObj[0].Parse;
			document.getElementById('origLangMsgMain').innerHTML = origLang.parseObj[0].FullKey.replaceAll("｜", "<br>");
			document.getElementById('origLangMsg').style.display= 'block';
			//document.getElementById('origLangMsgFooter').innerHTML = $(v).text();	
		}
	}
	);
},
getHebStrongs: function(dStrongs) {	
	let sqlText="SELECT * FROM `eStrongsHebrew` WHERE `dStrong`='" + dStrongs + "'  ORDER BY `dStrong`;";
	//remove previous 
	origLang.dStrongObj={};

	console.log (sqlText);

	$.post("loadGeneric2JSON.php", {
		sqlText:sqlText
	},
	function (result) {
		if(result.includes("no rows returned with SQL of")|| result =="Forbidden SQL Statement")
			console.error (result);
		else {		
			origLang.dStrongObj=JSON.parse(result);
			console.log("getStrongs result: " + result);
			console.log("getStrongs result as JSON: " + JSON.parse(result));

			document.getElementById('origLangMsgHeader').innerHTML = "Strongs " + origLang.dStrongObj[0].dStrong;
			document.getElementById('origLangMsgMain').innerHTML = "Hebrew: " +  origLang.dStrongObj[0].Hebrew + " (" +  origLang.dStrongObj[0].Transliteration + ")<br> Morphology: " +  origLang.dStrongObj[0].Morph + "<br>Gloss: " +  origLang.dStrongObj[0].Gloss + "<br> Meaning: " +  origLang.dStrongObj[0].Meaning;
			document.getElementById('origLangMsg').style.display = 'block';
			//document.getElementById('origLangMsgFooter').innerHTML = $(v).text();	
		}
	}
	);
},

markHebrewdStrong: function(hText){
    let hTexti="";
    let hTextStr="";
    let hText2=hText;
    hText2=hText2.replaceAll("|","/");
    let hTextArr=[];
    hTextArr=hText2.split("/");
    for(let i=0;i<hTextArr.length;i++){
        if (hTextArr[i].substring(0,1)=="{")
            hTexti="<a href='#' onclick='origLang.getHebStrongs(\"" + hTextArr[i].substring(1).replaceAll("}","") + "\")'>" + hTextArr[i] + "</a>";  
        else
            hTexti="<a href='#' onclick='origLang.getHebStrongs(\"" + hTextArr[i] + "\")'>" + hTextArr[i] + "</a>";
        
        if (hTextStr=="")
            hTextStr=hTexti;
        else
            hTextStr+="/" + hTexti;
    }	
    return hTextStr;	
	},

getGrammar: function(lang, grammar) {	
	let sqlText="SELECT * FROM `AmalHOTGrammar` WHERE `Lang`='" + lang + "' AND `Grammar`='" + grammar + "';";
	//remove previous 
	origLang.parseObj={};

	console.log (sqlText);

	$.post("loadGeneric2JSON.php", {
		sqlText:sqlText
	},
	function (result) {
		if(result.includes("no rows returned with SQL of")|| result =="Forbidden SQL Statement")
			console.error (result);
		else {	
			origLang.parseObj=JSON.parse(result);
			console.log("getGrammar result: " + result);
			console.log("getGrammar result as JSON: " + JSON.parse(result));

			document.getElementById('origLangMsgHeader').innerHTML = origLang.parseObj[0].Lang + origLang.parseObj[0].Grammar;
			document.getElementById('origLangMsgMain').innerHTML =  origLang.parseObj[0].FullKey.replaceAll(";","<br>");
			document.getElementById('origLangMsg').style.display= 'block';
			//document.getElementById('origLangMsgFooter').innerHTML = $(v).text();	
		}
	}
	);

},
markHebrewGrammar: function(hText){
    let hTexti="";
    let hTextStr="";
	let lang=hText.substr(0,1);
    let hText2=hText.substr(1);
    hText2=hText2.replaceAll("|","/");
    let hTextArr=[];
    hTextArr=hText2.split("/");
    for(let i=0;i<hTextArr.length;i++){
            hTexti="<a href='#' onclick='origLang.getGrammar(\"" + lang + "\",\"" + hTextArr[i] + "\")'>" + hTextArr[i] + "</a>";
        
        if (hTextStr=="")
            hTextStr=lang + ":" + hTexti;
        else
            hTextStr+="/" + hTexti;
    }	
    return hTextStr;	
	} 
}  //end origLang



function getOneVerseBefore(ref){ //format BBCCCVVV
	let bk=Number(ref.substr(0,2));
	let ch=Number(ref.substr(2,3));
	let vrs=Number(ref.substr(5));
	let i=0;

	if (vrs>1) //simply just subtract one from vrs number
		return util.padNum(bk,2) + util.padNum(ch,3) + util.padNum(--vrs,3);
	else if (ch>1) {//get last verse of previous chapter
		ch--;
		vrs=Number(getTopVerse(bk,ch));
		return util.padNum(bk,2) + util.padNum(ch,3) + util.padNum(vrs,3);
	}
	else if (bk>1){//get last chapter and verse of previous book 
		bk--;
		ch=bibleBookData[bk][2];
		vrs=Number(getTopVerse(bk,ch));
		return util.padNum(bk,2) + util.padNum(ch,3) + util.padNum(vrs,3);
	}
	else //Gen 1:1 so just return it.
		return ref;

}

function getTopVerse(bk,chp){
	let j=0;
	if (isNaN(bk)|| isNaN(chp))
		return -1;
	bk=Number(bk);
	chp=Number(chp);
  
	for(j=0;j<bibleTopVerse.length;j++)
		if (bibleTopVerse[j][0]==bk && bibleTopVerse[j][1]==chp)
			break;
	if (j + 1 < bibleTopVerse.length)
		return bibleTopVerse[j][2];
	else
		return -1;
}

//******************  Set Local Storage when closing the window  *********************************************
window.onbeforeunload = function () {
	br=window["BibleRef" + siteControl.activeWindow];
	br.ScrollToId = get1stVerseInViewport(br.windowID, br.version);
	RH.updateRHRow(siteControl.activeWindow,RH.CurNum);
	setLocalStorage();
}

function setLocalStorage() {
	if (siteControl.doSave === true) {
		localStorage.setItem("RHCurNum", RH.CurNum);
		localStorage.setItem("RHLastNum", RH.LastNum);	
		localStorage.setItem("RHFirstNum", RH.FirstNum);	
		localStorage.setItem("speechVoice",document.getElementById("voiceSelect1").value);
		localStorage.setItem("speechPitch",document.getElementById("audioPitch1").value);
		localStorage.setItem("speechRate",document.getElementById("audioRate1").value);
		localStorage.setItem("siteControlthemeName", siteControl.themeName);
		localStorage.setItem("siteControlthemeDarkColor", siteControl.themeDarkColor);
		localStorage.setItem("siteControlthemeSWColor", siteControl.themeSWColor);
		localStorage.setItem("siteControlshowTitleBar", siteControl.showTitleBar);
		localStorage.setItem("siteControlshowFooter", siteControl.showFooter);
		localStorage.setItem("siteControlFontSize", siteControl.fontSize);
		localStorage.setItem("siteControlFontFamily", siteControl.fontFamily);
		localStorage.setItem("siteControlgreekDisplay", siteControl.greekDisplay);
		localStorage.setItem("siteControlwordDataOptions", siteControl.wordDataOptions);
		localStorage.setItem("siteControlaudioTypeAllowed", siteControl.audioTypeAllowed);
		localStorage.setItem("siteControlReadingDefault", siteControl.ReadingDefault);
		localStorage.setItem("siteControlStudyDefault", siteControl.StudyDefault);
		localStorage.setItem("siteControlsyncSettings",siteControl.syncSettings);
		localStorage.setItem("siteControlsyncHistory",siteControl.syncHistory);
	}	
}

//********************* Start Up Loading 
$(document).ready(function () {
	////console.log("In document ready");
	var email = "";
	var hash = "";
	let k = 0;
	let refList="";
	let version="";

	const params = new URLSearchParams(location.search);
	//let params=param.toUpperCase;

	////console.log("params:" + params);
	accountControl.checkLogin();

	if (!("siteControlReadingDefault" in localStorage))
		localStorage.setItem("siteControlReadingDefault", "A1100000000");
	if (!("siteControlStudyDefault" in localStorage))
		localStorage.setItem("siteControlStudyDefault", "A1010000000");
	if(!("RHFirstNum" in localStorage))
		localStorage.setItem("RHFirstNum", "000");	
	if(!("RHLastNum" in localStorage))
		localStorage.setItem("RHLastNum", "000");
	if(!("RHCurNum" in localStorage))
		localStorage.setItem("RHCurNum", "000");	
	if ("speechVoice" in localStorage)
		document.getElementById("voiceSelect1").value=localStorage.getItem("speechVoice");
	
		
	RH.FirstNum = localStorage.getItem("RHFirstNum").replace("RH","");
	RH.LastNum = localStorage.getItem("RHLastNum").replace("RH","");
	RH.setCurNum(localStorage.getItem("RHCurNum").replace("RH",""));

	//Check for Ref/Version
		//verify email from link in email 	
		if (params.has('REF') == true || params.has('ref') == true || params.has('Ref') == true ||params.has('REFERENCE') == true || params.has('reference') == true ||params.has('Reference') == true) {
			if (params.has('REF') == true)
				refList= params.get('REF'); 
			else if (params.has('ref') == true)
				refList=params.get('ref');
			else if (params.has('Ref') == true)
				refList=params.get('Ref');
			else if (params.has('REFERENCE') == true)
				refList=params.get('REFERENCE');
			else if (params.has('reference') == true)
				refList=params.get('reference');
			else if (params.has('Reference') == true)
				refList=params.get('Reference');	
			// if (params.has('version')==true || params.has('Version')==true)
			// 	if (params.has('version')==true)
			// 		version=params.get('version');
			// 	else
			// 		version=params.get('Version');
		}
	
	//Prime for first load
	if (RH.LastNum=="000") { 
		window.localStorage.setItem("RH000", "AAAAAAAAAAAAAAA~RH000~R0~A1100000000~~1 Peter All~60000000~1588336664999~1588336664999~1588336664999~BSB~60010101~0~~General");
	}

	RH.load2Arr(); //adds all  localStorage Reference History to RHArr
	RH.loadSideBar(); //creates HTML buttons in History 

	//set site control settings
	siteControl.StudyDefault = localStorage.getItem("siteControlStudyDefault");
	siteControl.ReadingDefault = localStorage.getItem("siteControlReadingDefault");

	if ("siteControlFontSize" in localStorage) {
		if (localStorage.getItem("siteControlshowTitleBar") === "false") {
			siteControl.showTitleBar = true;  //set to true so that the toggle will set it to false
			siteControl.toggleTitleBar();
		}
		if (localStorage.getItem("siteControlshowFooter") === "false") {
			siteControl.showFooter = true; //set to true so that the toggle will set it to false
			siteControl.toggleFooter();
		}
		else
			document.body.style.overflowY = "scroll";

		siteControl.fontSize = localStorage.getItem("siteControlFontSize");
		siteControl.fontFamily = localStorage.getItem("siteControlFontFamily");
		siteControl.greekDisplay = localStorage.getItem("siteControlgreekDisplay");
		siteControl.wordDataOptions = localStorage.getItem("siteControlwordDataOptions");
		siteControl.audioTypeAllowed = localStorage.getItem("siteControlaudioTypeAllowed");
		siteControl.ReadingDefault = localStorage.getItem("siteControlReadingDefault");
		siteControl.StudyDefault = localStorage.getItem("siteControlStudyDefault");
	}


	siteControl.setFontSize(siteControl.fontSize);
	siteControl.setFontFamily(siteControl.fontFamily);
	siteControl.setGreekDisplay(siteControl.greekDisplay);
	for (k = 0; k < 6; k++)
		siteControl.toggleGreekLexicon(k, false);
	if (document.getElementById("DarkThemeColor").value=="#abcdef")
		document.getElementById("DarkThemeColor").value=siteControl.themeDarkColor;

	//get and set sync checkboxes	
	if(!("siteControlsyncHistory" in localStorage)){
		localStorage.setItem("siteControlsyncHistory","true");
		localStorage.setItem("siteControlsyncSettings","true");
	}
	if(localStorage.getItem("siteControlsyncHistory")=="true")
		siteControl.syncHistory=true;
	else
		siteControl.syncHistory=false;

	if(localStorage.getItem("siteControlsyncSettings")=="true")
		siteControl.syncSettings=true;
	else
		siteControl.syncSettings=false;
		
    // if (siteControl.syncHistory==true)
	// 	document.getElementById("syncHistory").checked=true;
    // if (siteControl.syncSettings==true)
	// 	document.getElementById("syncSettings").checked=true;

	if (siteControl.audioTypeAllowed==null || siteControl.audioTypeAllowed==1)
		siteControl.audioTypeAllowed="SynthOnly";

	document.getElementById("voice" + siteControl.audioTypeAllowed).checked = true;
	document.getElementById("fontnone").checked=true;

	//set RH 
	RH.ToDBDate=window.localStorage.getItem("RHToDBDate");


	//runcode for objects		
	util.setGreekLetter();
	window["BibleRef" + siteControl.activeWindow] = new BibleRef(siteControl.activeWindow);
	window["VoiceControl" + siteControl.activeWindow] = new VoiceControl(siteControl.activeWindow);
	window["ScriptureWindow" + siteControl.activeWindow] = new ScriptureWindow(siteControl.activeWindow, true);
	window["VoiceControl" + siteControl.activeWindow].voices=window.speechSynthesis.getVoices();


	// window["BibleRef" + siteControl.activeWindow2] = new BibleRef(siteControl.activeWindow2);
	// window["ScriptureWindow" + siteControl.activeWindow2] = new ScriptureWindow(siteControl.activeWindow2, true);

	// window["BibleRef2"] = new BibleRef(2);
	// window["ScriptureWindow2"] = new ScriptureWindow(2);


	window["BibleRef0"] = new BibleRef(0);
	window["ScriptureWindow0"] = new ScriptureWindow(0);
	window["VoiceControl0"]= new VoiceControl(0);

	VoiceControl0.voices=window.speechSynthesis.getVoices();

	//and load
	if (refList=="")
		RH.load2SW(siteControl.activeWindow,RH.CurNum);
	else { //has ref in params - open that
		document.getElementById("enterVerse1").value=refList;
		
		//version
		if (params.has("VERSION")==false && params.has("VER")==false && params.has("version")==false && params.has("ver")==false && params.has("Version")==false && params.has("Ver")==false)
			window["BibleRef1"].version="WEB";
		else {
			if (params.has("VERSION")==true)
				version=params.get("VERSION");
			else if (params.has("VER")==true)
				version=params.get("VER");
			else if (params.has("version")==true)
				version=params.get("version");
			else if (params.has("ver")==true)
				version=params.get("ver");
			else if (params.has("Version")==true)
				version=params.get("Version");
			else if (params.has("Ver")==true)
				version=params.get("Ver");
			////console.log(version);

			i=util.getVersionrow(version);
			////console.log(i);
			if (i>-1)
				window["BibleRef1"].version=version;			
			else
				window["BibleRef1"].version="WEB";
		}
		if (params.has("topic")==true || params.has("Topic")==true || params.has("TOPIC")==true || params.has("top")==true || params.has("Top")==true || params.has("TOP")==true){
			if (params.has("topic")==true) {		    
				document.getElementById("enterTopic1").innerHTML=params.get("topic");
				window["BibleRef1"].topic=params.get("topic");
			}
			if (params.has("top")==true) {		    
				document.getElementById("enterTopic1").innerHTML=params.get("top");
				window["BibleRef1"].topic=params.get("top");
			}
			else if (params.has("Topic")==true) {		    
				document.getElementById("enterTopic1").innerHTML=params.get("Topic");
				window["BibleRef1"].topic=params.get("Topic");
			}
			else if (params.has("Top")==true) {		    
				document.getElementById("enterTopic1").innerHTML=params.get("Top");
				window["BibleRef1"].topic=params.get("Top");
			}
			else if (params.has("TOPIC")==true) {		    
				document.getElementById("enterTopic1").innerHTML=params.get("TOPIC");
				window["BibleRef1"].topic=params.get("TOPIC");
			}
			else if (params.has("TOP")==true) {		    
				document.getElementById("enterTopic1").innerHTML=params.get("TOP");
				window["BibleRef1"].topic=params.get("TOP");
			}

		}	
		window["BibleRef1"].parseRefEntered();
		////console.log(window.location.href);
		siteControl.paramsURL=window.location.search
	window.history.pushState({}, "", window.location.pathname);
	}	

	//verify email from link in email 	
	if (params.has('email') == true) {
		email = params.get('email');
		////console.log("local email:" + email);
		hash = params.get('hash');
			$.post("verify.php", {
				email: email,
				hash: hash
			},
				function (result) {
					params.delete('email');
					params.delete('hash');
					if (result == "Your account has been activated.") {
						document.getElementById("loginEmail").value = email;
						accountControl.email = email;
					}

					util.openModalBox(result, "Results of Verify");
					//	window.location.href = "https://www.whatsgodsay.org";
				}
			);
	}

	//get tts voice list and other speech/audio settings
	// populateVoiceList();
	// if (
	//   typeof speechSynthesis !== "undefined" &&
	//   speechSynthesis.onvoiceschanged !== undefined
	// ) {
	//   speechSynthesis.onvoiceschanged = populateVoiceList;
	// }
	window["VoiceControl" + siteControl.activeWindow].populateVoiceList()   //setTimeout( '',3000);
	document.getElementById("voiceSelect" + siteControl.activeWindow).value=localStorage.getItem("speechVoice");
	document.getElementById("audioPitch" + siteControl.activeWindow).value=localStorage.getItem("speechPitch");
	document.getElementById("audioRate" + siteControl.activeWindow).value=localStorage.getItem("speechRate");

	//set devVer
	document.getElementById("devVersion").innerHTML=devVer;

 	// let junction_font = new FontFace('Junction Regular', 'url(fonts/junction-regular.woff)');
	// var junction_font = new FontFace('Junction Regular', 'url(junction-regular.woff)', { style: 'normal', weight: 700 });

	// junction_font.load().then(function(loaded_face) {
	// 	// loaded_face holds the loaded FontFace
	// }).catch(function(error) {
	// 	// error occurred
	// });

});

window.speechSynthesis.onvoiceschanged = function() {

	if (typeof(window["VoiceControl1"]=="undefined"))
		console.info("VoiceControl1 type :" + typeof(window["VoiceControl1"]));
	else
		VoiceControl1.voices=window.speechSynthesis.getVoices();
}

//************************  utility functions
const util ={
	findRowIn2DArr: function(arrStr, ColID, matchValue, startIncr=0) {
		// the parameter ColID is the column number itself or characters of the column name on row[0] of the arr
		//change the array String (arrStr) into an actual array
		let arr2=window[arrStr];
		if (!Array.isArray(arr2)) {
			throw new Error('Invalid array name: ' + arrStr); // Throw an error if the provided array name is not valid
		  }
		//get ColID as j
		// if (isNaN(ColID))
		j=util.getColNum(arrStr,ColID)
		// else
		// 	j=ColID;
		for (let i = startIncr; i < arr2.length; i++) {
			if (arr2[i][j] == matchValue)
				return i;
		}
		return -1;
	},
	getColNum: function(arrStr, val) {
	if (isNaN(val)==false)
		return val;
	//not a number but Column name so read row 0 of the 2D array to find matching name and return the Column Number it is in
	let arr1=window[arrStr[0]];
		if (!Array.isArray(arr1)) {
			throw new Error('Invalid array name: ' + arrStr); // Throw an error if the provided array name is not valid
		  }	

	for (let i = 0; i < arr1.length; i++) {
		if (arr1[i] == val)
			return i;
	}
	return -1;
	},

	recursiveSearch: function (obj, searchKey, results = []){
		const r = results;
		Object.keys(obj).forEach(key => {
		   const value = obj[key];
		   if(key === searchKey && typeof value !== 'object'){
			  r.push(value);
		   }else if(typeof value === 'object'){
			  this.recursiveSearch(value, searchKey, r);
		   }
		});
		return r;
	 },
	refPadCount(bk,version="WEB"){
		if (bk==19 || bk==69) //||  (version=="ERV" && (bk==4 || bk==6 || bk==7 || bk==11 || bk==12 || bk==14 || bk==16 || bk==24 || bk==26)))
			return 3;
		return 2;	
	},
	padNum:function (number, length) {

		var str = '' + number;
		while (str.length < length) {
			str = '0' + str;
		}
	
		return str;
	
	},
	errmsg: function(elemnt, msg) {
		document.getElementById(elemnt).innerHTML = msg;
	},	
	getVersionrow: function(ver) {
		var i = 0;
		for (i = 0; i<versionData.length; i++) {
			if (versionData[i][0] == ver)
				return Number(i);
		}
		return -1;
	},
	openModalBox: function(p1, header, typ="OK") {
		let BtnTitleTrue="";	
		if (typ.includes("/")==false) {
			document.getElementById("modalBoxFalseBtn").style.display = "none";
			BtnTitleTrue=typ;
		}	
		else {
			document.getElementById("modalBoxFalseBtn").style.display = "inline";
			BtnTitleTrue=typ.substr(0,typ.indexOf("/"));
			document.getElementById("modalBoxFalseBtn").innerHTML=typ.substr(typ.indexOf("/")+1);
		}
		document.getElementById("modalBoxTrueBtn").innerHTML=BtnTitleTrue;
		
		document.getElementById("modalBoxMainP").innerHTML = p1;
		document.getElementById("modalBoxHeader").innerHTML = header;
		document.getElementById("modalbackground").style.display = "block";
		document.getElementById("modalBox").style.display = "block";
	},
	English2Greek: function (grk) {
		for (i = 0; i <= 23; i++) {
			while (grk.indexOf(grkengarray[i]) > -1) {
				grk = grk.replace(grkengarray[i], grkltrarray[i]);
			}
	
			while (grk.indexOf(grkEngarray[i]) > -1) {
				grk = grk.replace(grkEngarray[i], grkltrarray[i]);
			}
		}
	
		while (grk.indexOf('ς') > -1) {
			grk = grk.replace('ς', 'σ');
		}
		if (grk.substr(grk.length - 1, 1) == 'σ') {
			grk = grk.substr(0, grk.length - 1) + 'ς';
		}
	
		return grk;
	},
	setGreekLetter: function() {
		grkEngarray = new Array(24);
		grkEngarray[0] = 'A';
		grkEngarray[1] = 'B';
		grkEngarray[2] = 'G';
		grkEngarray[3] = 'D';
		grkEngarray[4] = 'E';
		grkEngarray[5] = 'Z';
		grkEngarray[6] = 'H';
		grkEngarray[7] = 'Q';
		grkEngarray[8] = 'I';
		grkEngarray[9] = 'K';
		grkEngarray[10] = 'L';
		grkEngarray[11] = 'M';
		grkEngarray[12] = 'N';
		grkEngarray[13] = 'C';
		grkEngarray[14] = 'O';
		grkEngarray[15] = 'P';
		grkEngarray[16] = 'R';
		grkEngarray[17] = 'S';
		grkEngarray[18] = 'T';
		grkEngarray[19] = 'U';
		grkEngarray[20] = 'F';
		grkEngarray[21] = 'X';
		grkEngarray[22] = 'Y';
		grkEngarray[23] = 'W';
		grkengarray = new Array(24);
		grkengarray[0] = 'a';
		grkengarray[1] = 'b';
		grkengarray[2] = 'g';
		grkengarray[3] = 'd';
		grkengarray[4] = 'e';
		grkengarray[5] = 'z';
		grkengarray[6] = 'h';
		grkengarray[7] = 'q';
		grkengarray[8] = 'i';
		grkengarray[9] = 'k';
		grkengarray[10] = 'l';
		grkengarray[11] = 'm';
		grkengarray[12] = 'n';
		grkengarray[13] = 'c';
		grkengarray[14] = 'o';
		grkengarray[15] = 'p';
		grkengarray[16] = 'r';
		grkengarray[17] = 's';
		grkengarray[18] = 't';
		grkengarray[19] = 'u';
		grkengarray[20] = 'f';
		grkengarray[21] = 'x';
		grkengarray[22] = 'y';
		grkengarray[23] = 'w';
		grkltrarray = new Array(24);
		grkltrarray[0] = 'α';
		grkltrarray[1] = 'β';
		grkltrarray[2] = 'γ';
		grkltrarray[3] = 'δ';
		grkltrarray[4] = 'ε';
		grkltrarray[5] = 'ζ';
		grkltrarray[6] = 'η';
		grkltrarray[7] = 'θ';
		grkltrarray[8] = 'ι';
		grkltrarray[9] = 'κ';
		grkltrarray[10] = 'λ';
		grkltrarray[11] = 'µ';
		grkltrarray[12] = 'ν';
		grkltrarray[13] = 'ξ';
		grkltrarray[14] = 'ο';
		grkltrarray[15] = 'π';
		grkltrarray[16] = 'ρ';
		grkltrarray[17] = 'σ';
		grkltrarray[18] = 'τ';
		grkltrarray[19] = 'υ';
		grkltrarray[20] = 'φ';
		grkltrarray[21] = 'χ';
		grkltrarray[22] = 'ψ';
		grkltrarray[23] = 'ω';
	}, 
	removeGreekAccents: function(grk, removeText) {
	var i = 0;
	var j = 0;

	for (i = 0; i < greekAccents.length; i++) {
		j = 0;
		while (grk.indexOf(greekAccents[i][0]) > -1) {
			grk = grk.replace(greekAccents[i][0], greekAccents[i][1]);
			j++;
			if (j > 20) {
				if (j == 20)
					////console.log("this:" + greekAccents[i][0])
				j = 0;
				break;
			}
		}
	}

	if (removeText != '')
		while (grk.indexOf(removeText) > -1) {
			grk = grk.replace(removeText, '');
		}

	return grk;
	},
	Greek2English: function(grk) {
	var i = 0;
	var j = 0;
	//	replace accented letters for Greek without accents
	grk = util.removeGreekAccents(grk, "");
	for (i = 0; i <= 23; i++) {
		j = 0;
		while (grk.indexOf(greekLetters[i][0]) > -1) {
			grk = grk.replace(greekLetters[i][0], greekLetters[i][3]);
			j++;
			if (j > 20) {
				if (j == 20)
					////console.log("this:" + greekAccents[i][0])
				j = 0;
				break;
			}
		}
	}

	while (grk.indexOf('ς') > -1) {
		grk = grk.replace('ς', 's');
	}
	while (grk.indexOf('gg') > -1) {
		grk = grk.replace('gg', 'ng');
	}


	return grk;
	},
	getGreekText: function(gTxt) {
		var lemmaTxt = "";
	
		switch (siteControl.greekDisplay) {
			case 1:
				lemmaTxt = util.Greek2English(gTxt);
				break;
			case 2:
				lemmaTxt = util.removeGreekAccents(gTxt, "h");
				break;
			case 3:
				lemmaTxt = gTxt;
				break;
			case 4:
				lemmaTxt = gTxt + "(" + util.Greek2English(gTxt) + ") ";
				break;
			//   case 5:
			//   lemmaTxt="<span style='font-family:Alegreya Sans SC;'>" + gTxt + "</span>(" + gTxt + ")";
			//   break;
			default:
				lemmaTxt = gTxt;
		}
		return lemmaTxt;
	
	},
	getBookSection: function(book){   
	  if (book<40)
		 return "OT";
	  if (book<67)
		return "NT";
	  return "AP";	
	}
	//,
	//processScriptureIdFormat: function(){
	//************* Need to change all object References to start with an identifying digit - so word to start with "W" **********************/
	//************* Need to change all object References to 2-3-3(-3) BBCCCVVV(WWW)   **********************/

	//pull out format based on length
	//otype of word: 11 - VVVBBCCVVWW    //14 - VVVBBCCCVVVWWW (Psalms)
	//all other otypes: 12 - ?VVVBBCCVVWW   //15 - ?VVVBBCCCVVVWWW (Psalms)     
    
	// Object ID format in Scripture window
	//Version,Book, Chapter, Verse, Word(order)- Increment of ScriptureDiv
	//most books of bible
	// *VERBBCCVVWW-I
	// 01234567890123
	// rLEB60011512-1
	//  0123456789012	
	//  LEB60011510-1
	// a few Books of the Bible ie Psalms
	// *VERBBCCCVVVWWW-1
	// 01234567890123456
	// rLEB19001002001-1
	//  0123456789012345
	//  LEB19001002003-1	
	//}
}

//BibleRef?  But would need a BibleRef0 not tied to any SW
function buildRefText(refList,bookNameRowIncre){
	let refListArr=refList.split(";");
	let i=0;
	//prime with first (maybe only) reference
	let refTextStr=buildSingleRefText(refListArr[0],bookNameRowIncre);
	//get all subsequent references
	for (i=1;i<refListArr.length;i++)
			refTextStr=refTextStr + ";" + buildSingleRefText(refListArr[i],bookNameRowIncre);

	return refTextStr;	
}

//BibleRef?  But would need a BibleRef0 not tied to any SW
function buildSingleRefText(refLst,bookNameRowIncre) {
	let i=0;
	var brt = "";
	var BookNum = Number(refLst.substr(0, 2));
	var BookNam = bibleBookData[BookNum][bookNameRowIncre];
	var chap = 0;
	var vrs = 0;
	var chap2 = 0;
	var vrs2 = 0;
	var srt = "06001000";
	
	// var bookHasOneChap = false;

	// if (Number(bibleBookData[BookNum][2]) === 1) {
	// 	bookHasOneChap = true;
	// }
	//	refTxt = refTxt.replace(";", "");
	//	alert (refTxt);


	brt = BookNam;
	//will need to code for an array for multiples	
	//need to code for removing version	

	srt = refLst.substr(0, 8);
	chap = Number(srt.substr(2, 3));
	vrs = Number(srt.substr(5, 3));
	if (chap + vrs === 0)
		return BookNam + " All"

	//	alert (BookNam + " " + chap + ":" + vrs);
	// if (bookHasOneChap === true) {
	// 	if (vrs === 0)
	// 		brt = brt;
	// 	else
	// 		brt = brt + " " + vrs;
	// }
	// else {
	if (vrs === 0)
		brt = brt + " " + chap;
	else
		brt = brt + " " + chap + ":" + vrs;
	// }

	if (refLst.length > 8)
		refLst = refLst.substr(8);
	else
		return brt;

	brt = brt + refLst.charAt(0);
	srt = refLst.substr(1);

	chap2 = Number(srt.substr(2, 3));
	vrs2 = Number(srt.substr(5, 3));
	if (vrs2 === 0)
		brt = brt + chap2;
	else {
		//get top verse to replace entered verse if greater than actual last verse
		i=getTopVerse(BookNum,chap2);
		if (i==-1)
			console.error("Book:" + BookNum + " and Chapter:" + chap2 +" didn't match to bibleTopVerse table.");
		else if (vrs2>Number(i))
			vrs2=Number(i);
		if (chap === chap2)
			brt = brt + vrs2;
		else
			brt = brt + chap2 + ":" + vrs2;
	}	
	return brt;
}

// function buildRefFromTo(refList){
// 	let refListArr=refList.split(";");
// 	let i=0;
// 	//prime with first (maybe only) reference
// 	let refFromToStr=buildSingleRefText(refListArr[0],bookNameRowIncre);
// 	//get all subsequent references
// 	for (i=1;i<refListArr.length;i++)
// 			refFromToStr=refFromToStr + ";" + buildSingleRefFromTo(refListArr[i]);

// 	return refFromToStr;	
// }

// function buildSingleRefFromTo(refItem) {
// 	let bk=refItem.substring(0,2);
// 	let pnum=2;
// 	let i=-1;
// 	if (bk=="19"){
// 		pnum=3;
// 	}
// 	//if (window["B" + ])

// 		//e.g. find in B1PEWEB  ref 4:5 as "040501"
// 		i=util.findRowIn2DArr("B" + this.bookNam + this.version,0,util.padNum(ch,pnum) + util.padNum(vrs,pnum) + util.padNum(1,pnum));


// }
//SW
function get1stVerseInViewport(incre,version) {
	if (incre==0)
		return;
	 ////console.log("In get1stVerseInViewport for " + version);
	let wordList = $('[id^="v' + version + '"]'); //an array of all verse id's in this book/version.

	if (wordList.length==0) {//the Scripture div has no elements
		console.info("Could NOT get ScrollToId");
		return "";
	}

	let vpTop = document.getElementById("Scripture" + incre).scrollTop;
	let vpBottom = vpTop + document.getElementById("Scripture" + incre).clientHeight;
	let vpHeight = vpBottom - vpTop;
	let scrollHt = document.getElementById("Scripture" + incre).scrollHeight;
	let i = Math.floor((vpTop / scrollHt) * wordList.length)
	let Obj = document.getElementById(wordList[i].id.substr(1)); //object is word
	let j = vpHeight / scrollHt;
	j = Math.floor(j * wordList.length);
	vpTop = Math.floor(vpTop);

	//get a verse element anywhere in viewport
	for (k = 0; k < 20; k++) {
		////console.log("get any verse in viewport step " +  (k + 1) + " at:" + wordList[i].id );
		if (Obj.offsetTop >= vpTop && Obj.offsetTop <= vpBottom) {
			break;
		}
		else if (Obj.offsetTop < vpTop) { //The guess is before the viewport.
			i = i + j
			if (i < 0)
				i = 0;
			if (i > wordList.length)
				i = wordList.length;			
			Obj = document.getElementById(wordList[i].id.substr(1));
		}
		else { //The guess is after the viewport.
		i = i - (j + 1)
			if (i > wordList.length)
				i = wordList.length;
			if (i<0)
				return;	
			Obj = document.getElementById(wordList[i].id.substr(1));
		}
	}
	//back verse up to while in viewport
	if (i == 0){ //if 0 then at first verse in wordList - FINAL Answer 
		Obj = document.getElementById(wordList[0].id.substr(1)); //now getting Word
	}
	else {  	
		for (k = 0; k < 20; k++) {//back verse up one
			if (i<=0){ //if i is 0 or less then break out with i=0
				i = 0;
				break;
			}
			//backup to verse before last one
			i--;
			Obj = document.getElementById(wordList[i].id.substr(1)); //now getting Word**

			if (Obj.offsetTop < vpTop)  //not in viewport.  exit loop
				break;
		}
		if( i > 0) { //if not 0 then adjust one verses 
	 		i = i+1;
	 		Obj = document.getElementById(wordList[i].id.substr(1)); //now getting Word**
	 		}	
	}	
	return Obj.id.substr(3);
}

//ONLY used in BibleRef
function MakeSpaceBeforeNumber(refstr) {

	var arri = 1;
	while (arri < refstr.length) {
		if (isNaN(refstr.charAt(arri)))
			arri += 1;
		else { //is a number check before
			if (refstr.substr(arri, 1) != " ")
				return refstr.substr(0, arri) + " " + refstr.substr(arri);
			else
				return refstr;
		}
	}
	return refstr;
}


//SW or br
function openTRBox(incre){
	////console.log("openTRBox with incre of " + incre);
	let tp=document.getElementById("enterTopic"+ incre).innerHTML;
	let vr=document.getElementById("enterVerse"+ incre).value;
	// let RHNum=window["BibleRef" + incre].RHNum;
	////console.log("tp is " + tp); 

	//show html msgbox
	document.getElementById("TRBox").style.display = "block";

	//get current values so -can check if changed- or -use-, when in close TRBox
	document.getElementById("TRInitialTopic").innerHTML = tp;
	document.getElementById("TRInitialVerse").innerHTML = vr;
	document.getElementById("TRBoxHiddenIncre").innerHTML=incre;
	// if (RHNum.length==3)
	// 	document.getElementById("TRBoxRHId").innerHTML="RH" + RHNum;

	//show blocking background
	document.getElementById("modalbackground").style.display = "block";	
	//get SW enterVerse(s)
	document.getElementById("TRenterVerse").value= vr;

	if (tp==0){ //no topic (means a new reference) - so hide TR enterVerse, show Explain, change Title.
		document.getElementById("TRref").style.display="none";
		document.getElementById("TRexplain").style.display="block";
		document.getElementById("TRBoxHeader").innerHTML = "Add Topic? (For multiple Ref entries)"
	}	
	else { //has a topic - so open for editing Topic/Verse list 
		document.getElementById("TRref").style.display="block";
		document.getElementById("TRenterTopic").value = tp;
		document.getElementById("TRexplain").style.display="none";
		document.getElementById("TRBoxHeader").innerHTML = "Edit Topic/Reference";
	}	
	//stop infinte loop - take focus off the enterTopic which calls this on getting focus and would get it back upon closing.	
	document.getElementById("TRenterTopic").focus();
}
//SW or br
function closeTRBox(){
	let i=0;
	//get values for Increment, Topic and Verse
	let incre=document.getElementById("TRBoxHiddenIncre").innerHTML;
	incre=Number(incre);
	let tp=document.getElementById("TRenterTopic").value;
	let tpWas=document.getElementById("TRInitialTopic").innerHTML;
	let vr=document.getElementById("TRenterVerse").value;
	let vrWas=document.getElementById("TRInitialVerse").innerHTML;
	let br=window["BibleRef" + incre];

	//update changes to topic and verse
	//topic
	if (tpWas!=tp){ //topic was changed so...
		//change br.topic
		if (tp.length>1) {
			//ensure topic name NOT already used:
			i=RH.findRow(RH.iTopic,tp)
			if (i==-1) {//row not found- is new topic name	
				br.topic=tp;
				if (tpWas!="0") //not new so update History Button also
					 if(document.getElementById("RH" + br.RHNum)!=null) //ensure History button exists
					 	{
							document.getElementById("RH" + br.RHNum).innerHTML=tp; 
						 }
			
			}	
			else{
				util.openModalBox ("This topic name is already used. Either a new topic name or a deletion of the current topic in history is needed.","Topic Name Already Exists");
				return;
			}	
		}	
		else  //topic was removed or not intially added
			window["BibleRef" + incre].topic="";
		
		//change HTML
		document.getElementById("enterTopic"+ incre).innerHTML = document.getElementById("TRenterTopic").value;
	}

	//hide box and blocking background (before the verse may run through again)
	document.getElementById('modalbackground').style.display='none';
	document.getElementById('TRBox').style.display='none';

	//verse
	if (vr!=vrWas){//need to parse new verses through the br.parseRefEntered
		document.getElementById("enterVerse" + incre).value=vr;
		window["BibleRef" + incre].parseRefEntered();
	}
	else if (tpWas=="0") { //new topic on new reference so continue loading...
		RH.addToRH(incre); 
		uncoverGodsWord.processScriptureData(incre,false);
	}

	//clear TRBox Variables before next use
	document.getElementById("TRBoxHiddenIncre").innerHTML="";
	document.getElementById("TRenterTopic").value="";
	document.getElementById("TRInitialTopic").innerHTML="";
	document.getElementById("TRenterVerse").value="";
	document.getElementById("TRInitialVerse").innerHTML="";	
//	document.getElementById("TRBoxRHId").innerHTML="";
}
//SW or br
function closeTopic(incre){
	//load last non-topic reference
	let i=RH.findRow(RH.iTopic,"");
	if (i>-1) 
		RH.load2SW(incre,RH.Arr[i][RH.iRHId]);	
	else
		window["ScriptureWindow" + incre].showSWReference();
}

//uncoverGodsWord
function displayVerses(version, reftype, ref, title, ){
	
	//set BibleRef0 values
	BibleRef0.version=version;
	if(reftype=="plaintext"){
		document.getElementById("enterVerse0").value=ref;
		BibleRef0.parseRefEntered();	
	}
	else {	
		BibleRef0.bookNum=ref.substr(0,2);
		BibleRef0.bookNam = bibleBookData[Number(BibleRef0.bookNum)][8];
		BibleRef0.refList=ref;
		BibleRef0.refText=buildSingleRefText(ref,1);
	}
	////console.log(BibleRef0.refText);
	
	//set uncoverGodsWord values
	uncoverGodsWord.resetEnterVerse=false;
	uncoverGodsWord.incre=0;
	uncoverGodsWord.br=BibleRef0;
	uncoverGodsWord.refCount=1;
	uncoverGodsWord.refIncre=0;
//	hasTopic:false,
	uncoverGodsWord.refListArr=uncoverGodsWord.removeVersionFromRefList(uncoverGodsWord.br.refList.split(";"));
//	uncoverGodsWord.refVersionArr=uncoverGodsWord.getVersionFromRefList(uncoverGodsWord.br.refList.split(";"),uncoverGodsWord.br.version);
	uncoverGodsWord.refVersionArr=uncoverGodsWord.br.versionArray;
	uncoverGodsWord.refTextArr=BibleRef0.refText.split(";");
	uncoverGodsWord.version=version;
	uncoverGodsWord.versionCount=1;
 
	//call displayScriptures 
	console.log ("In displayVerses for ref of " + BibleRef0.refEntered);
	showScripture0(title);
}
function showScripture0(title){
	// document.getElementById("Scripture0").innerHTML="";
	// uncoverGodsWord.processScriptureData(0,false);
//	document.getElementById("ScriptureHeader0").innerHTML=title;
//TempZ	document.getElementById("ScriptureHeader0").innerHTML=title + "   <span class='title0'>" + BibleRef0.refText + "<span class='msgboxClose'><i onclick='document.getElementById(\"ScriptureDiv0\").style.display=\"none\";document.getElementById(\"msgboxbackground\").style.display=\"none\"' class='fa fa-close' title='Close'>&nbsp;</i></span></span>";
//	document.getElementById("ScriptureHeader0").innerHTML=title + "   <span class='title0'>" + BibleRef0.refText + "</span>";
	document.getElementById("ScriptureDiv0").style.display="block";
	document.getElementById("ScriptureDiv0").style.top="2rem";
	document.getElementById("ScriptureDiv0").style.left="2rem";
}

//uncoverGodsWord


//uncoverGodsWord
function SV(vrs) {
	//break verse into Book, Chapter Verse

	console.log("verse:" + vrs);
	
	let i = 0;
	var ref = [0, 0, 0];

	var version = "WEB";

	var refList = String(vrs);
	////console.log("SV refList:" + refList);
	while (refList.includes("(") ==true) {
		i = refList.indexOf("(");
		j = refList.indexOf(")");
		if (i != 0 && j != 0 && j > i)
			refList = refList.substr(0, i) + refList.substr(j + 1);
	} 

	if (refList == "undefined") {
		alert("Sorry, the verse was not found.");
		return;
	}

	if (vrs.slice(-3) == "ALL") {
		version = "ALL";
		vrs = vrs.replace("ALL", "");  //
	}

	if (vrs.includes('.') == true) {
		ref = vrs.split(".");

		if (ref[0].isNaN === false) {
			vrs = util.padNum(ref[0], 2) + util.padNum(ref[1], 3) + util.padNum(ref[2], 3);
		}
		else {//ref book is not a number so it should be usfm 3 char code
			for (i = 1; i < bibleBookData.length; i++) {
				if (ref[0] == bibleBookData[i][8]) {
					ref[0] = util.padNum(bibleBookData[i][0], 2);
					break;
				}
			}

		}
	}
	else {  //no periods in reference process as Book-3 chapter:verse - no  spaces
		version = "NET";
		ref[0] = refList.substr(0, 3).toUpperCase();
		ref[1] = refList.substr(3, refList.search(':') - 3);
		ref[2] = refList.substr(refList.search(':') + 1);
		for (i = 1; i < bibleBookData.length; i++) {
			if (ref[0] == bibleBookData[i][8]) {
				ref[0] = util.padNum(bibleBookData[i][0], 2);
				break;
			}
		}

	}

	vrs = util.padNum(ref[0], 2) + util.padNum(ref[1], 3) + util.padNum(ref[2], 3);

	$.post("loadScripture.php", {
		refList: vrs,
		Version: version
	},
		function (result) {
			document.getElementById('contextMenuTitle').innerHTML = bibleBookData[Number(ref[0])][1] + " " + ref[1] + ":" + ref[2];
			if (ref[0]>39 && ref[0]<67 && version=="ALL") //only add link with verse in NT for Compare Versions window (ALL).
				document.getElementById('contextMenuMain').innerHTML= 'External Link:<a href="https://greekcntr.org/collation/index.htm?v=' + util.padNum(ref[0], 2) + util.padNum(ref[1], 3) + util.padNum(ref[2], 3) + '" target="_blank">Ancient Greek Manuscript Collation</a> at the Center for New Testament Restoration.<br>';
			else 
				document.getElementById('contextMenuMain').innerHTML= "";

			document.getElementById('contextMenuMain').innerHTML += result;
			document.getElementById('contextMenuFooter').innerHTML = version;
			document.getElementById('contextMenu').style.zIndex = 26;
			document.getElementById('contextMenu').style.width = "90vw";
			document.getElementById('contextMenu').style.left = '2rem';
			document.getElementById('contextMenu').style.top = '1rem';
			document.getElementById('contextMenu').style.display = 'block';
		}
	);


}
//uncoverGodsWord
function SV2(vrsList) {
	
	var i = 0;
	var j = 0;
	////console.log("vrsList before:" + vrsList);
	while (vrsList.includes("(") == true) {
		i = vrsList.indexOf("(");
		j = vrsList.indexOf(")");
		if (i != 0 && j != 0 && j > i)
			vrsList = vrsList.substr(0, i) + vrsList.substr(j + 1);
	}
	////console.log("vrsList after:" + vrsList);

	document.getElementById('enterVerse1').value = vrsList;
	window['BibleRef' + siteControl.activeWindow].parseRefEntered();
}

//util but ONLY used in SW
function digitToBoolean(dgt) {
	if (dgt == 0)
		return false;
	else
		return true;
}
//util but ONLY used in SiteControl
function booleanToDigit(bln) {
	if (bln == false)
		return 0;
	else
		return 1;

}

// util
function gotoElement(element, stopIfMessageBackground, SWIncre=-1){

	if (SWIncre>-1)
		element=element + SWIncre;

	if (stopIfMessageBackground==true && window.getComputedStyle(document.getElementById("msgboxbackground")).display === 'block')
		return;
	else
		document.getElementById(element).focus();
}


//*******************************listeners events   ******************************************
//placed at the bottom of html file so that Firefox works.

// from html
$("#enterVerse1").keydown(function (event) {
	if (event.keyCode == 13)
		$("#enterVerse1").blur();
	else
		$("#enterVerse1").css("color", "gray");

});
//Topic Reference text box
$("#TRenterTopic").keydown(function (event) {
	if (event.keyCode == 13)
		closeTRBox();
});



$("#contextMenuMain").click(function (event) {
	gotoTitle(event, 1);
});

$('#writingEditorPopUpBtn').click(function(event){
	noteControl.openOptions(event);
});

$('#searchEntry').keyup(function(){
	if(siteControl.activeWindowLanguage=="Greek")
		document.getElementById('searchEntry').value=util.English2Greek(document.getElementById('searchEntry').value);
	if (event.keyCode == 13)
		$("#searchEntry").blur();
});

$('#audioEndAt1').keydown(function (event) {
	VoiceControl1.Pause('1');
});

$('#AudioDDBtn1').click(function(event){
	VoiceControl1.OpenDialog(event, '1');
});

function setAccordionClickListener(){
	 ////console.log("In setAccordionClickListener");
	var acc = document.getElementsByClassName("accordion");
	var accSub = document.getElementsByClassName("subaccordion");
	//!!!! need code to not do Forum accordion.
	//var ID="";
	var i;
	for (i = 0; i < acc.length; i++) {
		//ID=acc[i].getAttribute('id');
		////console.log ("AccordionID is " + ID);
		if (acc[i].hasAttribute('id')==false){
			acc[i].addEventListener("click", function() {
				this.classList.toggle("active");
				var panel = this.nextElementSibling;
				if (panel.style.maxHeight){
					panel.style.maxHeight = null;
				} else {
					panel.style.maxHeight = (panel.scrollHeight + 9900) + "px";
				} 
			});
		}				
	}
	
	for (i = 0; i < accSub.length; i++) {
			accSub[i].addEventListener("click", function() {
				this.classList.toggle("active");
				var panel = this.nextElementSibling;
				if (panel.style.maxHeight){
					panel.style.maxHeight = null;
				} else {
					panel.style.maxHeight = panel.scrollHeight + "px";
				} 
				var panel = this.parentElement;
				panel.style.maxHeight = (panel.scrollHeight + 9900) + "px"; 
					}    
			);
		}
}

//siteControl
function resizeWindows() {
	if (typeof (ScriptureWindow1) != 'undefined' && ScriptureWindow1 != null)
		ScriptureWindow1.setScriptureHeight();
	rootBody("auto");
}
//siteControl - event
$(window).resize(function () {
	resizeWindows();
});
//siteControl
function rootBody(behaveMode) {
	if (behaveMode == "smooth")
		document.getElementById('SiteHeading').scrollIntoView({ block: 'start',  behavior: 'smooth'});
	//setTimeout("document.getElementById('SiteHeading').scrollIntoView({ block: 'start',  behavior: '" + behaveMode + "' });", 200);
	else
		document.getElementById('SiteHeading').scrollIntoView({ block: 'start',  behavior: 'auto'});
}

//accountControl
function setGroupFMListeners(Min, Max) {
	var i = 0;
	if (accountControl.hasGroupFMListener == true) {
		////console.log("Skipping adding event listener");
		return;
	}
	for (i = Min; i < Max; i++)
		setGroupFMClickListener("groupFM" + i);

	accountControl.hasGroupFMListener = true;
}

//accountControl
function setGroupFMClickListener(eleNam) {
	 ////console.log("In setAccordion1ClickListener for " + eleNam);
	var acc = document.getElementById(eleNam);
	acc.addEventListener("click", function () {
		this.classList.toggle("active");
		var panel = this.nextElementSibling;

		if (panel.style.maxHeight) {
			panel.style.maxHeight = null;
			////console.log("set panel height to NULL in " + eleNam + " listener");
		} else {
			panel.style.maxHeight = (panel.scrollHeight + 1990) + "px";
			////console.log("set panel height to " + (panel.scrollHeight + 1990) + " in " + eleNam + " listener");
		}
	});
}

//************************  Context Menus ************************************** 
//SW
function showContextMenu(event, incre) {
	var v = $(event.target);  //Scripture window object that user clicked on
	var otype = $(v).data("otype");  //Identify type of object clicked

	if (otype === undefined || otype=="verse title") {
		return;
	}

	//declare variables
	let i = 0;
	let yoffset = 0;
	let xoffset = 0;
	let oId = "";
	let wrd = "";
	let rt = "";
	let lmma = "";
	let lmmaHTML = "";
	let prse = "";
	let strongs = "";
	let gloss = "";
	let vrs = "";
	let lang="";
	let contextTitlePlus = "";
    let rct="";
	let rctMidX=0;
	let rctMidY=0;
	let rctWidth=0;
	let rctHeight=0;
	let cmRct="";
	let cmRctWidth=0;	
	let cmRctHeight=0;
	let cmX=0; //X in viewport for Context Menu placement
	let cmY=0; //Y in viewport for Context Menu placement
	
	//Get context menu position
	let clickXvp = event.pageX - window.scrollX;
	let clickYvp = event.pageY - window.scrollY;
	console.info("click X:" + clickXvp + "click Y:" + clickYvp);

	oId = $(v).attr("id");
	if (typeof (oId) == "undefined" || oId == null)
		return;


	//Set variables based on the clicked object Id (oId)
	//get offset is id has a letter in front of the version
	let refStartInId=3  //id end of version and start of reference 
	if (otype!="word")
		refStartInId=4  //id end of version and start of reference

	let version = oId.substring(refStartInId - 3,refStartInId);
	let bookNum = Number(oId.substring(refStartInId, refStartInId + 2));
	let pNum=util.refPadCount(bookNum);
	chap = oId.substring(refStartInId + 2, refStartInId + 2 + pNum);  
	vrs = oId.substring(refStartInId +2 + pNum,refStartInId + 2 + (2 * pNum) );  
	wordOrder = oId.substring(refStartInId + 2 + (2 * pNum), refStartInId + 2 + (3 * pNum));

	contextTitlePlus = " (" + bibleBookData[bookNum][11] + " " + Number(chap) + ":" + Number(vrs) + ")";
	
	//	////console.log("contextmenu bookNum:" + bookNum);
	bookNam = bibleBookData[Number(bookNum)][8];



	if (otype === "word") {
		var wordArr = window["B" + bookNam + version];

		wrdRow = util.findRowIn2DArr("B" + bookNam + version, 0, chap + "" + vrs + wordOrder);
		if (wrdRow == -1)
			wrd = $(v).text();
		else
			wrd = wordArr[wrdRow][1];

		for (i = 0; i < versionData.length; i++)
			if (version === versionData[i][0])
				lang = versionData[i][2].replace("Old ", ""); //change Old English to just English

		for (i = 0; i < versionData.length; i++)
			if (version === versionData[i][0])
		if (lang == "Greek") {
			if (wrdRow != undefined) {
				gloss = wordArr[wrdRow][4];
				if (gloss != "")
					gloss = "(" + gloss + ")";
			}
		}
		else {
			rt = $(v).data("rt") + ""; //added the + "" to rt so that the word true will match
			if (rt == undefined || rt == wrd)
				rt = ""
			else {
				if (rt.substr(0, 1) == "=")
					if (rt.length == 1)
						rt = "";
					else
						rt = wrd.substring(0, wrd.length - wrd.substr(1));	//broken pls fix qqqqq
				if (rt != "")
					rt = " (" + rt + ") "
			}
		}
		lmma = $(v).data("lm");
		if (lmma === undefined)
			lmma = "";
		else
			lmma = util.getGreekText($(v).data("lm"));
		if (lmma != "")
			lmmaHTML = "<span style='float:right'>" + lmma + " " + "&nbsp; </span>"; 

		prse = $(v).data("parse");
		if (prse === undefined || lang == "English")
			prse = "";
		else
			prse = "<small>" + prse + "</small>";

		////console.log("reflist for otype of word is " + window["BibleRef" + incre].refList);
		document.getElementById('contextMenuTitle').innerHTML = "Context Menu" + contextTitlePlus;
		document.getElementById('contextMenuMain').innerHTML = "<div onclick='noteControl.openWritingEditor(" + incre + ",0,\"" + oId + "\",\"" + otype + "\")'>Add Note</div> <div onclick='SV(\"" + bookNum + "." + Number(chap) + "." + Number(vrs) + "\" + \"ALL\")'>Compare Versions</div><div onclick='origLang.loadData(\""  + bookNum + "." + Number(chap) + "." + Number(vrs) +  "\")'>Original Language</div><div onclick='document.getElementById(\"Scripture" + incre + "\").requestFullscreen();'>Full Screen</div><div onclick='trackRead.openDialog(" + incre + ");'>Mark As Read.</div>";
		document.getElementById('contextMenuFooter').innerHTML = "&nbsp;" + "<a href='javascript:;' onclick='getWordData(\"" + wrd + "\", \"" + strongs + "\", \"" + lang + "\", \"" + lmma + "\")'>" + wrd + "</a> " + prse + rt + " " + gloss + lmmaHTML + "&nbsp;";
	}
	//Getting translator/reference notes data
	else if (otype === "tnote" || otype === "rnote") {
		if (otype === "rnote") {
			document.getElementById('contextMenuTitle').innerHTML = "Reference Note";
			document.getElementById('contextMenuMain').innerHTML = document.getElementById("r" + oId.substring(1)).innerHTML;
		}
		else {
			document.getElementById('contextMenuTitle').innerHTML = "Translator's Note";
			console.log("n" + oId.substring(1));
			document.getElementById('contextMenuMain').innerHTML =document.getElementById("n" + oId.substring(1)).innerHTML;
		}
		//Fill and display context menu
		document.getElementById('contextMenuFooter').innerHTML = "&nbsp;"
	}
	else if (otype === "verse") {
		document.getElementById('contextMenuTitle').innerHTML = "Context Menu - Verse";
		document.getElementById('contextMenuMain').innerHTML = "<div onclick='noteControl.openWritingEditor(" + incre + ",0,\"" + oId + "\",\"" + otype + "\")'>Add Note</div> <div onclick='SV(\"" + bookNum + "." + Number(chap) + "." + Number(vrs) + "\" + \"ALL\")'>Compare Versions</div><div onclick='trackRead.openDialog(" + incre + ");'>Mark As Read.</div>";
		document.getElementById('contextMenuFooter').innerHTML = "&nbsp;" + $(v).text();
	}
	else if (otype === "paragraph" || otype === "poetry line") {
		return;
		// document.getElementById('contextMenuTitle').innerHTML = "Context Menu";
		// document.getElementById('contextMenuMain').innerHTML = "<div onclick='noteControl.openWritingEditor(" + incre + ",0," + oId + ",\"" + otype "\")'>Add Note</div> <div onclick='SV(\"" + window["BibleRef" + incre].refList.slice(0,2) + "." + vrs  + "\" + \"ALL\")'>Compare Versions</div><div onclick='trackRead.openDialog(" + incre + ");'>Mark As Read.</div>";
		// document.getElementById('contextMenuFooter').innerHTML = "&nbsp;" 
	}
	else if (otype == "section title") {

		document.getElementById('contextMenuTitle').innerHTML = "Context Menu - Section Title";
		document.getElementById('contextMenuMain').innerHTML = "<div onclick='noteControl.openWritingEditor(" + incre + ",0,\"" + oId + "\",\"section\")'>Add Note</div> <div onclick='SV(\"" + bookNum + "." + Number(chap) + "." + Number(vrs) + "\" + \"ALL\")'>Compare Versions</div><div onclick='trackRead.openDialog(" + incre + ");'>Mark As Read.</div><div onclick='listSectionTitles(" + incre + ",\"" + oId + "\");'>List Section Titles</div>";
		document.getElementById('contextMenuFooter').innerHTML = $(v).text();
	}
	else if (otype == "parse"){
		document.getElementById('contextMenuTitle').innerHTML = "Parsing";
		// console.log ("'"  $(v).text() & "'");
		// console.log ("wo" & $(v).text());
		
		document.getElementById('contextMenuMain').innerHTML = getParseCode($(v).text());
		
		document.getElementById('contextMenuFooter').innerHTML = $(v).text();		
	}
	else {
		document.getElementById('contextMenuTitle').innerHTML = "Context Menu - undefined";
		document.getElementById('contextMenuMain').innerHTML = " Not defined yet for " + otype;
		document.getElementById('contextMenuFooter').innerHTML = "&nbsp;";
	}
	//Fill and display context menu

	//get Scripture element values
	rct=document.getElementById("Scripture" + incre).getBoundingClientRect();
	rctMidY=(rct.bottom - rct.top)/2;
	rctMidX=(rct.right - rct.left)/2;
	console.info("Scripture window MIDDLE X:" + rctMidX + "  Scripture window MIDDLE Y:" + rctMidY);

	document.getElementById('contextMenu').style.left ='-500px';
	document.getElementById('contextMenu').style.top = '-500px';
	document.getElementById('contextMenu').style.fontSize = siteControl.fontSize + 'px';
	//document.getElementById('contextMenu').style.width = "10rem";
	document.getElementById('contextMenu').style.display = 'inline-block';	

	cmRct=document.getElementById("contextMenu").getBoundingClientRect();
	cmRctHeight=cmRct.bottom-cmRct.top;
	cmRctWidth=cmRct.right-cmRct.left;

	console.info("ContextMenu width (X):" + cmRctWidth + "  ContextMenu height (Y):" + cmRctHeight);

	//Set X to left/right and Y to top/bottom of clicked spot.
	if (clickXvp > rctMidX) //click on right of center so place box toward left of click
		cmX=(clickXvp) - cmRctWidth;
	else
		cmX=clickXvp + 10;

	if (clickYvp > rctMidY)	 // click below center so place box above click
		cmY=(clickYvp - 5) - cmRctHeight;
	else
		cmY=clickYvp + 5;
		

	//ensure X and Y don't put child box outside parent box 	
	if (cmY + cmRctHeight > rct.bottom)
		cmY=rct.bottom - cmRctHeight;
	if (cmY < rct.top)
		cmY=rct.top + 2;

	if (cmX + cmRctWidth > rct.right)
		cmX=rct.right - cmRctWidth;
	if (cmX < rct.left)
		cmX=rct.left + 2;



	document.getElementById('contextMenu').style.left = cmX + "px";
	document.getElementById('contextMenu').style.top = cmY + "px";


}

function getParseCode(cde){
	let rowNum=util.findRowIn2DArr("parseCode",0,cde);
	if (rowNum==-1){
		let cde2=cde.substring(0,cde.lastIndexOf("-"));
		console.log("cde2:" + cde2);
		rowNum=util.findRowIn2DArr("parseCode",0,cde2);
		if (rowNum==-1)
			return "Could Not find " + cde;	
		else
		    return "Could Not find " + cde + "<br>" + cde2 + " is: " + parseCode[rowNum][1];
	}
	return parseCode[rowNum][1].replaceAll(";",";<br>");
}


//uncoverGodsWord
function listSectionTitles(incre, ObjId) {
	
	//open up list of SectionTitles in msgbox to pick.
	////console.log("ObjId.id:" + ObjId.id);
	//let myObj=document.getElementById(ObjId);
	displaySectionTitles(window["BibleRef" + incre].bookNum, window["BibleRef" + incre].bookNam, window["BibleRef" + incre].version, incre, window["ScriptureWindow" + incre].startAt, window["ScriptureWindow" + incre].endAt, "msgbox" + ObjId);
}

//SW
function gotoTitle(event, incre) {
		var v = $(event.target);
	//Identify type of object clicked
	var otype = $(v).data("otype");
	if (otype === undefined) {
		return;
	}
	else if (otype == "section title") {
		var secID = $(v).attr("id").substring(2);
		//console.log("secID:" + secID);
		document.getElementById("contextMenu").style.display = "none";
		secID=secID.replaceAll(" ","");
		document.getElementById(secID).scrollIntoView(true);
		//update ScrollToId  remove first four characters of ???
		window["BibleRef" + incre].ScrollToId=secID.substring(4);
		//return top corner of site to top corner
		rootBody("auto");
	}
}

//SW
function getWordData(wrd, strngs, lang, lmma) {
	// console.log("wrd: " + wrd);
	// console.log("strngs: " + strngs);
	// console.log("lang: " + lang);
	// console.log("lmma: " + lmma);
	wrd = wrd.trim();
	var options = "";
	options = siteControl.wordDataOptions;

	//console.log ("getWordData options:" + options);
	$.post("loadWordData.php", {
		wrd: wrd,
		strngs: strngs,
		language: lang,
		lemma: lmma,
		options: options
	},
		function (result) {
			document.getElementById('wordStudyBoxMain').innerHTML = result;
			setAccordionClickListener();
			document.getElementById('contextMenu').style.display = 'none';
			document.getElementById('wordStudyBoxHeader').innerHTML = "Word Study";
			document.getElementById('wordStudyBox').style.display = 'block';
			document.getElementById('msgboxbackground').style.display = 'none';
			document.getElementById('search').style.display = 'none';
		}
	);
}

//*****MISC***** */
function doTestData() {
	$("[data-pars]").css({
		"text-decoration-line": "underline",
		"text-decoration-style": "dotted"
	});

	//$("[data-lm='χριστός']").css({		
	//, "backgroundColor": "yellow"
}

//****************(should be) BibleRef put out scripture window with reference and options **************************************************/	
//******************** Load the Scripture in  ********************************************************

//util
function getColumnIncre(arr, val) {
	var i = 0;
	for (i = 0; i < arr.length; i++) {
		if (arr[i] == val)
			return i;
	}
	return 99;
}

//uGW  NOT USED but should be reviewed to adjust or replace displayScripture code. One consideration is that aother code puts the note right after the word.
function getBDNotes(bookNum, bookNam, version, incre, startAt, endAt) {
	if (typeof (window["note" + bookNam + version]) == undefined || window["note" + bookNam + version] == null)
		return;

	var noteArr = window["note" + bookNam + version];

	if (typeof (noteArr) == "undefined" || noteArr == null)
		return;

	var i = 1;
	var foundNote = false;

	//check if there are any notes in selected reference
	for (i = 1; i <= noteArr.length; i++) {
		////console.log(i);	
		if (noteArr[i][0] > startAt && noteArr[i][0] < endAt) {
			foundNote = true;
			break;
		}
	}

	if (foundNote == false)
		return;

	var wrd = document.getElementById(version + bookNum + noteArr[1][0]);
	var wrdHTML = "string";

	//var scrip = document.getElementById("Scripture" + incre);
	var spanV, wrd;

	for (i = 1; i + 1 < noteArr.length; i++) {
		spanV = document.createElement("span");

		//ensure note is in selected reference
		if (noteArr[i][0] < startAt || noteArr[i][0] > endAt) {
			continue;
		}
		if (noteArr[i][1] == "N") {
			spanV.setAttribute("class", "tnote");
			spanV.setAttribute("data-tnote", noteArr[i][2]);
			spanV.setAttribute("data-otype", "translator note");
			if (window["ScriptureWindow" + incre].showTranslatorNotes == 0)
				spanV.setAttribute("style", "display:none");
			else
				spanV.setAttribute("style", "display:inline");

			node = document.createTextNode("N ");
		}
		else {
			spanV.setAttribute("class", "rnote");
			spanV.setAttribute("data-rnote", noteArr[i][2]);
			spanV.setAttribute("data-otype", "reference note");
			if (window["ScriptureWindow" + incre].showReferenceNotes == 0)
				spanV.setAttribute("style", "display:none");
			else
				spanV.setAttribute("style", "display:inline");

			node = document.createTextNode("R");
		}

		//remove space before note.
		wrdHTML = document.getElementById(version + bookNum + noteArr[i][0]).innerHTML;
		if (wrdHTML.substr(wrdHTML.length - 1) == " ")
			document.getElementById(version + bookNum + noteArr[i][0]).innerHTML = wrdHTML.substr(0, wrdHTML.length - 1);

		spanV.appendChild(node);
		wrd = document.getElementById(version + bookNum + noteArr[i][0]);
		wrdParent = wrd.parentNode;
		wrdParent.insertBefore(spanV, wrd.nextSibling);
	}
}

//uGW
function displaySectionTitles(bookNum, bookNam, version, incre, startAt, endAt, sendTo) {
	let i = 1;
	let j = 1;
	let k = 1;
	let colIncre = 4;
	let colIncreCrossRef=5;
	let foundTitle = false;
	let startChap = 999;
	let endChap = 999;
	let startVrs = 999;
	let endVrs = 999;
	let sectionVersion = "";
	let refCVWIncre = util.refPadCount(bookNum);
	let idIncre=incre;
	startChap = Number(startAt.substr(0, refCVWIncre));
	startVrs = Number(startAt.substr(refCVWIncre, refCVWIncre));
	endChap = Number(endAt.substr(0, refCVWIncre));
	endVrs = Number(endAt.substr(refCVWIncre, refCVWIncre));

	if (startVrs == 99)
		startVrs = 0;

	//****  Get version used for Section Titles */
	//pick which section title group
	// if (siteControl.sectionTitleOriginal == true) {
	// 	colIncre = getColumnIncre(sectionTitles[0], version);
	// 	sectionVersion = version;
	// }

	// ////console.log("sectionTitleDefault:" + siteControl.sectionTitleDefault);
	// if (colIncre == 99) { //does for Original==false and if version not in sectionTitles 
	// 	colIncre = getColumnIncre(sectionTitles[0], siteControl.sectionTitleDefault);
	// 	sectionVersion = siteControl.sectionTitleDefault;
	// }
	// if (colIncre == 99)
	// 	colIncre=4;
	

	//check if section titles for book in selected reference
	for (i = 1; i < sectionTitles.length; i++)
		if (sectionTitles[i][0] == bookNum)
			if ((sectionTitles[i][1] >= startChap) && (sectionTitles[i][2] >= startVrs) && (sectionTitles[i][1] <= endChap) && (sectionTitles[i][2] <= endVrs)) {
				foundTitle = true;
				break;
			}
	if (foundTitle == false)
		return;

	//***  */	
	var rowStartIncre = i;

	while (sectionTitles[i][0] == bookNum) {
		if ( util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) >= util.padNum(endChap, refCVWIncre) + util.padNum(endVrs, refCVWIncre))
			break;
		i++;
		if (i >= sectionTitles.length)
			break;
	}
	var rowEndIncre = i--;

	var divT, parentObj, insertB4Obj, titleLine;
	var crssRef=""; //this is used to hold a crossReference IF is it exists
	var asterisk = ""; //this is used to hold the tVERbbccvvww-incrE ID the beginning "t" is for Title. 
	//This is to be the ID for the Section Titles repeated in the context menu by adding "CM" at the start - don't want any repeat IDs.
	if (sendTo.includes("msgbox")) {
		asterisk = sendTo.substr(6);
		sendTo = sendTo.substr(0, 6);
		//console.log(asterisk + " sendTo:" + sendTo);
		document.getElementById('contextMenuTitle').innerHTML = "Section Titles";
		document.getElementById('contextMenuMain').innerHTML = "";
		document.getElementById('contextMenuFooter').innerHTML = "Click Title to go to it.";
		document.getElementById('contextMenu').style.left = '10px';
		document.getElementById('contextMenu').style.top = '10px';
		document.getElementById('contextMenu').style.zIndex = 26;
		parentObj = document.getElementById('contextMenuMain');

		//element.removeEventListener("mousemove", myFunction);
		//element.addEventListener("click", function(){ myFunction(p1, p2); });	
	}

	//display each section Title	
	for (i = rowStartIncre; i < rowEndIncre; i++) {
		//skip if there is no title for this Version
		if (sectionTitles[i][colIncre] == '')
			continue;

		//create html object
		if (sendTo == "msgbox") {
			divT = document.createElement("div");
			idIncre=incre + "msg";
		}	
		else
			divT = document.createElement("p");
		divT.setAttribute("class", "secTitle");
		divT.setAttribute("data-otype", "section title");

		if (sendTo == "msgbox") {
			divT.setAttribute("id", "CMt" + sectionVersion + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre) + "-" + incre );
			divT.setAttribute("style", "display:block");
			titleLine = document.createTextNode(sectionTitles[i][colIncre]);
			divT.appendChild(titleLine);
			parentObj.appendChild(divT);
		}
		else {
			//set to empty and add the asterisK if a new paragraph break is created.
			asterisk = "";

			divT.setAttribute("id", "t" + sectionVersion + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre)+ "-" + idIncre);
			if (window["ScriptureWindow" + incre].showSectionTitles == false)
				divT.setAttribute("style", "display:none");
			else
				divT.setAttribute("style", "display:block");

			//try to set to paragraph
			insertB4Obj = document.getElementById("p" + version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre)+ "-" + incre);
			//try to set to poetry line
			if (typeof (insertB4Obj) == 'undefined' || insertB4Obj == null) { //no paragraph so set to poetry line	
				if (typeof window["poet" + bookNam + version] != "undefined") {
					//	////console.log  ("poetry name: " + "q" + version + util.padNum(sectionTitles[i][0],refCVWIncre) + util.padNum(sectionTitles[i][1],refCVWIncre) + util.padNum(sectionTitles[i][2],refCVWIncre) + util.padNum(sectionTitles[i][3],refCVWIncre));
					insertB4Obj = document.getElementById("q" + version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre)+ "-" + incre);
				}
			}
			//try to set to verse
			if (typeof (insertB4Obj) == 'undefined' || insertB4Obj == null) { //no paragraph so set to verse	
				//	////console.log  ("verse name: " + "v" + version + util.padNum(sectionTitles[i][0],refCVWIncre) + util.padNum(sectionTitles[i][1],refCVWIncre) + util.padNum(sectionTitles[i][2],refCVWIncre) + util.padNum(sectionTitles[i][3],refCVWIncre));
				insertB4Obj = document.getElementById("v" + version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre)+ "-" + incre);
				asterisk = "*";
			}
			//set to word
			if (typeof (insertB4Obj) == 'undefined' || insertB4Obj == null) { //no verse so set to word	 
				j = sectionTitles[i][3];
				k = 1;
				//	////console.log  ("word name: " + version + util.padNum(sectionTitles[i][0],refCVWIncre) + util.padNum(sectionTitles[i][1],refCVWIncre) + util.padNum(sectionTitles[i][2],refCVWIncre) + util.padNum(sectionTitles[i][3],refCVWIncre));
				insertB4Obj = document.getElementById(version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre) + "-" + incre);
				while (typeof (insertB4Obj) == 'undefined' || insertB4Obj == null) { //no wordorder of 1 for that verse. increment to find first wordorder used
					j++;
					//	////console.log  ("try next wordorder name: " + version + util.padNum(sectionTitles[i][0],refCVWIncre) + util.padNum(sectionTitles[i][1],refCVWIncre) + util.padNum(sectionTitles[i][2],refCVWIncre) + util.padNum(j,refCVWIncre));
					insertB4Obj = document.getElementById(version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(j, refCVWIncre)+ "-" + incre);

					k++;
					if (k > 10)
						break;
				}
				asterisk = "*";
			}
			// place section title
			if (typeof (insertB4Obj) == 'undefined' || insertB4Obj == null)
				console.error("Section Title ERROR: Couldn't find object to put it in front of. " + version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre));
			else {
				parentObj = insertB4Obj.parentNode;
				if(sectionTitles[i][colIncreCrossRef].length==0)  //Check if there is a cross reference or not
					divT.innerHTML = sectionTitles[i][colIncre] + asterisk;
				else //Show Title Cross Reference with open link. Need to open ScriptureDiv0 as a msgbox window. Must ensure Scripture Data is loaded.
					divT.innerHTML = sectionTitles[i][colIncre] + asterisk  + "<small> <small onclick=\"doSectionTitleCR(\'" + version + "\',\'" + sectionTitles[i][colIncreCrossRef] + "')\">(" + sectionTitles[i][colIncreCrossRef] + ")</small></small>"; 
					//divT.innerHTML = sectionTitles[i][colIncre] + asterisk  + "<small> <small onclick=\"document.getElementById(\'VerBtn0\').innerHTML  =\'" + version + "\'; document.getElementById(\'enterVerse0\').innerHTML  =\'" + sectionTitles[i][colIncreCrossRef] + "\'; BibleRef0.parseRefEntered();showScripture0(\' \');\">(" + sectionTitles[i][colIncreCrossRef] + ")</small></small>";
					// spanT.setAttribute("onclick", "uncoveringGodsWord.processScriptureData(0,false);");

					// divT.appendChild(titleLine);
				parentObj.insertBefore(divT, insertB4Obj);
			}
		}
	}
	if (sendTo == "msgbox") {
		document.getElementById('contextMenu').style.display = 'block';
		//console.log("Section Title ID: CM" + asterisk);
		document.getElementById("CM" + asterisk).scrollIntoView();
		rootBody("auto");
	}
}

function doSectionTitleCR(ver, ref){
	document.getElementById('VerBtn0').innerHTML=ver;
	document.getElementById('enterVerse0').innerHTML=ref;
	BibleRef0.refEntered=ref;
	BibleRef0.version=ver;
	BibleRef0.parseRefEntered();
	console.log ("In doSectionTitleCR for ref of " + BibleRef0.refEntered);
	showScripture0(ref);
}

function getRefCVW(refList, version="WEB", startOnly=true, includeBook=false) {
	let i =0;
	let nine = "9";
	let zero="0";
	let bookNum=refList.substring(0,2);
	let bookNumStr="";
	if (includeBook==true)
		bookNumStr=bookNum;
	let refLength = util.refPadCount(Number(bookNum),version);
	let allZeroes=zero.repeat(refLength);
	let theVerse=allZeroes;

	//check if it has a start and ending chapter and/or verse		
	if (refList.includes("-")) {
		var refp = refList.split("-");
		theVerse= refp[0].substr(8 - refLength, refLength);  //new var theVerse
		if (theVerse==allZeroes)   //added
			theVerse=util.padNum(1, refLength);   //added
		startAt = refp[0].substr(5 - refLength, refLength) + theVerse + util.padNum(1, refLength); //replaced with theVerse
		if (refp[1].substr(8 - refLength, refLength) == util.padNum(0, refLength))
			endAt = refp[1].substr(5 - refLength, refLength) + nine.repeat(refLength * 2) // util.padNum(9,refLength*2);
		else
			endAt = refp[1].substr(5 - refLength, refLength) + refp[1].substr(8 - refLength, refLength) + nine.repeat(refLength);
	}
	else {
		if (bookNum == 19) {
			//Can't change 000 verse to 001 for psalms because of verse 0 used in Sept?
			theVerse=refList.substr(5, 3);
			if (theVerse=="000")
				theVerse="001";
			startAt = refList.substr(2,3) + theVerse + "001";
			if (refList.substr(5, 3) == "000")
				endAt = refList.substr(2, 3) + "999999";
			else
				endAt = refList.substr(2, 3) + refList.substr(5, 3) + "999";
		}
		else {
			theVerse=refList.substr(6, 2);
			if (theVerse=="00")
				theVerse="01";
			startAt = refList.substr(3, 2) + theVerse + "01";
			if (refList.substr(6, 2) == "00")
				endAt = refList.substr(3, 2) + "9999";
			else
				endAt = refList.substr(3, 2) + refList.substr(6, 2) + "99";
		}
	}

	// if endAt=00 99 99 or 000 999 999 then change to 99 99 99 or 999 999 999
	if (endAt == util.padNum(0, refLength) + nine.repeat(refLength * 2))
		endAt = nine.repeat(refLength * 3);

	////console.log("startAT:" + startAt + "   endAT:" + endAt);
	if (startOnly){
		//replace all zeroes with 01 or 001
		//for (i=1;i<3;i++)
		if (startAt.substr(0*refLength,refLength)===allZeroes)
			startAt= util.padNum(1,refLength) + startAt.substr(refLength);
		if (startAt.substr(1*refLength,refLength)===allZeroes)
			startAt= startAt.substr(0, refLength) + util.padNum(1,refLength) + startAt.substr(2*refLength);
		if 	(startAt.substr(2*refLength,refLength)===allZeroes)
			startAt= startAt.substr(0, 2 * refLength) + util.padNum(1,refLength);

		// 	startAt= util.padNum(1, refLength) + startAt.substr(refLength)	
		return bookNumStr + startAt;
	}	
	else		
		return bookNumStr + startAt + "-" + bookNumStr + endAt;
}

//if go with it should probable have iFrameControl
function getIframe() {
	//document.getElementById("contextMenuMain").innerHTML='<iframe width="590" height="315" src="https://www.youtube.com/embed/2f0EeXSsLd8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
	document.getElementById("contextMenuMain").innerHTML = '<iframe id="bibleHub" src="https://www.biblestudytools.com/passage/?q=1-peter+1:20-25;+1-peter+2:1-2"></iframe>';
	//https://biblehub.com/niv/1_peter/1.htm
	document.getElementById('contextMenu').style.right = '10px';
	document.getElementById('contextMenu').style.top = '10px';
	document.getElementById('contextMenu').style.zIndex = 26;
	document.getElementById('contextMenu').style.width = '600px';
	document.getElementById('contextMenu').style.height = '400px';

	//document.getElementById('contextMenuMain').style.width = '590px';
	//document.getElementById('contextMenuMain').style.height = '390px';
	document.getElementById('bibleHub').style.width = '390px';
	document.getElementById('bibleHub').style.height = '590px';

	document.getElementById('contextMenu').style.display = "block";
}

//util ONLY in Uncovering God's Word
function elementInViewportTotally(el) {
	var top = el.offsetTop;
	var left = el.offsetLeft;
	var width = el.offsetWidth;
	var height = el.offsetHeight;

	while (el.offsetParent) {
		el = el.offsetParent;
		top += el.offsetTop;
		left += el.offsetLeft;
	}

	return (
		top >= window.scrollY &&
		left >= window.scrollX &&
		(top + height) <= (window.scrollY + window.innerHeight) &&
		(left + width) <= (window.scrollX + window.innerWidth)
	);
}

//util but ONLY used in MakeAudioFile
//to round to n decimal places
function roundTo(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

//devTest
function devTest(){
	////console.log("tesBA");
	let test1=["1","testing1",181,1.4,["0.4","testingAsSub",8504,7.7]];
	let test2=["2","testing2",282,2.6,"testingAsItem"];
	////console.log ("test1:" + test1 + "   test2:"+test2);
	////console.log("stringify test1:" + JSON.stringify(test1));
	////console.log("stringify test2:" + JSON.stringify(test2));
	//call PHP with an array 
	$.post("devtest.php", {
		test1:JSON.stringify(test1),
		test2:JSON.stringify(test2)
	},
	function (result) {
		////console.log("before result");
		//console.log("Result:" + result);
		////console.log("after result");

	}
	);	

}


