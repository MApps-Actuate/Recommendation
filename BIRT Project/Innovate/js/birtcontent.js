/* *********************************************************
 * URL sample : <pageName>?[acType=]&[acDisplay=]&[acName=]&[acStyle=]                       
 *                                                                 
 * acType : dashboard                     
 *          viewer
 *          parameter (viewer with param)
 *           
 * acDisplay1 : none
 *              toolbar
 *              notoolbar
 *                           
 * acDisplay2 : navbar (tabs)
 *              nonavbar (no tabs)
 *              none (for viewer no space on top)
 *              default (for viewer default space on top)
 *                          
 * acName : file name
 *                                                
 * acStyle : none/name of style to apply
 *   -> dashboardStyle1 : embed dashboard, menu with "add dashboard/lock dashboard"
 *   -> dashboardStyle2 : embed dashboard
 *   -> dashboardStyle3 : embed dashboard, menu with "add gadget/lock dashboard"
 *   -> dashboardStyle4 : embed dashboard, menu with "edit dashboard/lock dashboard"
 * **********************************************************
 * URL parsing
 */
var host = location.host;
var parameters = location.pathname.split("/");
var appName = parameters[3].split('%20').join(' ');
var pageName = parameters[4];
/*
 * Set User name
 */
var actUserName = sessionStorage.actUserName;
$("#user-name").text(actUserName.substr(0,1).toUpperCase() + actUserName.substr(1,100).toLowerCase());
/*
 * Default Page
 */
if(pageName == "" || location.search.substring(1) == "" || location.search.substring(1).indexOf("acType") == -1 ) {
	var acType = defaultAcType;
	var acDisplay1 = defaultAcDisplay1;
	var acDisplay2 = defaultAcDisplay2;
	var acName = defaultAcName;
	var acStyle = defaultAcStyle;
} else {
/*
 * Other Page
 */	
 	parameters = location.search.substring(1).split("&");
	var temp = parameters[0].split("=");
	var acType = temp[1];
	temp = parameters[1].split("=");
	var acDisplay1 = temp[1];
	temp = parameters[2].split("=");
	var acDisplay2 = temp[1];
	temp = parameters[3].split("=");
	var acName = decodeURI(temp[1]);
	temp = parameters[4].split("=");
	var acStyle = temp[1];
};
/*
 * Use personnal report/dashboard/cross tab
 */
if (acName.substr(0,2) == "my") {
	var fileName = "/Applications/" + appName  + "/Home/" + acName
} else if (acName.substr(acName.length-10,acName.length) == ".dashboard") {
	var fileName = "/Applications/" + appName  + "/Dashboards/" + acName
} else {
	var fileName = "/Applications/" + appName  + "/Report Designs/" + acName                  
};
/*
 * Page size
 */
var wWidth = window.innerWidth - 70;
var wHeight = window.innerHeight - 60;
if (window.innerWidth > 1680) {
	var leftPadding = Math.round((window.innerWidth - 1680)/2);
	leftPadding = (leftPadding < 20 ? 20 : leftPadding);
} else {
	var leftPadding = 20;
};

/*
 * Initialize JSAPI
 */
if(acType == "viewer" || acType == "dashboard") {
	actuate.load(acType);
	var reqOps = new actuate.RequestOptions( );
	reqOps.setRepositoryType('Enterprise');
	reqOps.setVolume(acVolume);
	reqOps.setCustomParameters({});
	actuate.initialize( 'http://' + host + '/iportal/',reqOps==undefined?null:reqOps, null, null, myInit );	
	
} else if (acType == "parameter") {
	actuate.load(acType);
	actuate.load("viewer");	
	var reqOps = new actuate.RequestOptions( );
	reqOps.setRepositoryType('Enterprise');
	reqOps.setVolume(acVolume);
	reqOps.setCustomParameters({});
	actuate.initialize( 'http://' + host + '/iportal/',reqOps==undefined?null:reqOps, null, null, displayParams );	
	
} else if (acType == "iframe") {	
	myInit();
};

function displayParams() {
	$("#contentSection").css("padding-left", leftPadding + "px");	
	$("#acParamSection").toggleClass("isNotVisible");
	param = new actuate.Parameter( 'acParameter' );
	param.setReportName(fileName);
	param.submit();
	myStyle();	
};

function processParameters( ) {
	param.downloadParameterValues(myInit);
};

function myInit(paramValues){
// report	
	if(acType == "viewer" || acType == "parameter") {
		$("#contentSection").css("padding-left", leftPadding + "px");
		
		viewer = new actuate.Viewer( 'acContainer' );
		viewer.setReportDesign(fileName);
		var options = new actuate.viewer.UIOptions( );
		if (acDisplay1 == "notoolbar") {
			options.enableToolBar(false);
		} else {
			options.enableToolBar(true);
		}
		if (acDisplay2 == "none") {
			viewer.setContentMargin(0);			
		}
		if (acType == "parameter") {
			viewer.setParameterValues(paramValues);
		};
		
		viewer.setSize(wWidth - 50 - leftPadding, wHeight - 5)
	    viewer.setUIOptions( options );
		viewer.submit();
// dashboard
	} else if (acType == "dashboard") {
		viewer = new actuate.Dashboard( 'acContainer' );
		viewer.setDashboardName(fileName);	
		if (acDisplay1 == "none") {
			viewer.setIsDesigner(false);
		} else if (acDisplay1 == "notoolbar") {
			viewer.setIsDesigner(true);
			viewer.showToolbar(false);
		} else {
			viewer.setIsDesigner(true);			
			viewer.showToolbar(true);
		}
		if (acDisplay2 == "nonavbar") {
			viewer.showTabNavigation(false);
		} else {
			viewer.showTabNavigation(true);
		}

		viewer.setSize(wWidth - 50, wHeight - 5)		
		viewer.submit();
// iframe		
	} else if (acType == "iframe") {
		if (acName.substr(acName.length-10,acName.length) == ".dashboard") {
			$("#top-menu").toggleClass("isNotVisible");
			$("#menu-embed-dashboard").toggleClass("isNotVisible");			
			var myObj = '<iframe src="../../dashboard?__design=' + fileName + '&__launchDesigner=true&usePersonalDashboard=false&__vp=' + acVolume + '&volume=' + acVolume + '&showBanner=false"'
		} else if (acName.substr(acName.length-9,acName.length) == ".cubeview") {
			$("#top-menu").toggleClass("isNotVisible");
			$("#menu-embed-ct").toggleClass("isNotVisible");						
			var myObj = '<iframe src="../../da?__report=' + fileName +  '&__vp=' + acVolume + '&volume=' + acVolume + '" ';	
		} else {		
			$("#top-menu").toggleClass("isNotVisible");
			$("#menu-embed-report").toggleClass("isNotVisible");						
			var myObj = '<iframe src="../../wr?__report=' + fileName + '&__vp=' + acVolume + '&volume=' + acVolume + '&showBanner=false"';
		}	
		
		myObj += ' width="100%" height="' + ($(window).height() - 125) + 'px" style="border-width:0px"/>';
		$("#acContainer").append(myObj);
		
		// Remove the navbar with the OT logo on report studio
		var $iframe = $('iframe'); 
		$iframe.load(function(){       
			if (acName.substr(acName.length-10,acName.length) == ".rptdesign") {
				var $navbar = $iframe.contents().find('.navbar'); 
				$navbar.remove();
			};
		});		
	}
	
// For parameter Custom style already applied	
	if (acType != "parameter") { 
			myStyle();
	}
}

function myStyle() {
/*	
 * Add custom CSS to override default iHub CSS 
 */
	if(acType == "viewer") {
		$('head').append('<link rel="stylesheet" type="text/css" href="css/birtcontent-viewer.css">');

	} else if (acType == "dashboard") {
		$('head').append('<link rel="stylesheet" type="text/css" href="css/birtcontent-dashboard.css">');
		$('head').append('<link id="css-dashboard-plus" rel="stylesheet" type="text/css" href="css/birtcontent-dashboard-plus.css">');
	} else if (acType == "parameter") {
		$('head').append('<link rel="stylesheet" type="text/css" href="css/birtcontent-param.css">');

	} else if (acType == "iframe") {	

	}
/*
 * Add specific style/behaviour  
 */
	if (acStyle == "dashboardStyle1") {
		// Show add dashboard button
		$("#top-menu").toggleClass("isNotVisible");
		$("#menu-add-dashboard").toggleClass("isNotVisible");
		
	} else if (acStyle == "dashboardStyle3") {
		// Show add gadget button
		$("#top-menu").toggleClass("isNotVisible");
		$("#menu-add-gadget").toggleClass("isNotVisible");
		
	} else if (acStyle == "dashboardStyle4") {
		// Show edit dashboard button
		$("#top-menu").toggleClass("isNotVisible");
		$("#menu-edit-dashboard").toggleClass("isNotVisible");

	} else if (acStyle == "customToolbar") {
		$("#acCustomToolbarSection").toggleClass("isNotVisible");
		$("#top-menu").toggleClass("isNotVisible");
		$("#menu-export-xls").toggleClass("isNotVisible");
		$("#menu-export-pdf").toggleClass("isNotVisible");
		$("#acContainer").css("background","white");
		$("#acContainer").css("border", "1px solid #dddddd");
		
	} else if (acStyle == "viewerBorder") {
		$("#acContainer").css("background","white");
		$("#acContainer").css("border", "1px solid #dddddd");
	};
};
/* 
 * *****************************************************************************************************
 * ***                       M E N U   B U T T O N
 * *****************************************************************************************************
 * Add dashboard from gallery
 */
$('#menu-add-dashboard').click(function(e) {
	$('#menu-add-dashboard').toggleClass("isNotVisible");
	$('#menu-lock-dashboard').toggleClass("isNotVisible");

	// Replace the "+" to add an existing dashboard
	if ($("#menu-plus").length==0) {
		// add a fake plus button
		$( '<li id="menu-plus" class="actuate-dashboard-tab-panel-tool actuate-dashboard-tab-panel-tool-plus-bis"></li>').insertAfter( ".actuate-dashboard-tab-panel-tool-plus" );
		$('#menu-plus').bind("click", function(e) {
			$('.icon-ygg-dash-gallery').click();
		});		
	};
	$("#menu-plus").css("display","block");
		
	viewer.showTabNavigation(true);
	$('.actuate-dashboard-gadget-tab-content').css("border-top: 1px solid #e1e1e1 !important");		
});
/*
* Add gadget from gallery
*/
$('#menu-add-gadget').click(function(e) {
	$('#menu-add-gadget').toggleClass("isNotVisible");
	$('#menu-lock-dashboard').toggleClass("isNotVisible");

	// Replace the "+" to add an existing gadget
	if ($("#menu-plus").length==0) {
		// add a fake plus button
		$( '<li id="menu-plus" class="actuate-dashboard-tab-panel-tool actuate-dashboard-tab-panel-tool-plus-bis"></li>').insertAfter( ".actuate-dashboard-tab-panel-tool-plus" );
		$('#menu-plus').bind("click", function(e) {
			$('.icon-ygg-gadget-gallery').click();
		});		
	};
	$("#menu-plus").css("display","block");
	
	viewer.showTabNavigation(true);
	$('.actuate-dashboard-gadget-tab-content').css("border-top: 1px solid #e1e1e1 !important");		
});
/*
* Edit dashboard gadget from gallery
*/
$('#menu-edit-dashboard').click(function(e) {
	$('#menu-edit-dashboard').toggleClass("isNotVisible");
	$('#menu-lock-dashboard').toggleClass("isNotVisible");
	viewer.showTabNavigation(true);
	viewer.showToolbar(true);
	$("#css-dashboard-plus").attr("href","");
	$(".actuate-dashboard-tab-panel-tool-plus").css("display","block")
	$('.actuate-dashboard-gadget-tab-content').css("border-top: 1px solid #e1e1e1 !important");		
})
/*
 * Hide dashboard
 */
$('#menu-lock-dashboard').click(function(e) {
	if (acStyle=="dashboardStyle1") {
		$('#menu-add-dashboard').toggleClass("isNotVisible");
	} else if (acStyle=="dashboardStyle3") {
		$('#menu-add-gadget').toggleClass("isNotVisible");
	} else if (acStyle=="dashboardStyle4") {
		$('#menu-edit-dashboard').toggleClass("isNotVisible");
		$("#css-dashboard-plus").attr("href","css/birtcontent-dashboard-plus.css");
		$(".actuate-dashboard-tab-panel-tool-plus").css("display","none")
	} 
	$('#menu-lock-dashboard').toggleClass("isNotVisible");
	$("#menu-plus").css("display","none");
	if (acDisplay2 == "nonavbar") {
		viewer.showTabNavigation(false);
	} else {
		viewer.showTabNavigation(true);
	};	
	viewer.showToolbar(false)
	$('.actuate-dashboard-gadget-tab-content').css("border-top: 0px solid #e1e1e1 !important");		
});

/*
 * Launch BDA
 */
$(".launch_BDA").click(function(e) {
	child = window.open("../../launchBDA.jsp?user=" + BDAuser + "&repository=initial_fastdb&target=magellan", "_blank", "toolbar=no,scrollbars=yes,resizable=yes,top=25,left=200,width=1200,height=800");
});
/*
 * Logout
 */
$(".logout").click(function(e) {
	actuate.logout('../../../iportal', null, window.location.assign(location.origin + "/iportal") , null);		
});
/*
 * Hide parameter
 */
function paramHideShow() {
	$("#panelDivSection").toggleClass("hidden");
	
	if ($("#panelDivSection").hasClass("hidden")) {
		$("#panelDivSection").slideUp();
	} else {
		$("#panelDivSection").slideDown();		
	};
};
/*
 * Designers
 */
$("#myReportDesignerLink").click(function(e) {
	myLink = "main.html?acType=iframe&acDisplay1=none&acDisplay2=none&acName=myReport.rptdesign&acStyle=none"
	window.location.assign(myLink);
});
$("#myCrosstabDesignerLink").click(function(e) {
	myLink = "main.html?acType=iframe&acDisplay1=none&acDisplay2=none&acName=myCT.cubeview&acStyle=none"
	window.location.assign(myLink);	
});
$("#myDashboardDesignerLink").click(function(e) {
	myLink = "main.html?acType=iframe&acDisplay1=none&acDisplay2=none&acName=myDashboard.dashboard&acStyle=none"
	window.location.assign(myLink);	
});
/*
 * My report / My CT / My Dashboard
 */	
$("#myReportLink").click(function(e) {
	myLink = "main.html?acType=viewer&acDisplay1=notoolbar&acDisplay2=none&acName=myReport.rptdesign&acStyle=none"
	window.location.assign(myLink);	
});
$("#myCrosstabLink").click(function(e) {
	myLink = "main.html?acType=viewer&acDisplay1=notoolbar&acDisplay2=none&acName=myCT.rptdesign&acStyle=none"
	window.location.assign(myLink);	
});
$("#myDashboardLink").click(function(e) {
	myLink = "main.html?acType=dashboard&acDisplay1=none&acDisplay2=navbar&acName=myDashboard.dashboard&acStyle=none"
	window.location.assign(myLink);	
});
$("#menu-embed-report").click(function(e) {
	myLink = "main.html?acType=viewer&acDisplay1=notoolbar&acDisplay2=none&acName=myReport.rptdesign&acStyle=none"
	window.location.assign(myLink);	
});
$("#menu-embed-ct").click(function(e) {
	myLink = "main.html?acType=viewer&acDisplay1=notoolbar&acDisplay2=none&acName=myCT.rptdesign&acStyle=none"
	window.location.assign(myLink);	
});
$("#menu-embed-dashboard").click(function(e) {
	myLink = "main.html?acType=dashboard&acDisplay1=none&acDisplay2=navbar&acName=myDashboard.dashboard&acStyle=none"
	window.location.assign(myLink);	
});
/*
 * Export PDF / XLS
 */
$("#menu-export-pdf").click(function(e) {
	doAction('PDF')
});
$("#menu-export-xls").click(function(e) {
	doAction('XLS')
});
/* 
 * *****************************************************************************************************
 * ***                       O T H E R
 * *****************************************************************************************************
 *
 * Responsive 
 */
$(window).resize(function() {
	wWidth = window.innerWidth - 70;
	wHeight = window.innerHeight - 60;
	if (window.innerWidth > 1680) {
		leftPadding = Math.round((window.innerWidth - 1680)/2);
		leftPadding = (leftPadding < 20 ? 20 : leftPadding);
	} else {
		leftPadding = 20;
	};

// report	
	if(acType == "viewer" || acType == "parameter") {
		$("#contentSection").css("padding-left", leftPadding + "px");
		viewer.setSize(wWidth - 50 - leftPadding, wHeight - 5);
		$("#acContainer").children().first().css("width", wWidth - 50 - leftPadding);
		$("#acContainer").children().first().css("height", wHeight - 5);

// dashboard		
	} else if (acType == "dashboard") {
		viewer.setSize(wWidth - 50, wHeight - 5);		
		$("#acContainer").children().first().css("width", wWidth - 50);
		$("#acContainer").children().first().css("height", wHeight - 5);	

// iframe		
	} else if (acType == "iframe") {
		$("#acContainer").children().first().css("height", $(window).height() - 125);	
		$("#acContainer").children().first().attr("height", ($(window).height() - 125) + "px");
	}
});	
 
/*
 * Function for Custom toolBar
 */
function doAction(act) {
	switch (act){
		case 'first':
			viewer.gotoPage(1);
			break;
		case 'pagedown':
			if (viewer.getCurrentPageNum() > 1 ) {
				viewer.gotoPage(viewer.getCurrentPageNum() - 1);
			}
			break;
		case 'pageup':
			if (viewer.getCurrentPageNum() < viewer.getTotalPageCount()) {
				viewer.gotoPage(viewer.getCurrentPageNum() + 1);
			}
			break;
		case 'last':
			viewer.gotoPage(viewer.getTotalPageCount());
			break;
		case 'jump':
			viewer.gotoPage(document.getElementById('jump').value);
			break;
		case 'bookmark':
			viewer.gotoBookmark(document.getElementById('bookmark').value);
			break;
		case 'print':
			viewer.showPrintDialog();
			break;
		case 'data':
			viewer.showDownloadResultSetDialog();
			break;
		case 'export':
			viewer.showDownloadReportDialog();
			break;
		case 'download':
			viewer.downloadReport(document.getElementById('format').value, document.getElementById('pagerange').value);
			break;
		case 'PDF':
			viewer.downloadReport("pdf","1-" + viewer.getTotalPageCount());
			break;
		case 'XLSX':
			viewer.downloadReport("xlsx","1-" + viewer.getTotalPageCount());
			break;
	}
};

function clearFilters() {
	if(document.jsapiform.EXCELLENT.checked && document.jsapiform.GOOD.checked && document.jsapiform.AVERAGE.checked && document.jsapiform.BAD.checked)
		return;
	else {
		document.jsapiform.EXCELLENT.checked = true;
		document.jsapiform.GOOD.checked = true;
		document.jsapiform.AVERAGE.checked = true;
		document.jsapiform.BAD.checked = true;
	};				
};

function applyFilters() {
	var myFilterString = [3];
	if(document.jsapiform.EXCELLENT.checked){
		myFilterString[0] = "EXCELLENT";
	}; 		
 	if(document.jsapiform.GOOD.checked){
		myFilterString[1] = "GOOD";
	}; 		
 	if(document.jsapiform.AVERAGE.checked){
		myFilterString[2] = "AVERAGE";
	}; 		
	if(document.jsapiform.BAD.checked){
		myFilterString[3] = "BAD";
	}; 		
	
	var bviewer = viewer;
	var bpagecontents = bviewer.getCurrentPageContent();
	var btable = bpagecontents.getTableByBookmark("mySRTable");
	
	if (btable == null) return;	// unable to get handle to table
	
	var filter = new actuate.data.Filter("AWARD", "IN", myFilterString);
	var filters = new Array();
	filters.push(filter);
	
	btable.setFilters(filters);
	btable.submit();
};
