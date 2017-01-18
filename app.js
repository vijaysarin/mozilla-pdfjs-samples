var app = angular.module("myApp", []);

var pdfLoadedTo = "iframe" // can be 'iframe' or 'canvas'

var pdfJsViewerIframe = document.getElementById('pdfViewer');
var theCanvas = document.getElementById('the-canvas');	

app.controller("MainCtrl", ["$scope", function ($scope) {

	var pdfAsArray = convertDataURIToBinary(myPdfDataUrlPrefix + myPdfDataUrl);

	if (pdfLoadedTo === "iframe") {
		loadToIframe(pdfAsArray);
	} else {
		loadToCanvas(pdfAsArray);
	}
	
}]);

function convertDataURIToBinary(dataURI) {
	var BASE64_MARKER = ';base64,';
	var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
	var base64 = dataURI.substring(base64Index);
	var raw = window.atob(base64);
	var rawLength = raw.length;
	var array = new Uint8Array(new ArrayBuffer(rawLength));
	for(var i = 0; i < rawLength; i++) {
		array[i] = raw.charCodeAt(i);
	}
	return array;
}

function loadToIframe(dataUint8Array){
	pdfJsViewerIframe.style.display = 'block';
	angular.element(document).ready(function () {		
		pdfJsViewerIframe.onload = function() {		
			pdfJsViewerIframe.contentWindow.PDFView.open(dataUint8Array);
		};
	});
}

function loadToCanvas(dataUint8Array){
	theCanvas.style.display = 'block';
	PDFJS.getDocument(dataUint8Array).then(function getPdf(pdf) {	 
	  pdf.getPage(1).then(function getPage(page) {    
		var scale = 1.5;
		var viewport = page.getViewport(scale);	   		
		var context = theCanvas.getContext('2d');
		theCanvas.height = viewport.height;
		theCanvas.width = viewport.width;
		page.render({canvasContext: context, viewport: viewport});
	  });
	});	
}