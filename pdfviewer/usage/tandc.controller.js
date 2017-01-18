'use strict';

module.exports = function() {

    angular.module('app.activeQuotes.tandc')
            .controller('termsCondition', termsCondition);

    // ngInject
    function termsCondition($timeout, $stateParams, retailerTnC, notify, $filter, $state, tandcServices, activeQuotesService) {
        var tandcVm = this;
        tandcVm.currentTab = activeQuotesService.getCurrentTab();
        tandcVm.activeQuotesData = activeQuotesService.getActiveQuotesData(tandcVm.currentTab);

        tandcVm.retailerClicked = $stateParams.retailerClicked;
        var retailerClicked = tandcVm.retailerClicked ;
        tandcVm.proceedSpinner = tandcVm.emailSpinner = false ;


        setTandCData() ;
        function setTandCData() {
            if(retailerClicked && retailerTnC) {
                tandcVm.retailerId = retailerClicked.retailerId ;
                tandcVm.retailerName = retailerClicked.retailerName ;
                tandcVm.offerValidFrom = retailerClicked.offerRate.offerStartDate ;
                tandcVm.offerEndDate = retailerClicked.offerRate.offerEndDate ;
                tandcVm.currency = retailerClicked.offerRate.currencySymbol ;
                tandcVm.offerTotal = retailerClicked.offerRate.offerTotal ;
                tandcVm.quoteOfferId = retailerClicked.quoteOfferId ;
                tandcVm.pdfURL = retailerTnC.pdfURL;
            } else {
                $state.go('activeQuotes') ;
            }
        }
        tandcVm.isConfirm = $stateParams.isConfirm ;
        tandcVm.duration = $stateParams.duration;
        tandcVm.proceedWithOffer = proceedWithOffer;
        tandcVm.emailTermsandCondition = emailTermsandCondition;
        tandcVm.acceptTnC = false;

        function proceedWithOffer() {
            if (!tandcVm.acceptTnC) {
                var options = {
                    heading: 'Error Message',
                    messages: [{
                            'message': $filter('translate')('AQ_TANDC_ACCEPTTnC')
                        }]
                }
                notify.error(options);
            } else {
                //TODO: Call service for Accept Quote
                var data = {
                    "quoteOfferId": tandcVm.quoteOfferId,
                    "quoteId": tandcVm.activeQuotesData.clientData.quoteId,
                    "quoteRequestId": tandcVm.activeQuotesData.siteDetails.quoteRequestId
                };
                tandcVm.proceedSpinner = true;
                 var acceptOfferPromise = tandcServices.acceptOffer(data) ;
                 acceptOfferPromise.then(function(response){
                     notify.alertify(response.data,true);
                     tandcVm.proceedSpinner = false;
                     activeQuotesService.destroyQuoteData();
                     $state.go('customer');
                 }, function(errorResponse){
                     notify.alertify(errorResponse.data, true);
                     tandcVm.proceedSpinner = false;
                 })
            }
        }

        function emailTermsandCondition() {
//            var tandCPromise = tandcServices.sendEmail(tandcVm.retailerId) ;
            tandcVm.emailSpinner = true;
            var tandCPromise = tandcServices.sendEmail(1) ;
            tandCPromise.then(function(response){
                notify.alertify(response.data,true);
                tandcVm.emailSpinner = false;
                if(tandcVm.isConfirm)$state.go('activeQuote');

            },
            function(errorResponse){
                notify.alertify(errorResponse.data, true);
                tandcVm.emailSpinner = false;
                console.log("failure");
            })
        }

        function loadTermsAndConditionsPdf(dataUint8Array){
            $timeout(function () {
                var pdfViewerIframe = document.getElementById('tandcPdfViewer');
                pdfViewerIframe.onload = function() {
                        pdfViewerIframe.contentWindow.PDFView.open(dataUint8Array);
                };
            });
        }

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

        // @FixMe : using base64 url instead of binary - for demo only
        // var binaryPdfData = convertDataURIToBinary(retailerTnC.pdfURL);
        loadTermsAndConditionsPdf(retailerTnC.pdfURL);
    }
};