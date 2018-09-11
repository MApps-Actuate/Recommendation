/*
* ****************************************************************
* Change label, menu, links... depending on the user name 
*
**  Default language english/en
*  
**  see all-constant.js to see user and language
* ****************************************************************
*/
// Load translation file
	messageResource.init({filePath : 'config'});
	var language = 'en';
	for (i=0;i<TRANSLATED_USER.length;i++) {
		if (sessionStorage.actUserName.toLowerCase() == TRANSLATED_USER[i][0]) language = TRANSLATED_USER[i][1];
	}

/*
 * If not default "en" language
 */	
	if (language != "en") {	
// Translate all fields
		messageResource.load('translation_' + language, function() {
			$(".toTranslate").each(function() {
				mt = $(this).text().trim()
				tt = messageResource.get(mt,'translation_' + language);		
				$(this).html($(this).html().replace(mt,tt));
			});
		});
	
// Translate Link only for non en user (add language extension)
		$(".linkToTranslate").each(function() {
			$(this).attr("href",$(this).attr("href").replace(".dashboard","_" + language + ".dashboard"));
			$(this).attr("href",$(this).attr("href").replace(".rptdesign","_" + language + ".rptdesign"));
			$(this).attr("href",$(this).attr("href").replace(".data","_" + language + ".data"));	
			$(this).attr("href",$(this).attr("href").replace(".cubeview","_" + language + ".cubeview"));		
		});	
	};