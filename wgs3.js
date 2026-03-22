devVer = "0.3 Setup indexedDB for Book Tables"

var siteControl = {
	doSave: true, showTitleBar: true, showFooter: true,
	themeName: "DarkMode",
	// Mustard #bfaa20 Purple #AE0D7A   BrightBlue #CCE7F1 Forrest Green #065123
	themeDarkColor: "#065123",
	themeSWColor: "Default",
	useDefaultSW: true,
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
	//Notes:6, Strongs:7, Lemma:8 (Study Only), Parsing:9 (Study Only), Gloss:10 (Greek Only),
	//Greek:11,Phonetic:12,PhoneticLem:13,Hebrew:14,StrongsHeb:15,Grammar:16,PhoneticHeb:17,GlossHeb:18

	ReadingDefault: "B110000000000000000",

	StudyDefault: "B11000001100000000",
	//1=true, 0=false
	sectionTitleDefault: "LEB",   //use this version's section title for other versions 
	sectionTitleOriginal: false,  //true - use current version's section title/ false- use above default for all version's
	//sectionTitleIsLoaded: "true", //used when first loading the Section Title data to ensure it's not loaded twice.
	lastChanged: null,
	syncSettings: true,
	syncHistory: true,
	paramsURL: "",
	audioTypeAllowed: "SynthOnly",  //other values would be SynthPreferred, VoiceOnly, SynthOnly, None (maybe later do a "Random" option?) For SnynthPreferred The system would have to know when the Synth voice isn't available. 
	getDBSiteSettings: function () {
		//copy Site Setttings to Prev so that can compare if any differences with DB results (and change to DB setting if so).
		this.copyToPrevSettings();
		$.post("getSiteSettings.php", {},
			function (result) {
				console.log("got site SettingS results of " + result);
				// let result4="";
				// let SWColor = [];
				let ss = [];
				ss = result.split("|");
				if (ss.length == 14) {
					siteControl.showTitleBar = ss[0];
					siteControl.showFooter = ss[1];
					siteControl.themeName = ss[2];
					siteControl.themeDarkColor = ss[3];
					siteControl.themeSWColor = ss[4];
					siteControl.greekDisplay = ss[5];
					siteControl.fontSize = ss[6];
					siteControl.fontFamily = ss[7];
					siteControl.wordDataOptions = ss[8];
//					console.log("setting siteControl.audioTypeAllowed to " + ss[9]);
//					siteControl.audioTypeAllowed = ss[9];
					siteControl.ReadingDefault = ss[10];
					siteControl.StudyDefault = ss[11]
					siteControl.sectionTitleDefault = ss[12];
					siteControl.sectionTitleOriginal = ss[13];
					////console.log ("uploaded site Settings from DB");	
					siteControl.updateSiteSettings("prevSiteSettings", "siteControl");
				}
				else {
					console.error("site settings array of '" + ss + "' was a length of " + ss.length + " instead of 14 so not loading.")
				}
			}
		);
	},
	isBright: function (color, threshold) {
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
		if (darkLevel > threshold) {
			return false;
		}
		else {
			return true;
		}
	},
	updateSiteSettings: function (fromTxt, toTxt) {
		let from = window[fromTxt];
		let to = window[toTxt];
		let k = 0;
		let isChanged = false;

		if (from.showTitleBar != to.showTitleBar) {
			//set to opposite because toggle will change
			to.showTitleBar = from.showTitleBar;
			this.toggleTitleBar();
			isChanged = true;
		}

		if (from.showFooter != to.showFooter) {
			//set to opposite because toggle will change
			to.showFooter = from.showFooter;
			this.toggleFooter();
			isChanged = true;
		}
		if ((from.themeName != to.themeName) || (from.themeDarkColor != to.themeDarkColor) || (from.themeSWColor != to.themeSWColor)) {
			this.setTheme(to.themeName);
			isChanged = true;
		}

		if (from.greekDisplay != to.greekDisplay) {
			this.setGreekDisplay(to.greekDisplay);
			isChanged = true;
		}
		if (from.fontSize != to.fontSize) {
			this.setFontSize(to.fontSize);
			isChanged = true;
		}
		if (from.fontFamily != to.fontFamily) {
			console.log("zq In siteControl.updageSiteSettings with different font");
			this.setFontFamily(to.fontFamily);
			isChanged = true;
		}
		if (from.wordDataOptions != to.wordDataOptions) {
			for (k = 0; k < 6; k++)
				siteControl.toggleGreekLexicon(k, false);
			isChanged = true;
		}
		if (from.audioTypeAllowed != to.audioTypeAllowed) {
			this.audioTypeAllowed = to.audioTypeAllowed;
			isChanged = true;
		}

		if (from.ReadingDefault != to.ReadingDefault) {
			this.ReadingDefault = to.ReadingDefault;
			isChanged = true;
		}
		if (from.StudyDefault != to.StudyDefault) {
			this.StudyDefault = to.StudyDefault;
			isChanged = true;
		}
		if (from.sectionTitleDefault != to.sectionTitleDefault) {
			this.sectionTitleDefault = to.sectionTitleDefault;
			isChanged = true;
		}
		if (from.sectionTitleOriginal != to.sectionTitleOriginal) {
			this.sectionTitleOriginal = to.sectionTitleOriginal
			isChanged = true;
		}

		if (isChanged == true)
			setLocalStorage();
	},

	createModeOptions: function (incre, resultsTo) { //called from RH.createRow
		let ModeOpt = "B";
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
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showGreek);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showPhonetic);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showPhoneticLem);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showHebrew);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showStrongsHeb);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showGrammar);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showPhoneticHeb);
		ModeOpt = ModeOpt + booleanToDigit(window["ScriptureWindow" + incre].showGlossHeb);

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
			document.getElementById("brdrDD").style.visibility = "hidden";
			this.showTitleBar = true;
		}
		else {
			$('#siteTitleBar').hide();
			document.getElementById("brdrDD").style.visibility = "visible";
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
		if (versionData[util.getVersionrow(ver)][2].indexOf("English")!==-1) {
			siteControl.activeWindowLanguage = "English";
			$(".EnglishOnly").show();
			$(".GreekOnly").hide();
		}
		else {
			siteControl.activeWindowLanguage = "Greek";
			$(".GreekOnly").show();
			$(".EnglishOnly").hide();
		}
	},
	copyToPrevSettings: function () {
		prevSiteSettings.showTitleBar = this.showTitleBar;
		prevSiteSettings.showFooter = this.showFooter;
		prevSiteSettings.themeName = this.themeName;
		prevSiteSettings.themeDarkColor = this.themeDarkColor;
		prevSiteSettings.themeSWColor = this.themeSWColor;
		prevSiteSettings.greekDisplay = this.greekDisplay;
		prevSiteSettings.fontSize = this.fontSize;
		prevSiteSettings.fontFamily = this.fontFamily;
		prevSiteSettings.wordDataOptions = this.wordDataOptions;
	//	prevSiteSettings.audioTypeAllowed = this.audioTypeAllowed;
		prevSiteSettings.ReadingDefault = this.ReadingDefault;
		prevSiteSettings.StudyDefault = this.StudyDefault;
		prevSiteSettings.sectionTitleDefault = this.sectionTitleDefault;
		prevSiteSettings.sectionTitleOriginal = this.sectionTitleOriginal;
	},
	openDialog: function () {
		document.getElementById('siteSettings').style.display = 'block';
		//copy Site Setttings to Prev so that can compare if any changes when Dialog closed (and save them to DB if so).
		this.copyToPrevSettings();
	},
	closeSiteSettings: function () {

		document.getElementById('siteSettings').style.display = 'none';
		this.useDefaultSW = true;
		this.closeAllSubSettings();

		if (accountControl.isLoggedIntoWGS == false) //Not logged in CANNOT save to db
			return;

		if ((  //any value is changed then save to db
			prevSiteSettings.showTitleBar == this.showTitleBar &&
			prevSiteSettings.showFooter == this.showFooter &&
			prevSiteSettings.themeName == this.themeName &&
			prevSiteSettings.themeDarkColor == this.themeDarkColor &&
			prevSiteSettings.themeSWColor == this.themeSWColor &&
			prevSiteSettings.greekDisplay == this.greekDisplay &&
			prevSiteSettings.fontSize == this.fontSize &&
			prevSiteSettings.fontFamily == this.fontFamily &&
			prevSiteSettings.wordDataOptions == this.wordDataOptions &&
		//	prevSiteSettings.audioTypeAllowed == this.audioTypeAllowed &&
			prevSiteSettings.ReadingDefault == this.ReadingDefault &&
			prevSiteSettings.StudyDefault == this.StudyDefault &&
			prevSiteSettings.sectionTitleDefault == this.sectionTitleDefault &&
			prevSiteSettings.sectionTitleOriginal == this.sectionTitleOriginal
		) == false)
			this.saveSiteSettingsToDB();
	},
	saveSiteSettingsToDB: function () {
		//define object variables to pass to post
		let showTitleBar = this.showTitleBar;
		let showFooter = this.showFooter;
		let themeName = this.themeName;
		let themeDarkColor = this.themeDarkColor;
		let themeSWColor = this.themeSWColor;
		let greekDisplay = this.greekDisplay;
		let fontSize = this.fontSize;
		let fontFamily = this.fontFamily;
		let wordDataOptions = this.wordDataOptions;
	//	let audioTypeAllowed = this.audioTypeAllowed;
		let ReadingDefault = this.ReadingDefault;
		let StudyDefault = this.StudyDefault;
		let sectionTitleDefault = this.sectionTitleDefault;
		let sectionTitleOriginal = this.sectionTitleOriginal;

		$.post("saveSiteControlSettings.php", {
			showTitleBar: showTitleBar,
			showFooter: showFooter,
			themeName: themeName,
			themeDarkColor: themeDarkColor,
			themeSWColor: themeSWColor,
			greekDisplay: greekDisplay,
			fontSize: fontSize,
			fontFamily: fontFamily,
			wordDataOptions: wordDataOptions,
	//		audioTypeAllowed: audioTypeAllowed,
			ReadingDefault: ReadingDefault,
			StudyDefault: StudyDefault,
			sectionTitleDefault: sectionTitleDefault,
			sectionTitleOriginal: sectionTitleOriginal
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
		if (sub != "Theme")
			this.closeSubSettings("Theme");
		if (sub != "Font")
			this.closeSubSettings("Font");
		if (sub != "Greek")
			this.closeSubSettings("Greek");
//		if (sub != "Audio")
//			this.closeSubSettings("Audio");
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
	setDarkThemeColor: function (whichOne) {
		if (whichOne == "Default") {
			siteControl.themeDarkColor = '#065123';
			document.getElementById("DarkThemeColor").value = '#065123';
		}
		else {
			this.themeDarkColor = document.getElementById("DarkThemeColor").value;
		}

		this.setTheme("DarkMode");
	},
	setTheme: function (themeNam) {
		let isItBright = false;
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
		siteControl.themeName = themeNam;
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

			if (siteControl.themeSWColor == "LightOnDark") {
				html.style.setProperty("--txtSW", "white");
				html.style.setProperty("--bgSW", "black");
				html.style.setProperty("--bgSWMark", "blue");
			}
			else {  //is default
				html.style.setProperty("--bgSW", "white");
				html.style.setProperty("--txtSW", "black");
				html.style.setProperty("--bgSWMark", "lightblue");
			}

			html.style.setProperty("--brdr", "black");


			html.style.setProperty("--bgScr", "#709594");
			html.style.setProperty("--thmbScr", "white");

			html.style.setProperty("--danger", "red");


			this.themeSetGradient("bottom right", "bg4", "bgSW");
		}
		else if (themeNam == "Rustic") {
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

			if (siteControl.themeSWColor == "LightOnDark") {
				html.style.setProperty("--txtSW", "#e0e2e4");
				html.style.setProperty("--bgSW", "black");
				html.style.setProperty("--bgSWMark", "blue");
				html.style.setProperty("--txt4", "black");
			}
			else {  //is default
				html.style.setProperty("--bgSW", "#e0e2e4");
				html.style.setProperty("--txtSW", "black");
				html.style.setProperty("--bgSWMark", "lightblue"); //gold 
			}

			html.style.setProperty("--brdr", "#492c28");

			html.style.setProperty("--bgScr", "#625750");
			html.style.setProperty("--thmbScr", "#e0e2e4");

			html.style.setProperty("--danger", "black");

			this.themeSetGradient("bottom right", "bg4", "bgSW");
		}
		else if (themeNam == "Peachy") {  //was c94c4c (bright peach) =   new b64949 (subdued burnt orange)
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

			if (siteControl.themeSWColor == "DarkOnLight") {
				html.style.setProperty("--bgSW", "#fcebe1");
				html.style.setProperty("--txtSW", "#220d01");
				html.style.setProperty("--bgSWMark", "lightblue");//#fc8106
				html.style.setProperty("--txt4", "#5e4131");
			}
			else {  //is default
				html.style.setProperty("--txtSW", "#fcebe1");
				html.style.setProperty("--bgSW", "#220d01");
				html.style.setProperty("--bgSWMark", "blue"); //#2c2b2a	 
			}

			html.style.setProperty("--brdr", "#160c06");

			html.style.setProperty("--bgScr", "#2b1001");
			html.style.setProperty("--thmbScr", "#ee9d6e");

			html.style.setProperty("--danger", "#e74c1d");

			this.themeSetGradient("bottom right", "bg4", "bgSW");

		}
		else { //DarkTheme is default
			isItBright = this.isBright(siteControl.themeDarkColor, 180);
			//			siteControl.themeName = "DarkMode";
			html.style.setProperty("--bg1", "#0d0d0f");
			html.style.setProperty("--txt1", "#d4d4db");

			html.style.setProperty("--bg2", "#191919");
			if (isItBright == true)
				html.style.setProperty("--txt2", "#d4d4db");
			else
				html.style.setProperty("--txt2", siteControl.themeDarkColor);

			html.style.setProperty("--bg3", "#2d2d30");
			html.style.setProperty("--txt3", "white");


			html.style.setProperty("--bg4", siteControl.themeDarkColor);
			if (isItBright == true)
				html.style.setProperty("--txt4", "#d4d4db");
			else
				html.style.setProperty("--txt4", '#0d0d0d');

			html.style.setProperty("--bgbtn", "#0d0d0f");
			html.style.setProperty("--bgbtn-hover", siteControl.themeDarkColor);
			if (isItBright == true)
				html.style.setProperty("--txtbtn-hover", "#d4d4db");
			else
				html.style.setProperty("--txtbtn-hover", '#0d0d0d');

			html.style.setProperty("--txtbtn", "white");
			if (siteControl.themeSWColor == "DarkOnLight") {
				html.style.setProperty("--bgSW", '#dfdfdf');
				html.style.setProperty("--txtSW", '#0d0d0d');
				html.style.setProperty("--bgSWMark", "lightblue"); //gold 			 
			}
			else {
				html.style.setProperty("--bgSW", '#0d0d0d');
				html.style.setProperty("--txtSW", '#dfdfdf');
				html.style.setProperty("--bgSWMark", "blue"); //darkgoldenrod	
			}
			html.style.setProperty("--brdr", "white");

			html.style.setProperty("--bgScr", "#2d2d30");
			html.style.setProperty("--thmbScr", siteControl.themeDarkColor);

			html.style.setProperty("--danger", "red");

			this.themeSetGradient("bottom right", "bg4", "bgSW");
		}

		this.themeSetDD(themeNam);

	},
	themeSetGradient: function (directn, varFrom, varTo) {
		if (document.getElementById("ScriptureFooter" + siteControl.activeWindow) != null) {
			document.getElementById("ScriptureHeader" + siteControl.activeWindow).style.backgroundImage = "linear-gradient(to " + directn + ", var(--" + varFrom + "),var(--" + varTo + "))";
			//if (directn=="bottom")
			//	directn="top";
			document.getElementById("ScriptureFooter" + siteControl.activeWindow).style.backgroundImage = "linear-gradient(to " + directn + ", var(--" + varTo + "),var(--" + varFrom + "))";
		}
		else
			setTimeout(siteControl.themeSetGradient, 400, directn, varFrom, varTo);

	},
	themeSetDD: function (themeNam) {
		let i = 1;
		//When Theme are Creatable objects		let myThemeArr=[];

		//SetTheme is called before document if done so check if last Theme HTML element exists
		if (document.getElementById("DarkThemeColorDefault") != null) {

			//set all the themeSWColor buttons to not highlighted
			for (i = 1; i < 4; i++) {
				document.getElementById("siteThemeSWBtn" + i).style.backgroundColor = "var(--bgbtn)";
				document.getElementById("siteThemeSWBtn" + i).style.color = "var(--txtbtn)";
			}

			i = 3;  //Default is default
			if (siteControl.themeSWColor == "DarkOnLight")
				i = 1;
			else if (siteControl.themeSWColor == "LightOnDark")
				i = 2;

			document.getElementById("siteThemeSWBtn" + i).style.backgroundColor = "var(--bgbtn-hover)";
			document.getElementById("siteThemeSWBtn" + i).style.color = "var(--txtbtn-hover)";

			//set all the Theme buttons to not highlighted
			i = 1;
			while (i < 100) {  //will break when it runs out of buttons which should be long before that... but just in case.
				if (document.getElementById("siteThemeBtn" + i) != null) {
					document.getElementById("siteThemeBtn" + i).style.backgroundColor = "var(--bgbtn)";
					document.getElementById("siteThemeBtn" + i).style.color = "var(--txtbtn)";
					//When Theme are Creatable objects				myThemeArr.push(document.getElementById("siteThemeBtn" + i).innerHTML.replace(" ",""))
				}
				else
					break;
				i++;
			}




			//show pick a color and set Darktheme button here 
			if (themeNam == "DarkMode") {
				//show Pick a Darkmode color
				document.getElementById("DarkThemeColorHr").style.display = "block";
				document.getElementById("DarkThemeColorDiv").style.display = "block";
				//highlight button
				document.getElementById("siteThemeBtn1").style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById("siteThemeBtn1").style.color = "var(--txtbtn-hover)";
			}
			else { //not DarkMode so hide pick a color
				document.getElementById("DarkThemeColorHr").style.display = "none";
				document.getElementById("DarkThemeColorDiv").style.display = "none";
			}

			if (themeNam == "Blue-Green") {
				document.getElementById("siteThemeBtn2").style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById("siteThemeBtn2").style.color = "var(--txtbtn-hover)";
			}

			if (themeNam == "Rustic") {
				document.getElementById("siteThemeBtn3").style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById("siteThemeBtn3").style.color = "var(--txtbtn-hover)";
			}
			if (themeNam == "Peachy") {
				document.getElementById("siteThemeBtn4").style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById("siteThemeBtn4").style.color = "var(--txtbtn-hover)";
			}

		}
		else { //HTML element not exists so try again
			setTimeout(siteControl.themeSetDD, 400, themeNam);
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
	setFontCase: function (fontCase) {
		document.getElementsByTagName("body")[0].style.textTransform = fontCase;
		document.getElementById("fontCaseDiv").style.textTransform = "none";
	},
	setFontFamily: function (fontName, fontNum = 0) {
		//change Body, Input, and Buttons to new font
		document.getElementsByTagName("body")[0].style.fontFamily = fontName;
		$("input").css({ "fontFamily": fontName });
		$("button").css({ "fontFamily": fontName });
		this.fontFamily = fontName;

		if (fontNum == 0)
			switch (fontName) {
				case 'Didact Gothic':
					fontNum = 1; break;
				case 'Ubunto':
					fontNum = 2; break;
				case 'Cardo':
					fontNum = 3; break;
				case 'EB Garamond':
					fontNum = 4; break;
				case 'Arima':
					fontNum = 5; break;
				case 'Confortaa':
					fontNum = 6; break;
				case 'Mynerve':
					fontNum = 7; break;
				case 'Dancing Script':
					fontNum = 8; break;
				case 'Fira Mono':
					fontNum = 9; break;
				// case '':
				// 	fontNum=; break;

			}

		//highlight selected button & unhighlight all others		
		for (let i = 1; i <= 9; i++)
			if (i == fontNum) {
				document.getElementById('siteFontBtn' + i).style.backgroundColor = "var(--bgbtn-hover)";
				document.getElementById('siteFontBtn' + i).style.color = "var(--txtbtn-hover)";
			}
			else {
				document.getElementById('siteFontBtn' + i).style.backgroundColor = "var(--bgbtn)";
				document.getElementById('siteFontBtn' + i).style.color = "var(--txtbtn)";
			}
	},
	setFontSize: function (myFontSize) {
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
			console.log("In GreekDD close display as block");
		}
		else {
			console.log("In GreekDD display as block");
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
		uncoverGodsWord.processScriptureData(this.activeWindow, true);
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
	themeDarkColor: "#065123",
	themeSWColor: "Default",
	activeWindow: 1,
	greekDisplay: 3,
	fontSize: 19,
	fontFamily: "",
	//MounceWD:0,DodsonWD:1,PerseusWD:2,VinesWD:3,StrongsWD:4,Abbott-Smith:5, 
	wordDataOptions: "",
//	audioTypeAllowed: "",
	//Option List Version:0, Section Titles:1,External Links:2,Verse Numbers:3, Verse Newline:4, Sentence Newline:5 (Eng only), 
	//Notes:6, Strongs:7, Lemma:8 (Study Only), Parsing:9 (Study Only), Gloss:10 (Greek Only)
	ReadingDefault: "",
	StudyDefault: "",
	sectionTitleDefault: "",   //use this version's section title for other versions 
	sectionTitleOriginal: false  //true - use current version's section title/ false- use above default for all version's
}

var modalBoxControl = {
	functionTrue: "",
	functionFalse: "",
	processResponse: function (response) {
		let fncArr = [];
		//console.log("In processResponse response:" + response);
		//close modal box
		document.getElementById('modalBox').style.display = 'none';
		document.getElementById('modalbackground').style.display = 'none';

		if (modalBoxControl.functionTrue == "" && modalBoxControl.functionFalse == "")
			return;

		if (response == true) {
			fncArr = this.functionTrue.split(".");
		}
		else {
			fncArr = this.functionFalse.split(".");
		}
		if (fncArr.length == 1)
			window[fncArr[0]]();
		else if (fncArr.length == 2)
			window[fncArr[0]][fncArr[1]]();
		else if (fncArr.length == 3)
			window[fncArr[0]][fncArr[1]][fncArr[2]]();
		else
			console.error("Cannot handle function with more than three parts ");

		modalBoxControl.functionTrue = "";
		modalBoxControl.functionFalse = "";
	}
}

var RH = {  //Reference History	
	//set Arr columns
	iRHRandomId: 0, iRHId: 1, iMode: 2, iSettings: 3, iTopic: 4,
	iRefText: 5, iRefList: 6, iCreateDate: 7, iLastModifiedDate: 8,
	iLastUsed: 9,
	iVersion: 10, iScrollToID: 11, iAudioTimer: 12, iAudioFile: 13,
	iRHSet: 14,
	ColCnt: 15,
	Arr: [],
	FirstNum: "000", //contains 3 digit number "001" to "999"
	LastNum: "000",  //contains 3 digit number "001" to "999"
	CurNum: "000",   //contains 3 digit number "001" to "999"
	DeleteNum: "",
	ToDBDate: 0,
	fromDBDate: 0,
	HistoryBarOpen: false,
	openSidebar: function () {
		//don't run whenever an already open SideBar is clicked
		let myHeight = document.getElementById("HistoryBar").offsetHeight;

		document.getElementById("HistoryBar").style.width = "250px";
		document.getElementById("HistoryBarClose").style.display = "block";
		document.getElementById("HistoryBarHeader").style.display = "block";
		document.getElementById("HistoryBarFooter").style.display = "block";



		myHeight = myHeight - document.getElementById("HistoryBarHeader").offsetHeight - document.getElementById("HistoryBarFooter").offsetHeight;
		////console.log("History Bar Height:" + document.getElementById("HistoryBar").offsetHeight + " Main:" + myHeight);

		document.getElementById("HistoryBarMain").style.height = myHeight + "px";

		document.getElementById("HistoryBar").style.borderRight = "1px solid var(--brdr)";
		document.getElementById("HistoryBar").style.borderTop = "1px solid var(--brdr)";

		document.getElementById("HBClosedText").style.display = "none";
		document.getElementById("HistoryBarMain").style.display = "block";
		this.HistoryBarOpen = true;


	},
	closeSideBarSetHistoryOpen: function () {
		RH.HistoryBarOpen = false;
	},
	closeSidebar: function () {
		setTimeout(RH.closeSideBarSetHistoryOpen, 1000);
		document.getElementById("HistoryBar").style.width = "1em";
		document.getElementById("HistoryBar").style.borderRight = "";
		document.getElementById("HistoryBar").style.borderTop = "";
		document.getElementById("HistoryBarClose").style.display = "none";
		document.getElementById("HistoryBarHeader").style.display = "none";
		document.getElementById("HistoryBarFooter").style.display = "none";
		document.getElementById("HBClosedText").style.display = "block";
		document.getElementById("HistoryBarMain").style.display = "none";
	},
	createRow: function (incre, RHId, rndmId) {
		let rh = "";
		let modeText = "";
		let br = window["BibleRef" + incre];
		//let vc = window["VoiceControl" + incre];

		if (rndmId == "") //Add New so created the rndmId
			rndmId = Math.random().toString(36).substring(2, 15);



		//**Compile RefHist content 	
		if (window["ScriptureWindow" + incre].setupMode == "Reading")
			modeText = "R0";
		else
			modeText = "S0";
		rh = rndmId + "~" + RHId + "~" + modeText + "~" + siteControl.createModeOptions(incre, "RefHist") + "~" + br.topic + "~" + br.refText + "~" + br.refList + "~" + br.createDate + "~" + br.modifyDate + "~" + br.lastUsedDate + "~" + br.version + "~" + br.ScrollToId + "~";
		//rh = rh + vc.currentTime + "~" + vc.timingFile + "~" + "General";
		////console.log("vc.currentTime:" + vc.currentTime + "  audio filename:" + vc.timingFile);
		return rh;
	},
	addToRH: function (incre) { //This is called from a Change in Bible Reference (not version or other settings)
		////console.log("Nums  First:" + RH.FirstNum + " Last:" + RH.LastNum +  " Current:" + RH.CurNum);
		let i = 0;
		let Cols = [];
		let br = window["BibleRef" + incre];

		if (br.isRefValid == false) { //reference not valid do not save.
			////console.log("The reference '" + refText + "' is not valid- not adding to history.")
			return;
		}

		//Create new Nums
		RH.LastNum = RH.LastNum.replace("RH", "");
		RH.LastNum = util.padNum(Number(RH.LastNum) + 1, 3);
		RH.setCurNum(RH.LastNum);

		//stop if not a number
		if (RH.CurNum == "NaN") {
			////console.log ("The  number isn't correct - not adding to history");
			return;
		}

		//stop if RH.CurNum is not right length
		if (RH.CurNum.length != 3) {
			console.error("The RH.CurNum of " + RH.CurNum + " is not the proper 3 digits - exiting addToRH");
			return;
		}

		//update br for new record
		br.RHNum = RH.CurNum;
		br.createDate = Date.now();
		br.modifyDate = br.createDate;
		br.lastUsedDate = br.createDate;

		//get RH set
		rh = RH.createRow(incre, "RH" + RH.CurNum, "");

		//**Add RefHist to LocalStorage 
		window.localStorage.setItem("RH" + RH.CurNum, rh);
		window.localStorage.setItem("RHLastNum", RH.CurNum);
		window.localStorage.setItem("RHCurNum", RH.CurNum);

		//enter RefHist Array variables.
		Cols = rh.split("~");
		RH.Arr.unshift(new Array(Cols.length));
		for (i = 0; i < Cols.length; i++)
			RH.Arr[0][i] = Cols[i];

		RH.loadSideBar();
	}, //end addRefHist
	askDeleteFromRH: function (RHId) {
		modalBoxControl.functionTrue = "";
		modalBoxControl.functionFalse = "";

		////console.log("In askDeleteFromRH");
		if (RH.Arr.length == 1) {
			util.openModalBox("The system needs at least one reference to function.", "Error: cannot delete the last reference", "Cancel");
			return;
		}

		this.DeleteNum = RHId.replace("RH", "");
		modalBoxControl.functionTrue = "RH.trueDeleteFromRH";
		modalBoxControl.functionFalse = "RH.falseDeleteFromRH";
		util.openModalBox("Are you sure to want to Delete this Reference History?", "Delete History", "Yes/No");
	},
	falseDeleteFromRH: function () {
		////console.log("In falseDeleteFromRH");
		this.DeleteNum = "";
	},
	trueDeleteFromRH: function () {
		////console.log("In trueDeleteFromRH");
		let RHNum = this.DeleteNum;
		this.DeleteNum = "";
		let RHId = "RH" + RHNum;

		let i = -1;
		let j = 0;
		let topNum = -1;
		i = this.findRow(this.iRHId, RHId);

		if (i > -1) { //Exists so delete
			//change RH Nums is includes RH being deleleted
			if (RH.LastNum == RHNum) {
				for (j = 0; j < RH.Arr.length; j++)
					if (j != i && topNum < Number(RH.Arr[j][RH.iRHId].replace("RH", "")))
						topNum = Number(RH.Arr[j][RH.iRHId].replace("RH", ""));
				RH.LastNum = util.padNum(topNum, 3);
			}
			if (RH.CurNum == RHNum)
				RH.CurNum = RH.LastNum;
			//set localStorage Delete Marker
			localStorage.setItem("DeleteRH", localStorage.getItem("DeleteRH") + "^" + RH.Arr[i][this.iRHRandomId] + "~" + Date.now());
			//remove Arr row
			RH.Arr.splice(i, 1);
			//delete localStorage 
			localStorage.removeItem(RHId);
		}
		//reload Side Bar
		this.loadSideBar();
	},
	setCurNum: function (Num) {
		if (Num.length == 3 && Number(Num) != "NaN")
			RH.CurNum = Num;
		else
			console.warn("set RH Current Number failed for a value of :" + Num);
	},
	updateRHRow: function (incre, Num) {
		let br = window["BibleRef" + incre];
		let i = -1;
		let Cols = [];
		let j = 0;
		let modified = false;
		let scrollGuessId = "";

		if (br.isRefValid == false) { //STOP- reference not valid.
			////console.log("The reference '" + br.refText + "' is not valid- not adding to history.")
			return;
		}

		Num = Num.replace("RH", "");

		if (Num == "NaN") {//STOP - not a number
			////console.log ("The  number isn't correct - not adding to history");
			return;
		}

		if (Num.length != 3) {
			console.error("The RH.CurNum of " + RH.CurNum + " is not the proper 3 digits - exiting updateRHRow");
			return;
		}

		if (br.RHNum != Num) { //STOP - trying to update the RHNum not currently in BibleRef
			return;
		}

		scrollGuessId = get1stVerseInViewport(incre, br.version);
		if (scrollGuessId != "")
			br.ScrollToId = scrollGuessId;
		////console.log(" In updateRHRow. New ScrollToId Guess:" + scrollGuessId + " so ScrollToId is:" + br.ScrollToId);

		// only update the single RHArr row.
		i = RH.findRow(RH.iRHId, "RH" + Num);

		//get  fresh creation of RH set - just keep the randomId.
		rh = RH.createRow(incre, "RH" + Num, RH.Arr[i][this.iRHRandomId]);

		//**Add RefHist to LocalStorage 
		window.localStorage.setItem("RH" + Num, rh);

		if (i > -1) { //found row
			Cols = rh.split("~");
			for (j = 0; j < Cols.length; j++)
				if (RH.Arr[i][j] != Cols[j]) {
					RH.Arr[i][j] = Cols[j];
					if (j == RH.iLastUsed)
						continue;
					modified = true;
				}
		}
		if (modified == true) {
			RH.Arr[i][RH.iLastModifiedDate] = Date.now();
			//Overwrite RefHist to LocalStorage.
			window.localStorage.setItem("RH" + Num, rh);
		}

	},
	updateRHArrCol: function (Num, Row, Col, Val) {

		if (RH.Arr[Row][iRHId] == "RH" + Num)
			RH.Arr[Row][Col] = Val;
	},
	load2Arr: function () {
		let i = 0;
		let j = Number(this.LastNum);
		let k = 0;
		let Id = "RH000";
		let aRow = "";
		let Cols = "";
		let IdArr = [];
		RH.Arr = []; //clears it out
		// let newBtn;
		// let sideBarTitle="";

		//get array of Ids
		////console.log("load2Arr LastNum for Arr count:" + this.LastNum);
		for (i = j; i >= 0; i--) {
			Id = "RH" + util.padNum(i, 3);
			if (Id in localStorage)   //Exists so add to array
				IdArr.push(Id)
		}

		j = IdArr.length;

		//Prime for 2d Array
		aRow = window.localStorage.getItem(IdArr[0]);
		Cols = aRow.split("~");

		//create empty 2d Array
		// let Array2D = (r,c) => [...Array(r)].map(x=>Array(c).fill(0));
		// this.Arr = Array2D(j,Cols.length+1);

		//unshift  this.Arr
		for (i = 0; i < j; i++) {
			//push empty row of cols
			RH.Arr.push(new Array(Cols.length + 1));
			//get row data 
			aRow = window.localStorage.getItem(IdArr[i]);
			Cols = aRow.split("~");
			//fill empty row with data
			//since unshift the new row is always 0
			for (k = 0; k < Cols.length; k++)
				RH.Arr[i][k] = Cols[k];
			RH.Arr[i][Cols.length] = IdArr[i];
		}

		//newest added RH is at row 0 so
		//window["VoiceControl"+ this.windowID].iRHrow=0;
	},
	loadSideBar: function () { //loads from Arr
		//sort Arr on lastUsedDate

		let i = 0;
		let k = 0;
		let sideBarTitle = "";
		let sideBarClass = "";
		let Id = "";
		let syncChecked = "";
		//clear Button Area in side bar	
		document.getElementById("HistoryBarMain").innerHTML = "";
		////console.log("Arr Length:" + RH.Arr.length);

		$("#HistoryBarMain").append("");

		for (i = 0; i < RH.Arr.length; i++) {
			Id = RH.Arr[i][RH.iRHId]
			sideBarTitle = RH.addSideBarTitle(i);
			//add button to HTML
			if (sideBarTitle.includes("tooltiptext"))
				sideBarClass = "RHBtn tooltip";
			else
				sideBarClass = "RHBtn";

			$("#HistoryBarMain").append('<div><i class="fa fa-trash icongroup" style="display:inline;color:var(--danger);" onclick="RH.askDeleteFromRH(\'' + Id + '\');RH.loadSideBar();"></i><button id="' + Id + '" class="' + sideBarClass + '" style="display:inline;" onclick="RH.load2SW(1,\'' + Id.substr(2) + '\'); RH.closeSidebar();" >' + sideBarTitle + '</button></div>')

			// $("#HistoryBarMain").append('<input id="' + Id + 'cb" type="checkbox" class="RHcb"><button id="' + Id + '" class="' + sideBarClass + '" onclick="RH.load2SW(1,\'' + Id.substr(2) + '\'); RH.closeSidebar();" >' + sideBarTitle + '</button>)
		}
		if (i < 32) {
			$("#HistoryBarMain").append('<br>'.repeat(32 - i));
		}

		//set syncHistory checkbox
		if (this.syncHistory == true)
			syncChecked = "checked";
		$("#HistoryBarMain").append('<div id="HistoryBarFooter" class="SideBarFooter"></div>'); //<input id="syncHistory"  type="checkbox" ' + syncChecked + ' onclick="siteControl.syncHistory=(!siteControl.syncHistory);"><label> sync history</label></div>');			
	},
	addSideBarTitle: function (i) {
		let k = 0;
		let tt = "";
		let sideBarTitle = "";
		let refTxt = buildRefText(RH.Arr[i][RH.iRefList], 11); //short name RefText.

		//sideBarTitle=RH.Arr[i][RH.iTopic];

		if (RH.Arr[i][RH.iTopic] == "")  //Get Button Title column
			sideBarTitle = refTxt; //refText text
		else
			sideBarTitle = RH.Arr[i][RH.iTopic]; //topic text	

		//sideBarTitle=RH.Arr[i][k];
		if (sideBarTitle.length > 24 || RH.Arr[i][RH.iTopic] != "") {//if has Topic or Reference is too long for Button Title.
			tt = refTxt.replace(/ /g, "&nbsp");
			tt = tt.replace(/;/g, "; ");
			tt = tt.replace(/&nbsp/g, "&nbsp;")
			if (sideBarTitle.length > 24)
				sideBarTitle = sideBarTitle.substr(0.21) + "...";
			return sideBarTitle + '<span class="tooltiptext" style="top:115%;left:10%;" >' + tt + '</span>';
		}
		else
			return sideBarTitle;

	},
	findRow: function (type, value, noValueFor = "Z") {
		let i = 0;
		//ensure noValuefor is valid 
		if (!isNaN(noValueFor))
			if (Number(noValueFor) > RH.ColCnt || Number(noValueFor) < 0) {
				console.warn("Cannot get RH column number of ")
			}
		if (!isNaN(type))
			//if RHNum change to RHId
			if ((type == RH.iRHId) && (value.substr(0, 2) != "RH"))
				value = "RH" + value;

		//get Row Increment	
		for (i = 0; i < this.Arr.length; i++)
			if (this.Arr[i][type] == value && noValueFor == "Z")
				return i;
			else if (this.Arr[i][type] == value && this.Arr[i][noValueFor].length > 1)
				return i;
		return -1;
	},
	showArray: function () {
		let i = 0;
		////console.log("CurNum:" + RH.CurNum);
		for (i = 0; i < RH.Arr.length; i++)
			console.warn(RH.Arr[i]);

	},
	load2SW: function (incre, RHId) {
		////console.log("In load2SW");
		let Cols = [];
		let rowI = this.findRow(this.iRHId, RHId);
		let aRow = "";

		let br = window["BibleRef" + incre];
		let sw = window["ScriptureWindow" + incre];

		let Num = RHId.replace("RH", "");
		//update before replace except in intial load.   -click a RH buttton mke changes and click another button.
		if ((br.RHNum != Num) && (br.RHNum != "") && (br.initialLoad == false))
			this.updateRHRow(incre, br.RHNum);


		if (rowI < 0) {  //couldn't find Arr row		
			//see if in localStorage
			aRow = window.localStorage.getItem("RH" + Num);
			if (aRow != null)
				Cols = aRow.split("~");
			else
				console.error("Cannot load Reference History numbered:" + Num);
		}
		else { //found the row

			Cols = this.Arr[rowI];
		}

		//Update Object values from loading RH Arr
		br.clearBibleRef();
		RH.setCurNum(Cols[this.iRHId].replace("RH", ""));
		br.refText = Cols[this.iRefText]
		br.refList = Cols[this.iRefList];
		br.version = Cols[this.iVersion];
		br.topic = Cols[this.iTopic];
		br.ScrollToId = Cols[this.iScrollToID];
		br.RHNum = Num;

		document.getElementById("enterTopic" + incre).innerHTML = Cols[this.iTopic];

		//loading from previous entry so it is good.
		br.isRefValid = true;
		//set ScriptureWindow
		sw.currentSettings = Cols[this.iSettings];
		if (Cols[this.iMode] == "R0")
			sw.setupMode = "Reading";
		else
			sw.setupMode = "Study";
		sw.readFromModeOptions("current", false);
		uncoverGodsWord.processScriptureData(incre, true);
	},
	saveToDB: function () {

		//!!!! first update RH Local Variables from RH Arr.
		//!!!! first get DB data before trying to merge new data here?
		let i = 0;
		let RHArrStrNew = "";
		let RHArrStrModify = "";
		let cDate = new Date();
		let mDate = new Date();
		let uDate = new Date();

		//get date to enter into RH after success
		let UpdateRHToDBDate = Date.now();
		//maybe sort on dates later? 
		for (i = 0; i < RH.Arr.length; i++)
			if (RH.Arr[i][RH.iCreateDate] > RH.ToDBDate) {
				//create one SQL Insert in php with each line as an addiitional insert
				//$QryTxt="INSERT INTO `ReferenceHistory`(`UserID`, `RHId`, `UniqueHandle`, `createDate`, `LastModifiedDate`, `LastUsedDate`, `RHRow`, `deletedate`)";
				//get dates
				////console.log (RH.Arr[i][RH.iCreateDate]);
				cDate = new Date(Number(RH.Arr[i][RH.iCreateDate]));
				mDate = new Date(Number(RH.Arr[i][RH.iLastModifiedDate]));
				uDate = new Date(Number(RH.Arr[i][RH.iLastUsed]))

				RHArrStrNew = RHArrStrNew + '(USERIDQQ,"' +
					RH.Arr[i][RH.iRHId].substr(2) + '","' +
					RH.Arr[i][RH.iRHRandomId] + '","' +
					cDate.toISOString().slice(0, 19).replace("T", " ") + '","' +
					mDate.toISOString().slice(0, 19).replace("T", " ") + '","' +
					uDate.toISOString().slice(0, 19).replace("T", " ") + '","' +
					localStorage.getItem(RH.Arr[i][RH.iRHId]) + '","' +
					'"),';
			}
			else if (RH.Arr[i][RH.iLastModifiedDate] > RH.ToDBDate) {
				//compare to DB download and only modify what has changed. Each RH update is it's own SQL statement
				RHArrStrModify = localStorage.getItem(RH.Arr[i][RH.iRHId]) + "^";
			}

		//Nothing new so STOP	
		if (RHArrStrNew == "" && RHArrStrModify == "")
			return;

		//remove the last comma for New RH inserts
		if (RHArrStrNew != "")
			RHArrStrNew = RHArrStrNew.substr(0, RHArrStrNew.length - 1);

		////console.log(RHArrStrNew);	

		$.post("saveRH.php", {
			RHArrStrNew: RHArrStrNew,
			RHArrStrModify: RHArrStrModify
		},
			function (result) {
				RH.ToDBDate = UpdateRHToDBDate;
				window.localStorage.setItem("ToDBDate", UpdateRHToDBDate);
				util.openModalBox(result, "RH2DB qry");
			}
		);
	},
	getFromDB: function () {
		let dbSyncDateTxt = new Date(Number(RH.ToDBDate)).toISOString().slice(0, 19).replace("T", " ")
		let getFromDbDate = Date.now();
		let RHDbWork = [];
		let RHDbArr = [];
		let i = 0;

		$.post("getRH.php", {
			dbSyncDateTxt: dbSyncDateTxt
		},
			function (result) {
				RH.ToDBDate = getFromDbDate;
				let lastId = "RH" + RH.LastNum;
				window.localStorage.setItem("RHToDBDate", getFromDbDate);
				if (result == "no rows") { //no new records
					////console.log("no new DB records");
					return;
				}

				RHDbWork = result.split("|");

				for (i = 0; i < RHDbWork.length; i++) {
					if (!RHDbWork[i].includes("~")) //is a blank at end of Db returned
						continue;
					RHDbArr = RHDbWork[i].split("~");
					if (RH.findRow(RH.iRHRandomId, RHDbArr[RH.iRHRandomId]) == -1 && RH.findRow(RH.iRHId, RHDbArr[RH.iRHId]) == -1) {
						window.localStorage.setItem(RHDbArr[RH.iRHId], RHDbWork[i]);
						if (RHDbArr[RH.iRHId] > lastId)
							lastId = RHDbArr[RH.iRHId]
					}
					else
						console.warn("Either a dup in RandomId or RHId has occured");
				}

				RH.LastNum = lastId.substr(2);
				window.localStorage.setItem("RHLastNum", lastId.substr(2));
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
		console.log("In accountControl.opendialog");
		//	var myX = event.pageX - 285;
		//	var myY = event.pageY;
		document.getElementById('msgboxbackground').style.display = 'block';
		if (accountControl.email == '".$email."') {
			accountControl.isLoggedIntoWGS = false;
			accountControl.email = "";
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
		if (email == '".$email."') {
			accountControl.isLoggedIntoWGS = false;
			accountControl.email = "";
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
						document.getElementById("accountBtn").style.borderColor = "var(--txtbtn)";
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
				document.getElementById("accountBtn").style.borderColor = "var(--danger)";

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
					document.getElementById("accountBtn").style.borderColor = "var(--txtbtn)";
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

		if (accountControl.email == '".$email."' || accountControl.email == "") {
			accountControl.isLoggedIntoWGS = false;
			accountControl.email = "";
			document.getElementById("accountBtn").style.borderColor = "var(--danger)";
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
		// noteControl.noteList = [['0', '0'], ['0', '0']];
		// noteControl.listNoteText = "";
	},
	getGroups: function () {
		if (accountControl.isLoggedIntoWGS == false)
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

//		noteControl.getNoteList(false);
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

class BibleRef { //Get ref into form BBCCCVVV or BBCCCVVV-BBCCCVVV Whole Book=BB000000, Whole Chapter=BBCCC000, Chapter Range=BBCCC000-BBCCC000 
	constructor(windowID) {
		this.refList = "";       	//this is the reference for computer usage such as 60001001-60001003WEB; separate multiple references with a semicolon(;)
		this.version = "";    		//Keep? or add to RefList //computed           !used all over  
		this.language = "English";
		this.versionArray = [];
		this.topic = "";            // entered 
		this.windowID = windowID;  	//must match to a ScriptureWindow windowID 
		this.refEntered = ""; 		//this is the reference as entered by the user such as 1 Peter 1:1-3
		this.isRefValid = false;	//computer setting   !used to stop version change from trying to load if reference was invalid
		this.initialLoad = true;	//computer setting  keep? !used to force ChangeVersion call to load even if version is the same 
		this.refText = "";			//computed			 !used to put human readable reference in the reference input line 	
		this.refFromTo = "";			//computed  changes each reference to matching from-to with BCVW format 60010101-60010125 or 19001001001  
		this.bookNam = "";          //computed - used to get refList to determine if new book or use previous
		this.bookNum = "";			//computed		!used to grab BookNum in multple reference with a single listing of Book title - Rom 3:23; 10:28 	
		this.ScrollToId = "";       //move to SW? 
		this.prevChapter = "0";     //computed  used to grab chapter in multple reference with a single listing of Chapter number - Rom 3:23,29
		this.RHNum = "000";         //is this needed?  Used to tie reference with reference history
		this.createDate = Date.now();    //
		this.modifyDate = this.createDate;    // to add to history - to sort it and to remove if not used
		this.lastUsedDate = this.createDate;  //
		this.multipleBooks = false;  //set in uncoverGodsWord
		this.refCount = 0; 			//set in uncoverGodsWord
	}
	clearBibleRef() {
		this.isRefValid = false;
		this.refList = "";
		this.refText = "";
		this.refFromTo = "";
		this.RHNum = "";
		this.bookNam = "";
		this.bookNum = "";
		//window["VoiceControl"+ this.windowID].bookNum=this.bookNum; //sync with audio to prevent loading wrong audio to RH
//		window["VoiceControl" + this.windowID].currentTime = 0;
		this.ScrollToId = "";
		this.multipleBooks = false;
		this.versionArray = [];
		this.refWordArr = [];
		window.speechSynthesis.cancel();
	}
	changeVersion(ver) {  //this only run when a person changes the version
		////console.log("In changeVersion for " + ver);
		let i = 0;
		let j = 0;
		let scrollGuessId = "";
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
		scrollGuessId = get1stVerseInViewport(this.windowID, this.version);
		if (scrollGuessId != "")
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
		uncoverGodsWord.processScriptureData(this.windowID, false);
	}
	parseRefEntered() {
		var refr = document.getElementById('enterVerse' + this.windowID).value;
		////console.log("In parseRefEntered for " + refr);
		////console.log("In parseRefEntered old text " + this.refText);	
		var i = 0;
		var refp = [];
		var checkRef = "";
		var refBreakChar = "";
		let chkchr = "";
		let rowI = -1;
		let prevRefText = this.refText;

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

		while (refr.includes(".") == true) {
			chkchr = refr.substring(refr.indexOf(".") - 1, refr.indexOf("."));
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
		this.refText = buildRefText(this.refList, 1);

		document.getElementById('enterVerse' + this.windowID).value = this.refText;

		//if same refText then exit
		if (prevRefText == this.refText) { //same reference as in now
			document.getElementById("enterVerse" + this.windowID).value = this.refText;
			return;
		}
		//If in History pull RH row & load2SW else  -
		//-else add to RH row  - call PSD directly  
		if (this.topic.length > 1) {//If topic then update topic reference and process
			rowI = RH.findRow(RH.iTopic, this.topic);
			if (rowI > -1) {
				this.RHNum = RH.Arr[rowI][RH.iRHId].replace("RH", "");
				RH.updateRHRow(this.windowID, this.RHNum);
			}
		}
		else
			rowI = RH.findRow(RH.iRefList, this.refList, RH.iTopic);

		if (rowI >= 0) {
			this.RHNum = RH.Arr[rowI][RH.iRHId].replace("RH", "");
			RH.load2SW(this.windowID, this.RHNum);
		}
		else { //not in history - Creating NEW RH
			//clear voiceControl RH data
			//voiceControl.timingFile="";
		//	window["VoiceControl" + this.windowID].currentTime = 0;
			this.ScrollToId = this.version + this.refList.substring(0, 2) + getRefCVW(this.refList, this.version, true) + "-" + this.windowID;
			if (this.refList.includes(";") == true && this.topic == "") //first entry of multiple ref
				openTRBox(this.windowID);
			else {
				RH.addToRH(this.windowID);
				uncoverGodsWord.processScriptureData(this.windowID, false);
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

		let slice2i = -1;
		let slice3i = -1;

		//should be no semicolons, so remove if exist.
		refr = refr.replace(/;/g, "");
		//remove a beginning or ending space
		refr = refr.trim();

		//check if ends in a version add to versionArr with default version or entered version
		slice2i = util.findRowIn2DArr("versionData", 1, refr.slice(-2));
		slice3i = util.findRowIn2DArr("versionData", 1, refr.slice(-3));
		if (slice3i > -1) {
			this.versionArray.push(versionData[slice3i][0]);
			refr = refr.substring(0, refr.length - 3);
		}
		else if (slice2i > -1) {
			this.versionArray.push(versionData[slice2i][0]);
			refr = refr.substring(0, refr.length - 2);
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
			if (Booknam.includes("JUD") == true)
				BookNum = 65; //book of Jude
			else if (Booknam.substr(0, 2) == "PH")
				BookNum = 49; //Philippians	
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
	fillRefFromTo(callVoiceControlStart = true) {
		return;
		//called from uncoverGodsWorD.displayScripturE.  This calls VC.startAudioFileProcesS 
		let refListArr = this.refList.split(";");
		let semicolon = "";
		//clear current values
		this.refFromTo = "";

		for (let j = 0; j < refListArr.length; j++) {
			if (j == 1)
				semicolon = ";"; //change from "" to ";" on second pass to use between each refItem
			if (this.versionArray.length == refListArr.length)
				this.refFromTo += semicolon + this.reformat2RefFromTo(refListArr[j], this.versionArray[j]);
			else
				this.refFromTo += semicolon + this.reformat2RefFromTo(refListArr[j], this.version);
		}
		//console.log ("br.refFromTO:" + this.refFromTo);
		//if (callVoiceControlStart == true)
		//	window["VoiceControl" + this.windowID].startAudioFileProcess(this.version, this.refFromTo);
	}
	reformat2RefFromTo(refListItem, version = "WEB", includesBook = true) {
		//just one reference - may be 8 character like BCV 60-001-000 or a "from and to" in that BCV format 60001010-600010017 
		let i = 1;
		let k = 1;
		let bookNum = refListItem.substring(0, 2);
		let bookNam = bibleBookData[Number(bookNum)][8];
		let CVW = getRefCVW(refListItem, version, false, false);
		//CVW will be a length of 2 or 3 for each C,V, and W value. Book is always 2. 
		let pnum = 3;
		let nines = "999";
		let zeroOne = util.padNum(1, 3); //01 or 001
		let startAt = CVW.substring(0, 3 * pnum);  //chapter verse word order that reference starts at
		let endAt = CVW.substring(10); //grab CVW ref after dash

		//console.log ("startAt:" + startAt + "  endAt:"+ endAt);

		//get Bible book data.   
		let wordArr = window["B" + bookNam + version];
		//added for clarity in coding below
		let lastCh = util.padNum(bibleBookData[Number(bookNum)][2], pnum);
		let endAtCh = endAt.substring(0, pnum);
		let endAtChVs = endAt.substring(0, pnum + pnum);
		let lastVs = "00";
		let endAtVs = "00";

		if (nines.repeat(3) == endAt) {  //CVW of 999999 or 999999999 shows is a full book
			//replace startAT Chapter of 00 or 000 with 01 or 001
			startAt = zeroOne.repeat(3); //the getRefCVWW function only has the wrong startAT for full book because it leaves chapter as 00
			//replace endAT all 9s with last CVW reference
			endAt = wordArr[wordArr.length - 1][0];
		}
		else if (endAt.slice(0 - (pnum + pnum)) == nines.repeat(2)) {  //has chapter but 9s for VW
			if (endAtCh == lastCh)
				endAt = wordArr[wordArr.length - 1][0];
			else { //not last chapter of booK so find first row on next chapter and step back one.
				i = util.findRowIn2DArr("B" + bookNam + version, 0, util.padNum(Number(endAtCh) + 1, pnum) + zeroOne.repeat(2));
				if (i == -1) { //error return "-1"
					console.error("Could not find row in Bible data"); return "-1";
				}
				endAt = wordArr[i - 1][0];
			}
		}
		else if (endAt.slice(0 - pnum) == nines) {  //only the Word has 9s 
			//if last chap and verse then get last ref from Book
			endAtVs = endAt.substring(pnum, pnum + pnum);
			lastVs = util.padNum(getTopVerse(Number(bookNum), endAtCh), pnum);
			if (endAtCh == lastCh && endAtVs == lastVs)
				endAt = wordArr[wordArr.length - 1][0];
			else { //find first ref for CV and increment until the CV changes. Then get the ref before CVW.
				i = util.findRowIn2DArr("B" + bookNam + version, 0, endAtChVs + zeroOne);
				if (i == -1) { //error return "-1"
					console.error("Could not find row in Bible data"); return "-1";
				}
				for (k = i; k < wordArr.length; k++)
					if (endAtChVs != wordArr[k][0].substring(0, pnum + pnum)) {
						break;
					}
				endAt = wordArr[k - 1][0];
			}
		}
		if (includesBook == true)
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
		let bookNum = Number(this.bookNum);
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
						linkVid3.href = "https://www.youtube.com/watch?v=fUmktYvg7CQ&list=PLcJVIuhI8isJOKcvkIMhwj7Gv5769FqEJ";
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
		if (this.bookNum != undefined)
			if (this.refList.substr(2, 3) != "000")
				document.getElementById("NETNotes" + this.windowID).href = "https://netbible.org/bible/" + bibleBookData[Number(this.bookNum)][1].replace(" ", "+") + "+" + Number(this.refList.substring(2, 5));
			else
				document.getElementById("NETNotes" + this.windowID).href = "https://netbible.org/bible/" + bibleBookData[Number(this.bookNum)][1].replace(" ", "+") + "+1";
		else
			document.getElementById("NETNotes" + this.windowID).href = "https://netbible.org/bible";

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
		this.showLemma = false; // = showLemma; 	//WC					//human selected setting
		this.showSectionTitles = false; // = showSectionTitles;
		this.showParsing = false; //
		this.showVideoBar = false; // = showVideoBar;
		this.showStrongs = false; // = showStrongs; //WC 					//human selected setting
		this.showGreekWord = false; // = showStrongs; //WC 					//human selected setting			
		this.showGreek = false; //WC 					//human selected setting
		this.showPhonetic = false; //WC 					//human selected setting
		this.showPhoneticLem = false; //WC 					//human selected setting
		this.showHebrew = false; //WC 					//human selected setting
		this.showStrongsHeb = false; //WC 					//human selected setting 
		this.showGrammar = false; //WC 					//human selected setting
		this.showPhoneticHeb = false; //WC 					//human selected setting
		this.showGlossHeb = false; //WC 					//human selected setting
		//OLD this.startAt = "000000";  //used for SectionTitle calls
		//OLD this.endAt = "999999";    //used for SectionTitle calls

		//used to get SW sizing
		this.windowHeight = 0;
		this.top = 0;
		this.bottom = 0;
		this.left = 0;
		this.right = 0;
	}
	setScriptureHeight() {
		let AVheight = 0; //External Links Bar Height (Audio/Video)
		let rct = "";
		if (document.getElementById("VideoBar" + this.windowID).style.display != "none") // External Links Bar is on
			AVheight = -10 + -1 * document.getElementById("VideoBar" + this.windowID).offsetHeight;
		if (window.innerHeight > 600)
			this.windowHeight = -47 + AVheight + window.innerHeight - ($("#SiteHeading").innerHeight() + $("#ScriptureHeader" + this.windowID).innerHeight() + $("#ScriptureFooter" + this.windowID).innerHeight());
		else
			this.windowHeight = -57 + AVheight + window.innerHeight;

		$("#Scripture" + this.windowID).height(this.windowHeight);
		rct = window["Scripture" + this.windowID].getBoundingClientRect();
		this.top = rct.top;
		this.bottom = rct.bottom;
		this.left = rct.left;
		this.right = rct.right;   //was rct.lft???

	}
	showSWTopic() {
		document.getElementById("enterVerse" + this.windowID).style.display = "none";
		document.getElementById("enterTopic" + this.windowID + "Group").style.display = "inline";
		document.getElementById("refLabel" + this.windowID).innerHTML = "Topic:&nbsp;";
	}
	showSWReference() {
		document.getElementById("enterVerse" + this.windowID).style.display = "inline";
		document.getElementById("enterTopic" + this.windowID + "Group").style.display = "none";
		document.getElementById("refLabel" + this.windowID).innerHTML = "Ref:&nbsp;";
		document.getElementById("enterTopic" + this.windowID).innerHTML = "0";
	}
	readFromModeOptions(readFrom, changeByUser) {
		////console.log("In sw readFromModeOptions");
		//
		let setFrom = null;
		if (readFrom == "Reading") {
			// if (window["BibleRef" + this.windowID].refCount > 1) {
			// 	util.openModalBox("Reading mode requires only one reference. Current reference is more than one.", "Cannot Setup for Reading");
			// 	document.getElementById("ReadingMode1").checked = false;
			// 	document.getElementById("StudyMode1").checked = true;
			// 	return;
			// }	
			this.setupMode = "Reading";
			readFrom = "Default";
			$(".StudyOnly").hide();
		}
		if (readFrom == "Study") {
			this.setupMode = "Study";
			readFrom = "Default";
			$(".StudyOnly").show();
		}
		if (readFrom == "Default") {
			if (this.setupMode == "Reading")
				setFrom = siteControl.ReadingDefault;

			if (this.setupMode == "Study")
				setFrom = siteControl.StudyDefault;
		}
		if (readFrom == "current")
			setFrom = this.currentSettings;

		if (setFrom == null) {
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
		this.showGloss = digitToBoolean(setFrom[10]);
		this.showGreek = digitToBoolean(setFrom[11]);
		this.showPhonetic = digitToBoolean(setFrom[12]);
		this.showPhoneticLem = digitToBoolean(setFrom[13]);
		this.showHebrew = digitToBoolean(setFrom[14]);
		this.showStrongsHeb = digitToBoolean(setFrom[15]);
		this.showGrammar = digitToBoolean(setFrom[16]);
		this.showPhoneticHeb = digitToBoolean(setFrom[17]);
		this.showGlossHeb = digitToBoolean(setFrom[18]);

		// this.show =digitToBoolean(setFrom[19]);
		// this.show =digitToBoolean(setFrom[20]);

		this.ResetOptions(false);
		document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		this.toggleModeOptions(false);

		if (this.setupMode == "Study" && changeByUser == true) { //reload to add Greek Lemma/Parsing even if hidden
			uncoverGodsWord.processScriptureData(this.windowID, false);
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
			if (this.showGreekWord != digitToBoolean(defaultOptions[11]))
				return false;
			if (this.showPhonetic != digitToBoolean(defaultOptions[12]))
				return false;
			if (this.showPhoneticLem != digitToBoolean(defaultOptions[13]))
				return false;
			if (this.showHebrew != digitToBoolean(defaultOptions[14]))
				return false;
			if (this.showStrongsHeb != digitToBoolean(defaultOptions[15]))
				return false;
			if (this.showGrammar != digitToBoolean(defaultOptions[16]))
				return false;
			if (this.showPhoneticHeb != digitToBoolean(defaultOptions[17]))
				return false;
			if (this.showGlossHeb != digitToBoolean(defaultOptions[18]))
				return false;
			//Greek:11,Phonetic:12,PhoneticLem:13,Hebrew:14,StrongsHeb:15,Grammar:16,PhoneticHeb:17,GlossHeb:18		
		}

		return true;
	}
	OptionshowVideoBarChange(changeByUser) {
		if (changeByUser == true) {
			this.showVideoBar = document.getElementById("showVideoBar" + this.windowID).checked;
			if (window["BibleRef" + this.bibleRefId].multipleBooks == true)
				util.openModalBox("The VideoBar does not show when multiple Bible Books are referenced.", "Multiple Bible Books Referenced")
			window["BibleRef" + this.bibleRefId].showVideoBar = this.showVideoBar;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById("showVideoBar" + this.windowID).checked = this.showVideoBar;

		//set the window to match the new property
		if ((this.showVideoBar == false) || (window["BibleRef" + this.bibleRefId].multipleBooks == true))
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
		if (this.showVerseNumbers == false)   // False  //don't show verse reference
			document.querySelectorAll('#Scripture' + this.windowID + ' .vrs').forEach(el => { el.style.display = 'none'; });
		else
			document.querySelectorAll('#Scripture' + this.windowID + ' .vrs').forEach(el => { el.style.display = 'inline'; });
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
			uncoverGodsWord.processScriptureData(this.windowID, false);
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
			document.querySelectorAll('#Scripture' + this.windowID + ' .lemma').forEach(el => { el.style.display = 'none'; });
		else
			document.querySelectorAll('#Scripture' + this.windowID + ' .lemma').forEach(el => { el.style.display = 'inline'; });
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
	OptionshowPhoneticChange(changeByUser) {
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.showPhonetic = document.getElementById("showPhonetic" + this.windowID).checked;
			if (this.matchDefault() == false)
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			else
				document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			document.getElementById("showPhonetic" + this.windowID).checked = this.showPhonetic;

		//set the window to match the new property
		if (this.showPhonetic == false)
			document.querySelectorAll('#Scripture' + this.windowID + ' .phonetic').forEach(el => { el.style.display = 'none'; });
		else
			document.querySelectorAll('#Scripture' + this.windowID + ' .phonetic').forEach(el => { el.style.display = 'inline'; });

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
			document.querySelectorAll('#Scripture' + this.windowID + ' .strongs').forEach(el => { el.style.display = 'none'; });
		else
			document.querySelectorAll('#Scripture' + this.windowID + ' .strongs').forEach(el => { el.style.display = 'inline'; });

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
			document.querySelectorAll('#Scripture' + this.windowID + ' .parse').forEach(el => { el.style.display = 'none'; });
		else
			document.querySelectorAll('#Scripture' + this.windowID + ' .parse').forEach(el => { el.style.display = 'inline'; });
	}
	OptionshowGreekWordChange(changeByUser) {
		//Set the BibleRef object property
		if (changeByUser == true) {
			this.showGreekWord = document.getElementById("showGreekWord" + this.windowID).checked;
			// if (this.matchDefault() == false)
			// 	document.getElementById("modeOptionsBtn" + this.windowID).style.display = "block";
			// else
			// 	document.getElementById("modeOptionsBtn" + this.windowID).style.display = "none";
		}
		else
			if (document.getElementById("showGreekWord" + this.windowID).checked != this.showGreekWord)
				document.getElementById("showGreekWord" + this.windowID).checked = this.showGreekWord;


		//set the window to match the new property
		if (this.showGreekWord == false)
			document.querySelectorAll('#Scripture' + this.windowID + ' .greek').forEach(el => { el.style.display = 'none'; });
		else
			document.querySelectorAll('#Scripture' + this.windowID + ' .greek').forEach(el => { el.style.display = 'inline'; });
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
				if (window["BibleRef" + this.windowID].bookNum != "") //bookNum is not set so this setting change is part of loading a reference. 
					displaySectionTitles(window["BibleRef" + this.windowID].bookNum, window["BibleRef" + this.windowID].bookNam, window["BibleRef" + this.windowID].version, this.windowID, this.startAt, this.endAt, "SW");
				else {
					var k = document.getElementsByClassName("secTitle").length; //get the number of secTitle class in HTML Scripture element 
					if (k == 0) {//if none then
						if (window["BibleRef" + this.windowID].bookNum != "") //bookNum is not set so this setting change is part of loading a reference. 
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
		this.OptionshowNotesChange(changeByUser);
		this.OptionshowStrongsChange(changeByUser);
		this.OptionshowLemmaChange(changeByUser);
		this.OptionshowParsingChange(changeByUser);
		this.OptionshowGlossChange(changeByUser);
		this.OptionshowGreekWordChange(changeByUser);
		this.OptionshowPhoneticChange(changeByUser);
		// this.OptionshowPhoneticLemChange(changeByUser);
		// this.OptionshowHebrewChange(changeByUser);
		// this.OptionshowStrongsHebChange(changeByUser);
		// this.OptionshowGrammarChange(changeByUser);
		// this.OptionshowPhoneticHebChange(changeByUser);
		// this.OptionshowGlossHebChange(changeByUser);


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

var uncoverGodsWord = {
	incre: 1,
	br: null, //will be BibleRef + incre
	vc: null, //will be VoiceControl + incre
	refCount: 0,
	refIncre: 0, //will count through refCount until done. 
	hasTopic: false,
	refListArr: [],
	refTextArr: [],
	refVersionArr: [], //enables each reference to have its own version
	version: "", //default version for these references - used if none specified on refList
	versionCount: 0,
	paragraphId: 0,
	resetEnterVerse: false,
	lastRefBkNum: "00",
//	arryW: [], //will have the bible book data 2d array


	//Run once:starting process - setup BR,SW, and UGW variables
	//called from RH.load2SW, SW.changeVersion, BR.parseRefEntered, closeTRBox (via BR.parseRefEnterd), and a couple others settings -
	//(Break on Sentence, Change Greek Display, setMode away from Reading to add show Lemma etc.)

	processScriptureData: function (incre, skipRHRowUpdate) {
		//Called from siteControl & SW setting changes
		//RH.load2SW 
		//BibleRef#.parseRefEntered & BibleRef#.ChangeVersion
		//closeTRBox (Topic/Reference)
		//stop any speech synthesis that may be reading. 
		window.speechSynthesis.cancel();

		this.incre = incre; //calls with SW/br window ID
		this.refIncre = 0;  //initilize which ref from refListArr 
		this.resetEnterVerse = false;
		this.br = window["BibleRef" + incre];
		this.refVersionArr = this.br.versionArray;
		let i = 0;
		let prevBook = "";

		if (this.br.topic.length > 1) {
			window["ScriptureWindow" + incre].showSWTopic();
			document.title = this.br.topic;
		}
		else {
			window["ScriptureWindow" + incre].showSWReference();
			document.title = this.br.refText;
		}

		//set values 
		this.br.initialLoad = false;

		//document.getElementById("ScriptureHeaderAudio1").style.display = "none";
		//update br variables 
		this.br.bookNum = this.br.refList.substr(0, 2);
		this.br.refCount = (this.br.refList.match(/;/g) || []).length + 1;
		this.refCount = this.br.refCount;

		this.version = this.br.version; //later should be based on each refList
		////console.log("refCount:" + this.br.refCount);

		//set HTML Version and refText
		//get Version row
		i = util.getVersionrow(this.br.version);
		document.getElementById("VerBtn" + incre).innerHTML = versionData[i][1] + "  <i class='fa fa-caret-down caret-down' style='font-size:20px;'></i>";
		document.getElementById("enterVerse" + incre).value = this.br.refText;

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
		if (skipRHRowUpdate == false)
			RH.updateRHRow(incre, RH.CurNum);

		//Get arrays of refList and corresponding Versions and refText
		this.refListArr = this.removeVersionFromRefList(this.br.refList.split(";"));
		//this.refVersionArr=this.getVersionFromRefList(this.br.refList.split(";"),this.br.version);
		this.versionCount = this.countNumberOfVersions(this.refVersionArr);
		this.refTextArr = this.br.refText.split(";");


		//process based on mulitple Book references or not
		this.br.multipleBooks = false;

		//get br.multipleBooks boolean
		if (this.refCount > 1) {
			prevBook = this.br.refList.substr(0, 2);
			for (i = 0; i < this.refListArr.length; i++) {
				if (prevBook != this.refListArr[i].substr(0, 2)) {
					this.br.multipleBooks = true;
					break;
				}
				else
					prevBook = this.refListArr[i].substr(0, 2);
			}
		}
		else {   //single refCount
			if (this.br.ScrollToId == "")  //if blank then load first verse
				this.br.ScrollToId = this.br.bookNum + getRefCVW(this.br.refList, this.version, true) + "-" + this.windowID;
			//Set Video links
			this.br.setVideoLinks();
			//set PDF Links
			this.br.setPDFLinks();
		}

		//set VideoBar showing now that multipleBooks is set.
		window["ScriptureWindow" + incre].OptionshowVideoBarChange(false);

		//make adding Mark As Read visible again.
		//document.getElementById('addMAR').style.display = "block";

		//Clear previous content in Scripture window.	
		document.getElementById("Scripture" + incre).innerHTML = "";

		//brighten up the reference line
		if (this.resetEnterVerse == false) {
			$("#enterVerse" + this.incre).css("color", "var(--txtSW)");
			$("#VerDD" + this.incre).hide();
			this.resetEnterVerse = true;
		}

		uncoverGodsWord.loadScriptureData();
		//
	},
	//repeat for next undone reference: this is a separate function to ensure the AJAX calls are done before displaying scripture.
	loadScriptureData: function () {
		//more than number of references? if so STOP.
		if (this.refListArr.length < this.refIncre + 1) {
			return;
		}
		//has a reference so load the data	
		var ver = this.version //this.br.version - leave this line to change when RefList can include versions;
		this.br.bookNum = this.refListArr[this.refIncre].substr(0, 2);
		this.br.bookNam = bibleBookData[this.br.bookNum][8];

		var arryW = "B" + this.br.bookNam + ver;

		if (typeof window[arryW] == "undefined") { //This Book's Bible Data has not been loaded yet
			console.log("Checking IndexedDB for:", arryW);
			// Check IndexedDB first
			let dbRequest = indexedDB.open("BibleDataDB", 1);
			dbRequest.onupgradeneeded = function (event) {
				let db = event.target.result;
				if (!db.objectStoreNames.contains("bookData")) {
					db.createObjectStore("bookData");
				}
			};
			dbRequest.onsuccess = function (event) {
				let db = event.target.result;
				let transaction = db.transaction(["bookData"], "readonly");
				let store = transaction.objectStore("bookData");
				let getRequest = store.get(arryW);
				let currentRefIncre = uncoverGodsWord.refIncre; // Capture current value
				getRequest.onsuccess = function (event) {
					if (event.target.result) {
						console.log("Found in IndexedDB, loading:", arryW);
						// Data found in IndexedDB, load it
						window[arryW] = event.target.result;
						uncoverGodsWord.displayScripture();
						uncoverGodsWord.loadScriptureData(currentRefIncre);
					} else {
						console.log("Not in IndexedDB, loading from MySQL:", arryW);
						// Not in IndexedDB, load from MySQL
						loadFromMySQL();
					}
				};
				getRequest.onerror = function (event) {
					console.error("Error checking IndexedDB:", event);
					loadFromMySQL();
				};
			};
			dbRequest.onerror = function (event) {
				console.error("IndexedDB error:", event);
				loadFromMySQL();
			};

			function loadFromMySQL() {
				let currentRefIncre = uncoverGodsWord.refIncre; // Capture current value
				versionNum = 1;
				$.post("loadBook.php", {
					bookName: uncoverGodsWord.br.bookNam,
					bookNum: uncoverGodsWord.br.bookNum,
					version: ver,
					versionNum: 1,
					bookType: "n"
				},
					function (result) {
						$("#ScriptureData").append(result);
						uncoverGodsWord.storeInIndexedDB(arryW, window[arryW]);
						uncoverGodsWord.displayScripture();
						uncoverGodsWord.loadScriptureData(currentRefIncre);  //is incremented in displayScripture
						// Delayed call to store in IndexedDB
						//				setTimeout(function() {
						//					storeInIndexedDB(arryW, window[arryW]);
						//				}, 10000); // 10 second delay
					}
				);
			}
		}
		else {
			uncoverGodsWord.displayScripture();
			uncoverGodsWord.loadScriptureData(this.refIncre); //is incremented in displayScripture
		}
	},
	//
	storeInIndexedDB: function (key, data) {
		console.log("Storing to IndexedDB:", key, "Data length:", data ? data.length : "undefined");
		let dbRequest = indexedDB.open("BibleDataDB", 1);
		dbRequest.onupgradeneeded = function (event) {
			let db = event.target.result;
			if (!db.objectStoreNames.contains("bookData")) {
				db.createObjectStore("bookData");
			}
		};
		dbRequest.onsuccess = function (event) {
			let db = event.target.result;
			let transaction = db.transaction(["bookData"], "readwrite");
			let store = transaction.objectStore("bookData");
			let putRequest = store.put(data, key);
			putRequest.onsuccess = function (event) {
				console.log("Data stored in IndexedDB for key:", key);
			};
			putRequest.onerror = function (event) {
				console.error("Error storing data in IndexedDB:", event);
			};
		};
		dbRequest.onerror = function (event) {
			console.error("IndexedDB error:", event);
		};
	},
	//
	displayScripture: function () {
		//get refList 8 digit BBCCCVVV reference that may be 1(full Book, or single chapter or verse) or 2(from-to) where CCC and VVV may be 000 or 999
		//Grab BB and then change CVW to match the Refs first and last Book Table id i.e 2PELEB "061012001-061015026" where the final WWW changes depending on how many words the given version has for that verse.
		//
		const container = document.getElementById("Scripture" + this.incre);
		let vrsDisplay = ""; //used to hold the text of verse number or chapter:verse number (1:1) 
		let verseNum = 0; //used to track when a new verse starts so that can add verse reference  
		const vbb = this.version + this.br.bookNum;
		let currentParagraph = null;
		let currentP = null;

		//get display:none settings for each span label in the word box: lemma,phonetic,... 
		util.setwordboxdisplay(this.incre);

		//grab just one reference - may be 8 character like BCV 60-001-000 or a "from and to" in that BCV format 60001010-600010017 
		let bkwoFromTo = this.getBkTblBkwo(this.refListArr[this.refIncre], this.version);
		let bkwoArr = bkwoFromTo.split("-");
		bkwoStart = Number(bkwoArr[0]);
		bkwoEnd = Number(bkwoArr[1]);

		//get Book Table column number for each column label - based on Book Table first row of column names; 
		const id = 0, word = 1, bkwo = 2
		// let root=getColumnIncre(window["B" + this.br.bookNam + this.version][0], "root") 
		// let nameid= getColumnIncre(window["B" + this.br.bookNam + this.version][0], "nameid");
		let phonetic = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "phonetic")
		let paragraph = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "paragraph");
		let greek = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "greek");
		let strongs = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "strongs");
		let lemma = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "lemma");
		// let phoneticLem=getColumnIncre(window["B" + this.br.bookNam + this.version][0], "phoneticLem") 
		let parse = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "parse");
		let PunctBefore = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "PunctBefore");
		let PunctAfter = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "PunctAfter");
		// let gloss = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "ew");
		// let glossCnt = getColumnIncre(window["B" + this.br.bookNam + this.version][0], "ewLevel");



		//add each row from Book Table 
		for (let i = bkwoStart; i <= bkwoEnd; i++) {
			const row = window["B" + this.br.bookNam + this.version][i];
			const paragraphNum = row[paragraph];

			//set parent of Paragraph as all wordBox elements are direct child of paragaph class wBp	
			if (paragraphNum !== currentParagraph) {  //always reads the first row and any subsequent row with a new paragraph number
				currentParagraph = paragraphNum;

				//print BookName for multipleBook reference lists
				if (this.br.multipleBooks == true && this.lastRefBkNum != this.br.bookNum) {
					const bookNameFull = document.createElement("div");
					//bookNameFull.setAttribute("class", "bknam");
					bookNameFull.textContent = bibleBookData[this.br.bookNum][1];
					container.appendChild(bookNameFull);
					this.lastRefBkNum = this.br.bookNum;
				}

				//get verseNum and create vrsDisplay
				verseNum = 0;  //set to NOT match row[id] so that it will fail the match down on field.label=word below
				//get new paragraph verse format 1:1
				vrsDisplay = Number(row[id].substring(0, 3)) + ":" + Number(row[id].substring(3, 6));

				currentP = document.createElement("p");
				currentP.setAttribute("class", "wBp");
				container.appendChild(currentP);
			}

			// Create flexbox container for each word's fields - ADD ID FROM BKWO FIELD
			const wordBox = document.createElement("div");
			wordBox.setAttribute("class", "wordBox");
			wordBox.id = vbb + "^" + row[bkwo] + "-" + this.incre + "~" + this.refIncre;

			// Define fields with labels
			const fields = [
				{ label: "word", value: row[word], index: word },
				{ label: "greek", value: row[greek], index: greek },
				{ label: "phonetic", value: row[phonetic], index: phonetic },
				{ label: "lemma", value: row[lemma], index: lemma },
				{ label: "parse", value: row[parse], index: parse },
				{ label: "strongs", value: row[strongs], index: strongs }
			];

			// Create SPAN for each field with class=label
			fields.forEach(field => {
				if (field.value && field.value.trim() !== '') {
					const fieldSpan = document.createElement("span");
					fieldSpan.className = field.label;
					fieldSpan.textContent = field.value;

					if (wordboxdisplay[field.label] != "")
						fieldSpan.style = wordboxdisplay[field.label]
					if (field.label == "word") {

						if (row[PunctBefore] != "") {
							const PunctBeforespan = document.createElement("span");
							PunctBeforespan.textContent = row[PunctBefore];
							fieldSpan.prepend(PunctBeforespan);
						}

						if (verseNum != Number(row[id].substring(3, 6))) { //add vrs anchor as a child to word row			
							verseNum = Number(row[id].substring(3, 6)); //prime for next VerseNum change			
							if (vrsDisplay == "")  //not filled as C:V cuz of new paragraph
								vrsDisplay = "" + Number(row[id].substring(3, 6));
							const vrsAnchor = document.createElement("a");
							vrsAnchor.className = "vrs";
							vrsAnchor.textContent = vrsDisplay;
							fieldSpan.prepend(vrsAnchor);
						}

						if (row[PunctAfter] != "") {
							const PunctAfterspan = document.createElement("span");
							PunctAfterspan.textContent = row[PunctAfter];
							fieldSpan.appendChild(PunctAfterspan);
						}

						vrsDisplay = "";
					}
					wordBox.appendChild(fieldSpan);
				}
			});
			currentP.appendChild(wordBox);

		}
		//      if (field.label="word")
		//  

		// //add Section Titles
		// if (window["ScriptureWindow" + this.incre].showSectionTitles == true)
		// 	if (this.refCount == 1)
		// 		displaySectionTitles(this.br.bookNum, this.br.bookNam, this.version, this.incre, startAt, endAt, "SW");

		//if last refIncre after adding a few blank lines at end
		//then scroll to previous place in RH 
		if (this.refListArr.length == this.refIncre) {
			br0 = document.createElement("br");
			br1 = document.createElement("br");
			br2 = document.createElement("br");
			document.getElementById("Scripture" + this.incre).append(br0, br1, br2);

			// if (this.br.ScrollToId != "") { //if there is a ScrollToId value
			// 	let scrollTo = this.br.ScrollToId;
			// 	//try section Title first
			// 	ele = document.getElementById("t" + siteControl.sectionTitleDefault + scrollTo);
			// 	if (typeof (ele) == 'undefined' || ele == null)
			// 		//try paragraph
			// 		ele = document.getElementById("p" + this.version + scrollTo);
			// 	if (typeof (ele) == 'undefined' || ele == null)
			// 		//try Verse Title
			// 		ele = document.getElementById("V" + this.version + scrollTo);
			// 	if (typeof (ele) == 'undefined' || ele == null)
			// 		//try word (verse may be hidden)
			// 		ele = document.getElementById(this.version + scrollTo);

			// 	//if it found any of those		
			// 	if (typeof (ele) != 'undefined' && ele != null)
			// 		if (elementInViewportTotally(ele) == false) { //don't scroll if already in viewport
			// 			ele.scrollIntoView();
			// 			rootBody("auto");
			// 		}
			// }
			// // and then Get RefFromTO the 
			//			console.log("calling refFromTO");
			//			this.br.fillRefFromTo(true); //it will fill the refFromTO string and then call startAudioFileProcesS with it.	
		}

		this.refIncre++;  //for multiple references to go to next one. 
	},
	removeVersionFromRefList: function (refListArr) {
		let newArr = [];
		let i = 0;

		for (i = 0; i < refListArr.length; i++) {
			if (isNaN(refListArr[i].slice(-3)) == true) //should be the Version - so drop it
				newArr.push(refListArr[i].substr(0, refListArr[i].length - 3));
			else //no version just add the Reference
				newArr.push(refListArr[i]);
		}
		return newArr;
	},
	getBkTblBkwo: function (ref, versn) {
		//Book length is 3  "001"
		//receives a single ref in form of BBCCCVVV or BBCCCVVV-BBCCCVVV 
		//returns bkwo-bkwo that contains the Book Table's 
		//                              bkwo = first word of first verse
		//                              bkwo = last word of last verse 
		//NOTE:full book or single chapter or single verse will have only 1 ref
		// example book = 61000000000 chapter =6100100000 verse = 610001001 

		//**************** prime parameter for use ************************
		//get book number and Book Table name
		let j = 0;
		let bkwo1 = 0;  //used to store first bkwo to return if needing to loop through and find the second one

		let ch = "";  //chapter 
		let vrs = ""; //verse
		const bk = Number(ref.substring(0, 2)); //book
		const tblname = "B" + bibleBookData[bk][8] + versn;

		// 	const tblname= "B" + (function(bookCode) {
		// 	let firstLetterIndex = bookCode.search(/[a-zA-Z]/);
		// 	if (firstLetterIndex !== -1) {
		// 		return bookCode.substring(0, firstLetterIndex) + bookCode.charAt(firstLetterIndex).toUpperCase() + bookCode.substring(firstLetterIndex + 1).toLowerCase();
		// 	} else {
		// 		return bookCode;
		// 	}
		// })(bibleBookData[bk][8]) + versn;  //Book Table name

		//ensure Book Table is loaded 
		if (typeof window[tblname] == "undefined") {
			console.log("Error -no loaded 2D Array of " + tblname);
			return;
		}

		//get the one or two references
		const refArr = ref.split('-');

		//remove book number from the start of each ref
		for (let i = 0; i < refArr.length; i++) {
			refArr[i] = refArr[i].substring(2);
			//			refArr[i]=refArr[i].substring(1,3) + refArr[i].substring(4,7); 
		}
		//********************** get Book Table first ad last bkwo for given Ref ***************

		for (let i = 0; i < refArr.length; i++)
			if (refArr.length == 1) {  //ref form is BBCCCVVV (full book or single chapter or single verse)
				if (refArr[i] == "000000") { //entire book reference example: "61000000"
					j = window[tblname].length - 1;
					return window[tblname][1][2] + "-" + window[tblname][j][2];
				}
				else if (refArr[i].substring(3, 6) == "000") {//single chapter - no verse get chapter first and last bkwo
					//****** get chapter start, find first row of it in Book Table
					ch = refArr[i].substring(0, 3);
					j = util.findRowIn2DArr(tblname, 0, ch + "001" + "001");
					if (j == -1) {
						console.error("error Book Table doesn't have a row for chapter " + ch);
						return -1;
					}
					return j + "-" + util.getEndBkwo(tblname, "chapter", window[tblname][j][2]);

				}
				else { //single verse
					//****** get chapter/verse start, find first row of it in Book Table
					ch = refArr[i].substring(0, 3);
					vrs = refArr[i].substring(3, 6)
					j = util.findRowIn2DArr(tblname, 0, ch + vrs + "001");
					if (j == -1) {
						console.error("error Book Table doesn't have a row for chapter-verse " + ch + vrs);
						return -1;
					}
					//Assign first bkwo value
					return j + "-" + util.getEndBkwo(tblname, "verse", window[tblname][j][2]);

				}
			}
			else //ref form is BBCCCVVV-BBCCCVVV
				if (refArr[i].substring(3, 6) == "000") {  //no verse get chapter
					ch = refArr[i].substring(0, 3);
					j = util.findRowIn2DArr(tblname, 0, ch + "001" + "001");
					if (j == -1) {
						console.error("error Book Table doesn't have a row for chapter " + ch);
						return -1;
					}
					if (i == 0)  //first loop though on "From" reference
						bkwo1 = j;
					else
						return bkwo1 + "-" + util.getEndBkwo(tblname, "chapter", window[tblname][j][2]);
				}
				else {  // verse level for BBCCCVVV-BBCCCVVV
					ch = refArr[i].substring(0, 3);
					vrs = refArr[i].substring(3, 6)
					j = util.findRowIn2DArr(tblname, 0, ch + vrs + "001");
					if (j == -1) {
						console.error("error Book Table doesn't have a row for chapter-verse " + ch + vrs);
						return -1;
					}
					if (i == 0)
						bkwo1 = j;
					else
						return bkwo1 + "-" + util.getEndBkwo(tblname, "verse", window[tblname][j][2]);
				}
		//'0'.repeat(CV.length)	
	},
	getVersionFromRefList: function (refListArr, defaultVersion) {
		let newArr = [];
		let i = 0;

		for (i = 0; i < refListArr.length; i++) {
			if (isNaN(refListArr[i].slice(-3)) == true) //should be the Version - so add it
				newArr.push(refListArr[i].slice(-3));
			else //no version just add the default
				newArr.push(defaultVersion);
		}
		return newArr;
	},
	countNumberOfVersions: function (refVersionArr) {
		let i = 1;
		let cnt = 1;
		let addedAlready = refVersionArr[0] + ",";

		for (i = 1; i < refVersionArr.length; i++)
			if (!(addedAlready.includes(refVersionArr[i] + ","))) {
				addedAlready = addedAlready + refVersionArr[0] + ",";
				cnt++;
			}

		return cnt;
	},
	getTitleArray: function (refBCVW) {
		let returnArr = []; //format: Title, ccvvww-cc2vv2ww2 (or cccvvvwww-cccvvvwww)
		let refLength = (refBCVW.length - 2) / 3;
		let beginRow = 0;
		let finalRow = 0;
		let nine = "9";
		let i = 0;

		let c = 0;
		let v = 0;

		let ref2 = "60001002";

		let bb = Number(refBCVW.substr(0, 2));
		let cc = Number(refBCVW.substr(2, refLength));
		let vv = Number(refBCVW.substr(2 + refLength, refLength));

		//get sectionTitles column for version title
		// for (i=4;i<sectionTitles[0].length;i++)
		// 	if (sectionTitles[0][i]==siteControl.sectionTitleDefault)
		// 		break;
		let ttle = 4;

		//get the same or first higher BCV
		for (i = 0; i < sectionTitles.length; i++)
			if (sectionTitles[i][0] == bb) {
				if (sectionTitles[i][1] == cc && sectionTitles[i][2] >= vv)
					break;
				else if (sectionTitles[i][1] > cc)
					break;
			}
			else if (sectionTitles[i][0] > bb) //past the book 		
				break;

		beginRow = i;

		//check if beginRow is outside of array length	
		if (beginRow >= sectionTitles.length) {
			if (bb == 66 && cc == 22) //last book and chapter of Bible
				beginRow = --i;
			else {
				console.error("Could NOT find section title row for " + refBCVW);
				returnArr = ["No Title", "No Reference"];
				return returnArr;
			}
		}

		////console.log ("1st pass  - begin row Title:" + sectionTitles[beginRow][0] + "-" + sectionTitles[beginRow][1] + "-" + sectionTitles[beginRow][2]+ ": " + sectionTitles[beginRow][4]);

		//get BSB section title		
		//find the row with a "BSB" title that equals or proceed the refBCVW
		for (i = beginRow; i > beginRow - 20 && i > 0; i--) {
			if (bb != sectionTitles[i][0]) { //not in book
				i--;
				while (sectionTitles[i][ttle].length < 2)
					i--;
				break;
			}

			if (sectionTitles[i][ttle].length < 2)
				continue;

			if (sectionTitles[i][0] == bb) {
				if (sectionTitles[i][1] == cc && sectionTitles[i][2] <= vv) {
					beginRow = i;
					break;
				}
				else if (sectionTitles[i][1] < cc) {
					beginRow = i;
					break;
				}
			}
		}

		beginRow = i;

		////console.log ("2nd pass  - begin row Title:" + sectionTitles[beginRow][0] + "-" + sectionTitles[beginRow][1] + "-" + sectionTitles[beginRow][2]+ ": " + sectionTitles[beginRow][4]);
		c = sectionTitles[beginRow][1];
		v = sectionTitles[beginRow][2];
		////console.log ("2st pass  - begin row Title:" + sectionTitles[beginRow][0] + " " + sectionTitles[beginRow][1] + " " + sectionTitles[beginRow][2]+ " " + sectionTitles[beginRow][4]);

		//find the next row with BSB title to get ending for this section
		for (i = beginRow + 1; i < sectionTitles.length; i++)
			if (sectionTitles[i][ttle].length > 1) {
				finalRow = i;
				break;
			}


		////console.log("beginRow:" + beginRow + "    final row:" + finalRow +  "  i:" + i);

		if (i == sectionTitles.length) {// could be last section of Bible OR ERROR 
			if (bb == 66)
				ref2 = "66022021";
			else { //somethings messed up
				console.error("No Title Found");
				returnArr = ["No Title", "No Reference"];
				return returnArr;
			}
		}
		else { //get verse before the one with the new title
			////console.log ("get one verse before:" +  util.padNum(sectionTitles[finalRow][0],2) + util.padNum(sectionTitles[finalRow][1],3) + util.padNum(sectionTitles[finalRow][2],3));
			ref2 = getOneVerseBefore(util.padNum(sectionTitles[finalRow][0], 2) + util.padNum(sectionTitles[finalRow][1], 3) + util.padNum(sectionTitles[finalRow][2], 3));
		}
		returnArr.push(sectionTitles[beginRow][ttle], util.padNum(bb, 2) + util.padNum(c, 3) + util.padNum(v, 3) + "-" + ref2);
		return returnArr;
	}
} //end uncoverGodsWord

function getOneVerseBefore(ref) { //format BBCCCVVV
	let bk = Number(ref.substr(0, 2));
	let ch = Number(ref.substr(2, 3));
	let vrs = Number(ref.substr(5));
	let i = 0;

	if (vrs > 1) //simply just subtract one from vrs number
		return util.padNum(bk, 2) + util.padNum(ch, 3) + util.padNum(--vrs, 3);
	else if (ch > 1) {//get last verse of previous chapter
		ch--;
		vrs = Number(getTopVerse(bk, ch));
		return util.padNum(bk, 2) + util.padNum(ch, 3) + util.padNum(vrs, 3);
	}
	else if (bk > 1) {//get last chapter and verse of previous book 
		bk--;
		ch = bibleBookData[bk][2];
		vrs = Number(getTopVerse(bk, ch));
		return util.padNum(bk, 2) + util.padNum(ch, 3) + util.padNum(vrs, 3);
	}
	else //Gen 1:1 so just return it.
		return ref;

}

function getTopVerse(bk, chp) {
	let j = 0;
	if (isNaN(bk) || isNaN(chp))
		return -1;
	bk = Number(bk);
	chp = Number(chp);

	for (j = 0; j < bibleTopVerse.length; j++)
		if (bibleTopVerse[j][0] == bk && bibleTopVerse[j][1] == chp)
			break;
	if (j + 1 < bibleTopVerse.length)
		return bibleTopVerse[j][2];
	else
		return -1;
}

//******************  Set Local Storage when closing the window  *********************************************
window.onbeforeunload = function () {
	br = window["BibleRef" + siteControl.activeWindow];
	br.ScrollToId = get1stVerseInViewport(br.windowID, br.version);
	RH.updateRHRow(siteControl.activeWindow, RH.CurNum);
	setLocalStorage();
}

function setLocalStorage() {
	if (siteControl.doSave === true) {
		localStorage.setItem("RHCurNum", RH.CurNum);
		localStorage.setItem("RHLastNum", RH.LastNum);
		localStorage.setItem("RHFirstNum", RH.FirstNum);
	//	localStorage.setItem("speechVoice", document.getElementById("voiceSelect1").value);
	//	localStorage.setItem("speechPitch", document.getElementById("audioPitch1").value);
	//	localStorage.setItem("speechRate", document.getElementById("audioRate1").value);
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
		localStorage.setItem("siteControlsyncSettings", siteControl.syncSettings);
		localStorage.setItem("siteControlsyncHistory", siteControl.syncHistory);
	}
}

//********************* Start Up Loading 
$(document).ready(function () {
	////console.log("In document ready");
	var email = "";
	var hash = "";
	let k = 0;
	let refList = "";
	let version = "";

	const params = new URLSearchParams(location.search);
	//let params=param.toUpperCase;

	////console.log("params:" + params);
	accountControl.checkLogin();

	if (!("siteControlReadingDefault" in localStorage))
		localStorage.setItem("siteControlReadingDefault", "B11000000000000000000");
	if (!("siteControlStudyDefault" in localStorage))
		localStorage.setItem("siteControlStudyDefault", "B11000000000000000000");
	if (!("RHFirstNum" in localStorage))
		localStorage.setItem("RHFirstNum", "000");
	if (!("RHLastNum" in localStorage))
		localStorage.setItem("RHLastNum", "000");
	if (!("RHCurNum" in localStorage))
		localStorage.setItem("RHCurNum", "000");
//	if ("speechVoice" in localStorage)
//		document.getElementById("voiceSelect1").value = localStorage.getItem("speechVoice");


	RH.FirstNum = localStorage.getItem("RHFirstNum").replace("RH", "");
	RH.LastNum = localStorage.getItem("RHLastNum").replace("RH", "");
	RH.setCurNum(localStorage.getItem("RHCurNum").replace("RH", ""));

	//Check for Ref/Version
	//verify email from link in email 	
	if (params.has('REF') == true || params.has('ref') == true || params.has('Ref') == true || params.has('REFERENCE') == true || params.has('reference') == true || params.has('Reference') == true) {
		if (params.has('REF') == true)
			refList = params.get('REF');
		else if (params.has('ref') == true)
			refList = params.get('ref');
		else if (params.has('Ref') == true)
			refList = params.get('Ref');
		else if (params.has('REFERENCE') == true)
			refList = params.get('REFERENCE');
		else if (params.has('reference') == true)
			refList = params.get('reference');
		else if (params.has('Reference') == true)
			refList = params.get('Reference');
		// if (params.has('version')==true || params.has('Version')==true)
		// 	if (params.has('version')==true)
		// 		version=params.get('version');
		// 	else
		// 		version=params.get('Version');
	}

	//Prime for first load
	if (RH.LastNum == "000") {
		window.localStorage.setItem("RH000", "AAAAAAAAAAAAAAA~RH000~R0~A1100000000~~1 Peter All~60000000~1588336664999~1588336664999~1588336664999~LEB~60010101~0~~General");
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
	if (document.getElementById("DarkThemeColor").value == "#abcdef")
		document.getElementById("DarkThemeColor").value = siteControl.themeDarkColor;

	//get and set sync checkboxes	
	if (!("siteControlsyncHistory" in localStorage)) {
		localStorage.setItem("siteControlsyncHistory", "true");
		localStorage.setItem("siteControlsyncSettings", "true");
	}
	if (localStorage.getItem("siteControlsyncHistory") == "true")
		siteControl.syncHistory = true;
	else
		siteControl.syncHistory = false;

	if (localStorage.getItem("siteControlsyncSettings") == "true")
		siteControl.syncSettings = true;
	else
		siteControl.syncSettings = false;

	// if (siteControl.syncHistory==true)
	// 	document.getElementById("syncHistory").checked=true;
	// if (siteControl.syncSettings==true)
	// 	document.getElementById("syncSettings").checked=true;

//	if (siteControl.audioTypeAllowed == null || siteControl.audioTypeAllowed == 1)
//		siteControl.audioTypeAllowed = "SynthOnly";

//	document.getElementById("voice" + siteControl.audioTypeAllowed).checked = true;

document.getElementById("fontnone").checked = true;

	//set RH 
	RH.ToDBDate = window.localStorage.getItem("RHToDBDate");


	//runcode for objects		
	util.setGreekLetter();
	window["BibleRef" + siteControl.activeWindow] = new BibleRef(siteControl.activeWindow);
//	window["VoiceControl" + siteControl.activeWindow] = new VoiceControl(siteControl.activeWindow);
	window["ScriptureWindow" + siteControl.activeWindow] = new ScriptureWindow(siteControl.activeWindow, true);
//	window["VoiceControl" + siteControl.activeWindow].voices = window.speechSynthesis.getVoices();


	// window["BibleRef" + siteControl.activeWindow2] = new BibleRef(siteControl.activeWindow2);
	// window["ScriptureWindow" + siteControl.activeWindow2] = new ScriptureWindow(siteControl.activeWindow2, true);

	// window["BibleRef2"] = new BibleRef(2);
	// window["ScriptureWindow2"] = new ScriptureWindow(2);


	window["BibleRef0"] = new BibleRef(0);
	window["ScriptureWindow0"] = new ScriptureWindow(0);
//	window["VoiceControl0"] = new VoiceControl(0);

//	VoiceControl0.voices = window.speechSynthesis.getVoices();

	//and load
	if (refList == "")
		RH.load2SW(siteControl.activeWindow, RH.CurNum);
	else { //has ref in params - open that
		document.getElementById("enterVerse1").value = refList;

		//version
		if (params.has("VERSION") == false && params.has("VER") == false && params.has("version") == false && params.has("ver") == false && params.has("Version") == false && params.has("Ver") == false)
			window["BibleRef1"].version = "WEB";
		else {
			if (params.has("VERSION") == true)
				version = params.get("VERSION");
			else if (params.has("VER") == true)
				version = params.get("VER");
			else if (params.has("version") == true)
				version = params.get("version");
			else if (params.has("ver") == true)
				version = params.get("ver");
			else if (params.has("Version") == true)
				version = params.get("Version");
			else if (params.has("Ver") == true)
				version = params.get("Ver");
			////console.log(version);

			i = util.getVersionrow(version);
			////console.log(i);
			if (i > -1)
				window["BibleRef1"].version = version;
			else
				window["BibleRef1"].version = "WEB";
		}
		if (params.has("topic") == true || params.has("Topic") == true || params.has("TOPIC") == true || params.has("top") == true || params.has("Top") == true || params.has("TOP") == true) {
			if (params.has("topic") == true) {
				document.getElementById("enterTopic1").innerHTML = params.get("topic");
				window["BibleRef1"].topic = params.get("topic");
			}
			if (params.has("top") == true) {
				document.getElementById("enterTopic1").innerHTML = params.get("top");
				window["BibleRef1"].topic = params.get("top");
			}
			else if (params.has("Topic") == true) {
				document.getElementById("enterTopic1").innerHTML = params.get("Topic");
				window["BibleRef1"].topic = params.get("Topic");
			}
			else if (params.has("Top") == true) {
				document.getElementById("enterTopic1").innerHTML = params.get("Top");
				window["BibleRef1"].topic = params.get("Top");
			}
			else if (params.has("TOPIC") == true) {
				document.getElementById("enterTopic1").innerHTML = params.get("TOPIC");
				window["BibleRef1"].topic = params.get("TOPIC");
			}
			else if (params.has("TOP") == true) {
				document.getElementById("enterTopic1").innerHTML = params.get("TOP");
				window["BibleRef1"].topic = params.get("TOP");
			}

		}
		window["BibleRef1"].parseRefEntered();
		////console.log(window.location.href);
		siteControl.paramsURL = window.location.search
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
	// window["VoiceControl" + siteControl.activeWindow].populateVoiceList()   //setTimeout( '',3000);
	// document.getElementById("voiceSelect" + siteControl.activeWindow).value = localStorage.getItem("speechVoice");
	// document.getElementById("audioPitch" + siteControl.activeWindow).value = localStorage.getItem("speechPitch");
	// document.getElementById("audioRate" + siteControl.activeWindow).value = localStorage.getItem("speechRate");

	//set devVer
	document.getElementById("devVersion").innerHTML = devVer;

	// let junction_font = new FontFace('Junction Regular', 'url(fonts/junction-regular.woff)');
	// var junction_font = new FontFace('Junction Regular', 'url(junction-regular.woff)', { style: 'normal', weight: 700 });

	// junction_font.load().then(function(loaded_face) {
	// 	// loaded_face holds the loaded FontFace
	// }).catch(function(error) {
	// 	// error occurred
	// });

});

wordboxdisplay =
{
	word: "",
	greek: "",
	phonetic: "",
	lemma: "",
	phoneticLem: "",
	parse: "",
	strongs: ""
};

Element.prototype.ownText = function () {
	return Array.from(this.childNodes)
		.reduce((acc, node) => acc + (node.nodeType === 3 ? node.textContent : ''), '')
		.trim();
}
//************************  utility functions
const util = {
	findRowIn2DArr: function (arrStr, ColID, matchValue, startIncr = 0) {
		// the parameter ColID is the column number itself or characters of the column name on row[0] of the arr
		//change the array String (arrStr) into an actual array
		let arr2 = window[arrStr];
		if (!Array.isArray(arr2)) {
			throw new Error('Invalid array name: ' + arrStr); // Throw an error if the provided array name is not valid
		}
		//get ColID as j
		j = util.getColNum(arrStr, ColID)

		for (let i = startIncr; i < arr2.length; i++) {
			if (arr2[i][j] == matchValue)
				return i;
		}
		return -1;
	},
	getColNum: function (arrStr, val) {
		if (isNaN(val) == false)
			return val;
		//not a number but Column name so read row 0 of the 2D array to find matching name and return the Column Number it is in
		let arr1 = window[arrStr[0]];
		if (!Array.isArray(arr1)) {
			throw new Error('Invalid array name: ' + arrStr); // Throw an error if the provided array name is not valid
		}

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] == val)
				return i;
		}
		return -1;
	},
	getEndBkwo: function (tblname, type, startAt) {
		let i = 0;
		let substrt = 0;
		let subend = 0;

		//ensure Book Table is loaded 
		if (typeof window[tblname] == "undefined") {
			console.log("Error -no loaded 2D Array of " + tblname);
			return;
		}

		if (type == "chapter") {
			substrt = 0;
			subend = 3;
		}
		else if (type == "verse") {
			substrt = 3;
			subend = 6;
		}
		else
			console.error("Error -invalid parameter of " + type);

		let typVal = "";
		typVal = window[tblname][startAt][0].substring(substrt, subend);

		for (i = startAt; i < window[tblname].length; i++)
			if (typVal != window[tblname][i][0].substring(substrt, subend))
				break;
		return i - 1;
	},
	setwordboxdisplay: function (swincr) {
		const win = window["ScriptureWindow" + swincr];
		//set to null first
		Object.keys(wordboxdisplay).forEach(key => {
			wordboxdisplay[key] = "";
		});

		if (win) {
			wordboxdisplay.greek = win.showGreekWord ? "" : "display:none";
			wordboxdisplay.phonetic = win.showPhonetic ? "display:none" : "display:none";
			wordboxdisplay.lemma = win.showLemma ? "" : "display:none";
			wordboxdisplay.phoneticLem = win.showPhoneticLem ? "" : "display:none";
			wordboxdisplay.parse = win.showParsing ? "" : "display:none";
			wordboxdisplay.strongs = win.showStrongs ? "" : "display:none";
		}
	},
	recursiveSearch: function (obj, searchKey, results = []) {
		const r = results;
		Object.keys(obj).forEach(key => {
			const value = obj[key];
			if (key === searchKey && typeof value !== 'object') {
				r.push(value);
			} else if (typeof value === 'object') {
				this.recursiveSearch(value, searchKey, r);
			}
		});
		return r;
	},
	refPadCount(bk, version = "WEB") {
		return 3;
	},
	padNum: function (number, length) {

		var str = '' + number;
		while (str.length < length) {
			str = '0' + str;
		}

		return str;

	},
	errmsg: function (elemnt, msg) {
		document.getElementById(elemnt).innerHTML = msg;
	},
	getVersionrow: function (ver) {
		var i = 0;
		for (i = 0; i < versionData.length; i++) {
			if (versionData[i][0] == ver)
				return Number(i);
		}
		return -1;
	},

	getMsgboxPlacement: function (x, y, container, msgWidth = 100, msgHeight = 30) {
		const rect = container.getBoundingClientRect();
		let left = x - container.offsetLeft;
		let top = y - container.offsetTop;

		// Adjust if overflow on the right
		if (left + msgWidth > rect.width) {
			left = rect.width - msgWidth - 10;
		}

		// Adjust if overflow on the bottom
		if (top + msgHeight > rect.height) {
			top = top - msgHeight - 10; // Place above click
		}

		// Ensure not off the left edge
		if (left < 0) left = 10;

		// Ensure not off the top edge
		if (top < 0) top = 10;

		return `${left}-${top}`;
	},

	openModalBox: function (p1, header, typ = "OK") {
		let BtnTitleTrue = "";
		if (typ.includes("/") == false) {
			document.getElementById("modalBoxFalseBtn").style.display = "none";
			BtnTitleTrue = typ;
		}
		else {
			document.getElementById("modalBoxFalseBtn").style.display = "inline";
			BtnTitleTrue = typ.substr(0, typ.indexOf("/"));
			document.getElementById("modalBoxFalseBtn").innerHTML = typ.substr(typ.indexOf("/") + 1);
		}
		document.getElementById("modalBoxTrueBtn").innerHTML = BtnTitleTrue;

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
	setGreekLetter: function () {
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
	removeGreekAccents: function (grk, removeText) {
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
	Greek2English: function (grk) {
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
	getGreekText: function (gTxt) {
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
	getBookSection: function (book) {
		if (book < 40)
			return "OT";
		if (book < 67)
			return "NT";
		return "AP";
	}
}

//BibleRef?  But would need a BibleRef0 not tied to any SW
function buildRefText(refList, bookNameRowIncre) {
	let refListArr = refList.split(";");
	let i = 0;
	//prime with first (maybe only) reference
	let refTextStr = buildSingleRefText(refListArr[0], bookNameRowIncre);
	//get all subsequent references
	for (i = 1; i < refListArr.length; i++)
		refTextStr = refTextStr + ";" + buildSingleRefText(refListArr[i], bookNameRowIncre);

	return refTextStr;
}

//BibleRef?  But would need a BibleRef0 not tied to any SW
function buildSingleRefText(refLst, bookNameRowIncre) {
	let i = 0;
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
		i = getTopVerse(BookNum, chap2);
		if (i == -1)
			console.error("Book:" + BookNum + " and Chapter:" + chap2 + " didn't match to bibleTopVerse table.");
		else if (vrs2 > Number(i))
			vrs2 = Number(i);
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
function get1stVerseInViewport(incre, version) {
	if (incre == 0)
		return;
	////console.log("In get1stVerseInViewport for " + version);
	let wordList = $('[id^="v' + version + '"]'); //an array of all verse id's in this book/version.

	if (wordList.length == 0) {//the Scripture div has no elements
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
			if (i < 0)
				return;
			Obj = document.getElementById(wordList[i].id.substr(1));
		}
	}
	//back verse up to while in viewport
	if (i == 0) { //if 0 then at first verse in wordList - FINAL Answer 
		Obj = document.getElementById(wordList[0].id.substr(1)); //now getting Word
	}
	else {
		for (k = 0; k < 20; k++) {//back verse up one
			if (i <= 0) { //if i is 0 or less then break out with i=0
				i = 0;
				break;
			}
			//backup to verse before last one
			i--;
			Obj = document.getElementById(wordList[i].id.substr(1)); //now getting Word**

			if (Obj.offsetTop < vpTop)  //not in viewport.  exit loop
				break;
		}
		if (i > 0) { //if not 0 then adjust one verses 
			i = i + 1;
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
function openTRBox(incre) {
	////console.log("openTRBox with incre of " + incre);
	let tp = document.getElementById("enterTopic" + incre).innerHTML;
	let vr = document.getElementById("enterVerse" + incre).value;
	// let RHNum=window["BibleRef" + incre].RHNum;
	////console.log("tp is " + tp); 

	//show html msgbox
	document.getElementById("TRBox").style.display = "block";

	//get current values so -can check if changed- or -use-, when in close TRBox
	document.getElementById("TRInitialTopic").innerHTML = tp;
	document.getElementById("TRInitialVerse").innerHTML = vr;
	document.getElementById("TRBoxHiddenIncre").innerHTML = incre;
	// if (RHNum.length==3)
	// 	document.getElementById("TRBoxRHId").innerHTML="RH" + RHNum;

	//show blocking background
	document.getElementById("modalbackground").style.display = "block";
	//get SW enterVerse(s)
	document.getElementById("TRenterVerse").value = vr;

	if (tp == 0) { //no topic (means a new reference) - so hide TR enterVerse, show Explain, change Title.
		document.getElementById("TRref").style.display = "none";
		document.getElementById("TRexplain").style.display = "block";
		document.getElementById("TRBoxHeader").innerHTML = "Add Topic? (For multiple Ref entries)"
	}
	else { //has a topic - so open for editing Topic/Verse list 
		document.getElementById("TRref").style.display = "block";
		document.getElementById("TRenterTopic").value = tp;
		document.getElementById("TRexplain").style.display = "none";
		document.getElementById("TRBoxHeader").innerHTML = "Edit Topic/Reference";
	}
	//stop infinte loop - take focus off the enterTopic which calls this on getting focus and would get it back upon closing.	
	document.getElementById("TRenterTopic").focus();
}
//SW or br
function closeTRBox() {
	let i = 0;
	//get values for Increment, Topic and Verse
	let incre = document.getElementById("TRBoxHiddenIncre").innerHTML;
	incre = Number(incre);
	let tp = document.getElementById("TRenterTopic").value;
	let tpWas = document.getElementById("TRInitialTopic").innerHTML;
	let vr = document.getElementById("TRenterVerse").value;
	let vrWas = document.getElementById("TRInitialVerse").innerHTML;
	let br = window["BibleRef" + incre];

	//update changes to topic and verse
	//topic
	if (tpWas != tp) { //topic was changed so...
		//change br.topic
		if (tp.length > 1) {
			//ensure topic name NOT already used:
			i = RH.findRow(RH.iTopic, tp)
			if (i == -1) {//row not found- is new topic name	
				br.topic = tp;
				if (tpWas != "0") //not new so update History Button also
					if (document.getElementById("RH" + br.RHNum) != null) //ensure History button exists
					{
						document.getElementById("RH" + br.RHNum).innerHTML = tp;
					}

			}
			else {
				util.openModalBox("This topic name is already used. Either a new topic name or a deletion of the current topic in history is needed.", "Topic Name Already Exists");
				return;
			}
		}
		else  //topic was removed or not intially added
			window["BibleRef" + incre].topic = "";

		//change HTML
		document.getElementById("enterTopic" + incre).innerHTML = document.getElementById("TRenterTopic").value;
	}

	//hide box and blocking background (before the verse may run through again)
	document.getElementById('modalbackground').style.display = 'none';
	document.getElementById('TRBox').style.display = 'none';

	//verse
	if (vr != vrWas) {//need to parse new verses through the br.parseRefEntered
		document.getElementById("enterVerse" + incre).value = vr;
		window["BibleRef" + incre].parseRefEntered();
	}
	else if (tpWas == "0") { //new topic on new reference so continue loading...
		RH.addToRH(incre);
		uncoverGodsWord.processScriptureData(incre, false);
	}

	//clear TRBox Variables before next use
	document.getElementById("TRBoxHiddenIncre").innerHTML = "";
	document.getElementById("TRenterTopic").value = "";
	document.getElementById("TRInitialTopic").innerHTML = "";
	document.getElementById("TRenterVerse").value = "";
	document.getElementById("TRInitialVerse").innerHTML = "";
	//	document.getElementById("TRBoxRHId").innerHTML="";
}
//SW or br
function closeTopic(incre) {
	//load last non-topic reference
	let i = RH.findRow(RH.iTopic, "");
	if (i > -1)
		RH.load2SW(incre, RH.Arr[i][RH.iRHId]);
	else
		window["ScriptureWindow" + incre].showSWReference();
}

//uncoverGodsWord
function displayVerses(version, reftype, ref, title,) {

	//set BibleRef0 values
	BibleRef0.version = version;
	if (reftype == "plaintext") {
		document.getElementById("enterVerse0").value = ref;
		BibleRef0.parseRefEntered();
	}
	else {
		BibleRef0.bookNum = ref.substr(0, 2);
		BibleRef0.bookNam = bibleBookData[Number(BibleRef0.bookNum)][8];
		BibleRef0.refList = ref;
		BibleRef0.refText = buildSingleRefText(ref, 1);
	}
	////console.log(BibleRef0.refText);

	//set uncoverGodsWord values
	uncoverGodsWord.resetEnterVerse = false;
	uncoverGodsWord.incre = 0;
	uncoverGodsWord.br = BibleRef0;
	uncoverGodsWord.refCount = 1;
	uncoverGodsWord.refIncre = 0;
	//	hasTopic:false,
	uncoverGodsWord.refListArr = uncoverGodsWord.removeVersionFromRefList(uncoverGodsWord.br.refList.split(";"));
	//	uncoverGodsWord.refVersionArr=uncoverGodsWord.getVersionFromRefList(uncoverGodsWord.br.refList.split(";"),uncoverGodsWord.br.version);
	uncoverGodsWord.refVersionArr = uncoverGodsWord.br.versionArray;
	uncoverGodsWord.refTextArr = BibleRef0.refText.split(";");
	uncoverGodsWord.version = version;
	uncoverGodsWord.versionCount = 1;

	//call displayScriptures 
	console.log("In displayVerses for ref of " + BibleRef0.refEntered);
	showScripture0(title);
}
function showScripture0(title) {
	// document.getElementById("Scripture0").innerHTML="";
	// uncoverGodsWord.processScriptureData(0,false);
	//	document.getElementById("ScriptureHeader0").innerHTML=title;
	//TempZ	document.getElementById("ScriptureHeader0").innerHTML=title + "   <span class='title0'>" + BibleRef0.refText + "<span class='msgboxClose'><i onclick='document.getElementById(\"ScriptureDiv0\").style.display=\"none\";document.getElementById(\"msgboxbackground\").style.display=\"none\"' class='fa fa-close' title='Close'>&nbsp;</i></span></span>";
	//	document.getElementById("ScriptureHeader0").innerHTML=title + "   <span class='title0'>" + BibleRef0.refText + "</span>";
	document.getElementById("ScriptureDiv0").style.display = "block";
	document.getElementById("ScriptureDiv0").style.top = "2rem";
	document.getElementById("ScriptureDiv0").style.left = "2rem";
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
function gotoElement(element, stopIfMessageBackground, SWIncre = -1) {

	if (SWIncre > -1)
		element = element + SWIncre;

	if (stopIfMessageBackground == true && window.getComputedStyle(document.getElementById("msgboxbackground")).display === 'block')
		return;
	else
		document.getElementById(element).focus();
}



//*******************************listeners events   ******************************************
//placed at the bottom of html file so that Firefox works.

// from html

document.getElementById('displayVerseNewLine1').addEventListener('change', function (e) {
	// Toggle class on container based on checkbox state
	const container = document.getElementById('Scripture1');
	if (e.target.checked) {
		container.classList.add('newlines-on');
	} else {
		container.classList.remove('newlines-on');
	}
});
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

// Attach one listener high up — but only to the Scripture container(s)
document.querySelectorAll('.Scripture').forEach(scriptureContainer => {
	scriptureContainer.addEventListener('click', e => {
		const wB = e.target.parentElement;
		const incre = wB.id.substring(wB.id.indexOf("-") + 1, wB.id.indexOf("~"));
		let pos = "x-y";


		//alert(e.target.className + " in the wordBox with an id of " + e.target.parentElement.id);
		if (e.target.matches('.parse')) {
			document.getElementById('contextMenuTitle').innerHTML = "Parsing";
			document.getElementById('contextMenuMain').innerHTML = getParseCode(e.target.textContent);
			document.getElementById('contextMenuFooter').innerHTML = e.target.textContent;
			document.getElementById('contextMenu').style.fontSize = `${siteControl.fontSize}px`;
			document.getElementById('contextMenu').style.left = `-500px`;
			document.getElementById('contextMenu').style.top = `-500px`;
			document.getElementById('contextMenu').style.display = 'inline-block';
			console.log('CM Width:', document.getElementById('contextMenu').offsetWidth, 'Height:', document.getElementById('contextMenu').offsetHeight);
			console.log('SW Width:', document.getElementById('Scripture' + incre).offsetWidth, 'Height:', document.getElementById('Scripture' + incre).offsetHeight);
			pos = util.getMsgboxPlacement(e.clientX, e.clientY, document.getElementById("Scripture" + incre), document.getElementById('contextMenu').offsetWidth, document.getElementById('contextMenu').offsetHeight);
			let [x, y] = pos.split('-');
			document.getElementById('contextMenu').style.left = `${x}px`;
			document.getElementById('contextMenu').style.top = `${y}px`;
		}
		else if (e.target.matches('.lemma') || e.target.matches('.strongs')) // || e.target.matches('.phoneticLem')
			getWordData(wB.querySelector('.word').ownText(), "", "English", wB.querySelector('.lemma').textContent);

		// // direct parent = wordBox (as per your structure)
		// const wordBox = e.target.parentElement;

		// // minimal sanity check (optional but cheap)
		// if (!wordBox?.classList?.contains('wordBox')) return;

		// const boxId = wordBox.id;
		// const lemmaText = e.target.textContent.trim();

		// console.log(`"${lemmaText}" clicked → ${boxId}`);

		// ── your real action here ──
		// e.g. highlightWordBox(wordBox);
		// showLemmaInfo(lemmaText, boxId);
	});
});

$("#contextMenuMain").click(function (event) {
	gotoTitle(event, 1);
});



$('#searchEntry').keyup(function () {
	if (siteControl.activeWindowLanguage == "Greek")
		document.getElementById('searchEntry').value = util.English2Greek(document.getElementById('searchEntry').value);
	if (event.keyCode == 13)
		$("#searchEntry").blur();
});



function setAccordionClickListener() {
	////console.log("In setAccordionClickListener");
	var acc = document.getElementsByClassName("accordion");
	var accSub = document.getElementsByClassName("subaccordion");
	//!!!! need code to not do Forum accordion.
	//var ID="";
	var i;
	for (i = 0; i < acc.length; i++) {
		//ID=acc[i].getAttribute('id');
		////console.log ("AccordionID is " + ID);
		if (acc[i].hasAttribute('id') == false) {
			acc[i].addEventListener("click", function () {
				this.classList.toggle("active");
				var panel = this.nextElementSibling;
				if (panel.style.maxHeight) {
					panel.style.maxHeight = null;
				} else {
					panel.style.maxHeight = (panel.scrollHeight + 9900) + "px";
				}
			});
		}
	}

	for (i = 0; i < accSub.length; i++) {
		accSub[i].addEventListener("click", function () {
			this.classList.toggle("active");
			var panel = this.nextElementSibling;
			if (panel.style.maxHeight) {
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
		document.getElementById('SiteHeading').scrollIntoView({ block: 'start', behavior: 'smooth' });
	//setTimeout("document.getElementById('SiteHeading').scrollIntoView({ block: 'start',  behavior: '" + behaveMode + "' });", 200);
	else
		document.getElementById('SiteHeading').scrollIntoView({ block: 'start', behavior: 'auto' });
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



function getParseCode(cde) {
	let rowNum = util.findRowIn2DArr("parseCode", 0, cde);
	if (rowNum == -1) {
		let cde2 = cde.substring(0, cde.lastIndexOf("-"));
		console.log("cde2:" + cde2);
		rowNum = util.findRowIn2DArr("parseCode", 0, cde2);
		if (rowNum == -1)
			return "Could Not find " + cde;
		else
			return "Could Not find " + cde + "<br>" + cde2 + " is: " + parseCode[rowNum][1];
	}
	return parseCode[rowNum][1].replaceAll(";", ";<br>");
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
		secID = secID.replaceAll(" ", "");
		document.getElementById(secID).scrollIntoView(true);
		//update ScrollToId  remove first four characters of ???
		window["BibleRef" + incre].ScrollToId = secID.substring(4);
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

//util
function getColumnIncre(arr, val) {
	var i = 0;
	for (i = 0; i < arr.length; i++) {
		if (arr[i] == val)
			return i;
	}
	return 99;
}

//uGW
function displaySectionTitles(bookNum, bookNam, version, incre, startAt, endAt, sendTo) {
	let i = 1;
	let j = 1;
	let k = 1;
	let colIncre = 4;
	let colIncreCrossRef = 5;
	let foundTitle = false;
	let startChap = 999;
	let endChap = 999;
	let startVrs = 999;
	let endVrs = 999;
	let sectionVersion = "";
	let refCVWIncre = 3;// util.refPadCount(bookNum);
	let idIncre = incre;
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
		if (util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) >= util.padNum(endChap, refCVWIncre) + util.padNum(endVrs, refCVWIncre))
			break;
		i++;
		if (i >= sectionTitles.length)
			break;
	}
	var rowEndIncre = i--;

	var divT, parentObj, insertB4Obj, titleLine;
	var crssRef = ""; //this is used to hold a crossReference IF is it exists
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
			idIncre = incre + "msg";
		}
		else
			divT = document.createElement("p");
		divT.setAttribute("class", "secTitle");
		divT.setAttribute("data-otype", "section title");

		if (sendTo == "msgbox") {
			divT.setAttribute("id", "CMt" + sectionVersion + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre) + "-" + incre);
			divT.setAttribute("style", "display:block");
			titleLine = document.createTextNode(sectionTitles[i][colIncre]);
			divT.appendChild(titleLine);
			parentObj.appendChild(divT);
		}
		else {
			//set to empty and add the asterisK if a new paragraph break is created.
			asterisk = "";

			divT.setAttribute("id", "t" + sectionVersion + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre) + "-" + idIncre);
			if (window["ScriptureWindow" + incre].showSectionTitles == false)
				divT.setAttribute("style", "display:none");
			else
				divT.setAttribute("style", "display:block");

			//try to set to paragraph
			insertB4Obj = document.getElementById("p" + version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre) + "-" + incre);
			//try to set to poetry line
			if (typeof (insertB4Obj) == 'undefined' || insertB4Obj == null) { //no paragraph so set to poetry line	
				if (typeof window["poet" + bookNam + version] != "undefined") {
					//	////console.log  ("poetry name: " + "q" + version + util.padNum(sectionTitles[i][0],refCVWIncre) + util.padNum(sectionTitles[i][1],refCVWIncre) + util.padNum(sectionTitles[i][2],refCVWIncre) + util.padNum(sectionTitles[i][3],refCVWIncre));
					insertB4Obj = document.getElementById("q" + version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre) + "-" + incre);
				}
			}
			//try to set to verse
			if (typeof (insertB4Obj) == 'undefined' || insertB4Obj == null) { //no paragraph so set to verse	
				//	////console.log  ("verse name: " + "v" + version + util.padNum(sectionTitles[i][0],refCVWIncre) + util.padNum(sectionTitles[i][1],refCVWIncre) + util.padNum(sectionTitles[i][2],refCVWIncre) + util.padNum(sectionTitles[i][3],refCVWIncre));
				insertB4Obj = document.getElementById("v" + version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(sectionTitles[i][3], refCVWIncre) + "-" + incre);
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
					insertB4Obj = document.getElementById(version + util.padNum(sectionTitles[i][0], refCVWIncre) + util.padNum(sectionTitles[i][1], refCVWIncre) + util.padNum(sectionTitles[i][2], refCVWIncre) + util.padNum(j, refCVWIncre) + "-" + incre);

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
				if (sectionTitles[i][colIncreCrossRef].length == 0)  //Check if there is a cross reference or not
					divT.innerHTML = sectionTitles[i][colIncre] + asterisk;
				else //Show Title Cross Reference with open link. Need to open ScriptureDiv0 as a msgbox window. Must ensure Scripture Data is loaded.
					divT.innerHTML = sectionTitles[i][colIncre] + asterisk + "<small> <small onclick=\"doSectionTitleCR(\'" + version + "\',\'" + sectionTitles[i][colIncreCrossRef] + "')\">(" + sectionTitles[i][colIncreCrossRef] + ")</small></small>";
				//divT.innerHTML = sectionTitles[i][colIncre] + asterisk  + "<small> <small onclick=\"document.getElementById(\'VerBtn0\').innerHTML  =\'" + version + "\'; document.getElementById(\'enterVerse0\').innerHTML  =\'" + sectionTitles[i][colIncreCrossRef] + "\'; BibleRef0.parseRefEntered();showScripture0(\' \');\">(" + sectionTitles[i][colIncreCrossRef] + ")</small></small>";
				// spanT.setAttribute("onclick", "uncoveringGodsWorD.processScriptureDatA(0,false);");

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

function doSectionTitleCR(ver, ref) {
	document.getElementById('VerBtn0').innerHTML = ver;
	document.getElementById('enterVerse0').innerHTML = ref;
	BibleRef0.refEntered = ref;
	BibleRef0.version = ver;
	BibleRef0.parseRefEntered();
	console.log("In doSectionTitleCR for ref of " + BibleRef0.refEntered);
	showScripture0(ref);
}

function getRefCVW(refList, version = "WEB", startOnly = true, includeBook = false) {
	let i = 0;
	let nine = "9";
	let zero = "0";
	let bookNum = refList.substring(0, 2);
	let bookNumStr = "";
	if (includeBook == true)
		bookNumStr = bookNum;
	let refLength = 3; //util.refPadCount(Number(bookNum), version);
	let allZeroes = zero.repeat(refLength);
	let theVerse = allZeroes;

	//check if it has a start and ending chapter and/or verse		
	if (refList.includes("-")) {
		var refp = refList.split("-");
		theVerse = refp[0].substr(8 - refLength, refLength);  //new var theVerse
		if (theVerse == allZeroes)   //added
			theVerse = util.padNum(1, refLength);   //added
		startAt = refp[0].substr(5 - refLength, refLength) + theVerse + util.padNum(1, refLength); //replaced with theVerse
		if (refp[1].substr(8 - refLength, refLength) == util.padNum(0, refLength))
			endAt = refp[1].substr(5 - refLength, refLength) + nine.repeat(refLength * 2) // util.padNum(9,refLength*2);
		else
			endAt = refp[1].substr(5 - refLength, refLength) + refp[1].substr(8 - refLength, refLength) + nine.repeat(refLength);
	}
	else {
		if (bookNum == 19) {
			//Can't change 000 verse to 001 for psalms because of verse 0 used in Sept?
			theVerse = refList.substr(5, 3);
			if (theVerse == "000")
				theVerse = "001";
			startAt = refList.substr(2, 3) + theVerse + "001";
			if (refList.substr(5, 3) == "000")
				endAt = refList.substr(2, 3) + "999999";
			else
				endAt = refList.substr(2, 3) + refList.substr(5, 3) + "999";
		}
		else {
			theVerse = refList.substr(6, 2);
			if (theVerse == "00")
				theVerse = "01";
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
	if (startOnly) {
		//replace all zeroes with 01 or 001
		//for (i=1;i<3;i++)
		if (startAt.substr(0 * refLength, refLength) === allZeroes)
			startAt = util.padNum(1, refLength) + startAt.substr(refLength);
		if (startAt.substr(1 * refLength, refLength) === allZeroes)
			startAt = startAt.substr(0, refLength) + util.padNum(1, refLength) + startAt.substr(2 * refLength);
		if (startAt.substr(2 * refLength, refLength) === allZeroes)
			startAt = startAt.substr(0, 2 * refLength) + util.padNum(1, refLength);

		// 	startAt= util.padNum(1, refLength) + startAt.substr(refLength)	
		return bookNumStr + startAt;
	}
	else
		return bookNumStr + startAt + "-" + bookNumStr + endAt;
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
function devTest() {
	////console.log("tesBA");
	let test1 = ["1", "testing1", 181, 1.4, ["0.4", "testingAsSub", 8504, 7.7]];
	let test2 = ["2", "testing2", 282, 2.6, "testingAsItem"];
	////console.log ("test1:" + test1 + "   test2:"+test2);
	////console.log("stringify test1:" + JSON.stringify(test1));
	////console.log("stringify test2:" + JSON.stringify(test2));
	//call PHP with an array 
	$.post("devtest.php", {
		test1: JSON.stringify(test1),
		test2: JSON.stringify(test2)
	},
		function (result) {
			////console.log("before result");
			//console.log("Result:" + result);
			////console.log("after result");

		}
	);

}


