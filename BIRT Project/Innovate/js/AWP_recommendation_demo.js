//Calls to AppWorks Platform REST API for Magellan Demonstration
//
// NOTE - this code is not intended to be representative of code usage in anything remotely resembling a production system
// this is written for ease of reading and demo use only
// 
// since one of the aims here is to proceed without any dependencies, this file includes code that you'd typically use a library to make nicer for you


const base_URL = 'http://ps16.eastus.cloudapp.azure.com';
const AUTHSOAP_part1 = '<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">' +
						'<SOAP:Header>' +
							'<OTAuthentication xmlns="urn:api.bpm.opentext.com">' +
	 			  				'<AuthenticationToken>';
const AUTHSOAP_part2 ='</AuthenticationToken>' +
						'</OTAuthentication>' +
						'</SOAP:Header>' +
						'<SOAP:Body>' +
							'<samlp:Request xmlns:samlp="urn:oasis:names:tc:SAML:1.0:protocol" MajorVersion="1" MinorVersion="1" IssueInstant="2014-05-20T15:29:49.156Z" RequestID="a5470c392e-264e-9537-56ac-4397b1b416d">' +
								'<samlp:AuthenticationQuery>' +
									'<saml:Subject xmlns:saml="urn:oasis:names:tc:SAML:1.0:assertion">' +
										'<saml:NameIdentifier Format="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified"></saml:NameIdentifier>' +
									'</saml:Subject>' +
								'</samlp:AuthenticationQuery>' +
							'</samlp:Request>' +
						'</SOAP:Body>' +
					'</SOAP:Envelope>';


//authenticate to AWP resource in OTDS
function GetOTDSTicket() { 
	return new Promise(function(resolve, reject) {
		var ticket='';
		var request = new XMLHttpRequest();
		request.open('POST', base_URL + ':80/otdsws/rest/authentication/credentials');
		requestBodyJSON = '{"userName": "cpatel", "password": "chiragchirag"}';
		request.setRequestHeader("Content-Type", "application/json");
		
		request.onload = function() {
			if(request.status == 200)
			{
				responseData=JSON.parse(this.response);
				ticket=responseData.ticket;
				resolve(ticket);	
			}
			else
			{
				reject("error getting OTDS ticket");
			}
		}
		
		request.onerror = function () {
			reject("error getting OTDS ticket");
		}
		
		request.send(requestBodyJSON);
		});
}

//get SAML Artifact to pass around with AWP requests
function GetSAML_Art(ticket) { 
	return new Promise(function(resolve, reject) {
		var request = new XMLHttpRequest();
		request.open("POST", base_URL + ':81/home/system/com.eibus.web.soap.Gateway.wcp?organization=o=system,cn=cordys,cn=defaultinst,o=otdemo.net');
		AuthSoapData = AUTHSOAP_part1 + ticket + AUTHSOAP_part2;
		request.setRequestHeader("Content-Type","application/xml; charset=utf-8"); 
		request.onload = function() {
			if(request.status == 200)
			{
				openTag = '<samlp:AssertionArtifact xmlns:samlp="urn:oasis:names:tc:SAML:1.0:protocol">';
				closeTag = '</samlp:AssertionArtifact>';
				startposition = request.responseText.indexOf(openTag) + openTag.length;
				endposition = request.responseText.indexOf(closeTag);
				SAML_Art = request.responseText.slice(startposition, endposition);
				resolve(SAML_Art);
			}
			else
			{
				reject("error getting SAML_Art");
			}
		}
		
		request.onerror = function () {
			reject("error getting SAML_Art");
		}
		
		request.send(AuthSoapData);
	});
}

//create an instance of Campaign entity
function CreateNewCampaignEntityInstance( SAML_Art,campaignName) { 
	return new Promise(function(resolve, reject) {
		var request = new XMLHttpRequest();
		request.open('POST', base_URL + '/home/magellan/app/entityRestService/Items?containerVersionId=47d198e5dcb032869ec7c66b3e8eb2fc&elementId=00155D110407A1E8ADDFE5509E09153F');
		request.setRequestHeader("SAMLart", SAML_Art);
		request.setRequestHeader("Content-Type", "application/json");
		requestBodyJSON = '{"item": {"Properties": { "Name": "' + campaignName + '"  }}}';
		
		request.onload = function() {
			if(request.status == 200)
			{
				resolve("Created Campaign: " + campaignName );
			}
			else
			{
				reject("error creating campaign " + campaignName);
			}
		}
		
		request.onerror = function () {
			reject("error creating campaign " + campaignName);
		}
		
		request.send(requestBodyJSON);
	});
}

//create an instance of Suggestion entity
function CreateNewSuggestionEntityInstance( SAML_Art, suggestionSubject ) { 
	return new Promise(function(resolve, reject) {
		var request = new XMLHttpRequest();
		request.open('POST', base_URL + '/home/magellan/app/entityRestService/Items?containerVersionId=47d198e5dcb032869ec7c66b3e8eb2fc&elementId=00155D110407A1E8AE080EAD97911540');
		request.setRequestHeader("SAMLart", SAML_Art);
		request.setRequestHeader("Content-Type", "application/json");
		requestBodyJSON = '{"item": {"Properties": { "Subject": "' + suggestionSubject + '"  }}}';
		
		request.onload = function() {
			if(request.status == 200)
			{
				resolve("Created suggestion with subject: " + suggestionSubject );
			}
			else
			{
				reject("error creating suggestion with subject " + suggestionSubject);
			}
		}
		
		request.onerror = function () {
			reject("error creating suggestion with subject " + suggestionSubject);
		}
		
		request.send(requestBodyJSON);
	});
}


function AWP_CreateCampaign( title ) {
	//This function:
	// 1. Logs in to OTDS 
	// 2. Logs in to AppWorks Platform 
	// 3. Creates an instance of entity Campaign
	const p1 = GetOTDSTicket().then(function(result){
			return GetSAML_Art(result); //result is the resolved value from GetOTDSTicket (i.e. the ticket) which we pass to GetSAML_Art
	})
	.then(function(result2){
		return CreateNewCampaignEntityInstance( result2, title ); //result2 is the resolved output from the preceding call in the chain, GetSAML_Art, title is the parameter passed in from the caller to the outermost function
	})
	.then(function(result3) {
		return result3;
	})
	.catch(() => {
		return "error creating campaign - check that AWP system is running";
	})
	return p1;
}

function AWP_CreateSuggestion( subject ) {
	//This function:
	// 1. Logs in to OTDS 
	// 2. Logs in to AppWorks Platform 
	// 3. Creates an instance of entity Campaign
	const p2 = GetOTDSTicket().then(function(result){
			return GetSAML_Art(result); //result is the resolved value from GetOTDSTicket (i.e. the ticket) which we pass to GetSAML_Art
	})
	.then(function(result2){
		return CreateNewSuggestionEntityInstance( result2, subject ); //result2 is the resolved output from the preceding call in the chain, GetSAML_Art, subject is the parameter passed in from the caller to the outermost function
	})
	.then(function(result3) {
		return result3;
	})
	.catch(() => {
		return "error creating suggestion - check that AWP system is running";
	})
	return p2;
}
