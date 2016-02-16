var bitcore = require('bitcore');
var ECIES = require('bitcore-ecies');

//var client = new WebTorrent();

var INSIGHT_SERVER = getInsightServer();



$( document ).ready(function() { 
    
//    getImageHash("pockets-48.png", function(hash){
//    
//        console.log("local: "+hash);
//        
//    });
//    
//    getImageHash("http://joelooney.org/ltbcoin/pockets-16.png", function(hash){
//    
//        console.log("remote: "+hash);
//        
//    });
    
//    setBvamwtOff();
    
    
    
    setInitialAddressCount();
    
    setPinBackground();
    
    $('#alltransactions').hide();
    
    $('#yourtxid').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   });
    
    $('#alltransactions').on('click', 'a', function(){
     chrome.tabs.create({url: $(this).attr('href')});
     return false;
   });

    

    
    
    $("#pinsplash").hide();
    $('#alltransactions').hide();

    getStorage();
    //setEncryptedTest();
    
    //on open
    var manifest = chrome.runtime.getManifest();
    
    //var infobutton = "<div style='display: inline-block; padding-left: 5px;'><a id='infoButton' href='#infoPage' data-toggle='tab'><img src='info-icon.png' height='16' width='16'></a><div id='helpButton' style='display: inline-block; cursor: pointer; margin-left: 3px;'><img src='images/help-icon.png' height='16' width='16'></div></div>";
    
    $("#nameversion").html("v" + manifest.version);
  
    
       var JsonFormatter = {
        stringify: function (cipherParams) {
            // create json object with ciphertext
            var jsonObj = {
                ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)
            };

            return JSON.stringify(jsonObj);
        },

        parse: function (jsonStr) {
            // parse json string
            var jsonObj = JSON.parse(jsonStr);

            // extract ciphertext from json object, and create cipher params object
            var cipherParams = CryptoJS.lib.CipherParams.create({
                ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct)
            });

            return cipherParams;
        }
        };
    
    $("form").submit(function (e) {
      e.preventDefault();
    //};

   // $("#pinButton").click(function () {
        
        var pin = $("#inputPin").val();
        
        $("#inputPin").val("");
        
        chrome.storage.local.get(["passphrase"], function (data)
        {         
            var decrypted = CryptoJS.AES.decrypt(data.passphrase, pin, { format: JsonFormatter });          
            var decrypted_passphrase = decrypted.toString(CryptoJS.enc.Utf8);
            
            console.log(decrypted_passphrase.length);
            
            if (decrypted_passphrase.length > 0) {
                
                $("#pinsplash").hide();
                $(".hideEncrypted").hide();
                $("#navigation").show();
                
                //$("#priceBox").show();
            
                existingPassphrase(decrypted.toString(CryptoJS.enc.Utf8));
                
            } 
        });
    });
    
    $('#myTab a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });
    
    $( "#walletaddresses" ).change(function () {
        
         $("#sendtokenbutton").prop('disabled', false);
        
        $( "#btcbalance" ).html("<div style='font-size: 12px;'>Thinking...</div>");
    
        var addr = $(this).val();
        
        $( ".addressselect" ).attr("title", addr)
        
        if (addr == "add") {
        
//            chrome.storage.local.get(function(data) {
//
//                var addresslabels = data["addressinfo"];
                
                //dynamicAddressDropdown(addresslabels);
                
                addTotalAddress(dynamicAddressDropdown);

//            }); 
            
        } else {
        
            console.log(addr);

    //    chrome.storage.local.set(
    //                    {
    //                        'lastAddress': addr
    //                    }, function () {

            $("#xcpaddress").html(addr);

           
                getPrimaryBalance(addr);
              
                    
//                    });
        }
    
    });
    
    
    
    
    $('#yesEncryptButton').click(function (){
        
        $('#encryptquestion').hide();  
        $('#encryptyes').show();  
    
    });
    
    $('#setpinatsplash').click(function (){
         
        
                        
        chrome.storage.local.get(["passphrase"], function (data)
            {       
            
                var password = $("#inputSplashPass").val();
                
                var encrypted = CryptoJS.AES.encrypt(data.passphrase, password, { format: JsonFormatter });
               
                chrome.storage.local.set(
                {
                        
                    'passphrase': encrypted,
                    'encrypted': true
                        
                }, function () {
                
                    $("#welcomesplash").hide();
                    $("#navigation").show();
                    $(".hideEncrypted").hide();
                    $(".bg").css("min-height", "200px");
                
                });
        
            });
                                          
                  
    });
    
    $('#setupWalletButton').click(function (){
        $('#walletquestion').show();  
        $('#initialsplash').hide();  
    });
    
    $('#yesExistingWallet').click(function (){
        $('#walletquestion').hide();  
        $('#walletyes').show();  
    });
    
    $('#noExistingWallet').click(function (){
        
          
        $('#initialsplash').hide();  
         newPassphrase();
        
        $('#walletquestion').hide();  
        $('#walletno').show();  
    });
    
    $('#writeDownButton').click(function (){
        $('#walletno').hide();  
        $('#encryptquestion').show();  
    });
    
   
    
    $('#copyButton').click(function (){
        
        var address = $("#xcpaddress").html();
        
        copyToClipboard(address);
        
        $('#xcpaddressTitle').hide(); 
        $('#addresscopied').show();
        setTimeout(function(){ 
            $('#addresscopied').hide(); 
            $('#xcpaddressTitle').show();
        }, 1500);
        
    });
    
    $('#exportAddresses').click(function(){
        exportAddresses();
        
    });
    
    $('#importAddresses').click(function(){
        
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.executeScript(tabs[0].id, {file: "js/import_addresses.js"}, function(){
            
            if (chrome.extension.lastError){
                var errorMsg = chrome.extension.lastError.message;
                if (errorMsg == "Cannot access a chrome:// URL"){
                    $("#hiddenaddlab").show();
                }
            }
                
            });
        });
        
        
    });
    
    
      
    
    $('#AddressesAndLabels').click(function(){
        $('#AddressesAndLabelsOptions').toggle();
        
        $('#hiddenaddlab').hide();
    });
   
    
    $('#setpassphraseatsplash').click(function (){
        $('#walletyes').hide();  
        $('#encryptquestion').show();  
        
        var passphrase = $('#inputSplashPassphrase').val();
        
        manualPassphrase(passphrase);
    });
    
    $('#noEncryptButton').click(function (){
       
            chrome.storage.local.set(
                    {
                        
                        'firstopen': false
                        
                    }, function () {
                    
                        getStorage();
                        $("#welcomesplash").hide();
                        $("#navigation").show();
                                          
                    });
        
    
    });
    
    $('#assettransactiontoggle').click(function ()
        { 
                
            var currentaddr = $("#xcpaddress").html();
            
            if ($('#assettransactiontoggle').html() == "View Tokens") {
                
                $('#assettransactiontoggle').html("View Token Transaction History");
                $('#alltransactions').hide();
                $('#allassets').show();
                
                loadAssets(currentaddr);
                
            } else {
                
                $('#assettransactiontoggle').html("View Tokens");
                $('#alltransactions').show();
                $('#allassets').hide();

                loadTransactions(currentaddr);
            }
            
        });
    
    $('.resetAddress').click(function ()
        {
           
                   
            newPassphrase();
                        
            
            $('#walletLink').trigger('click');
                            

        });
    
    $('.addlabbuttons').click(function ()
        {
           
                   
                        $('#AddressesAndLabelsOptions').hide();
                        
                                          

        });
    
    $('.resetFive').click(function ()
        {
            resetFive();
        });
    
    $('#revealPassphrase').click( function ()
        {
            if($("#newpassphrase").is(":visible")) {
                $("#passphrasebox").hide();
                $("#revealPassphrase").html("Reveal Passphrase");
            } else {
                $("#passphrasebox").show(); 
                $("#revealPassphrase").html("Hide Passphrase");
            }
        });
    
    $('#manualPassphrase').click( function ()
        {
            if($("#manualPassBox").is(":visible")) {
                $("#manualPassBox").hide();
                //$("#revealPassphrase").html("Reveal Passphrase");
            } else {
                $("#manualPassBox").show(); 
                //$("#newpassphrase").hide();
                //$("#revealPassphrase").html("Hide Passphrase");
            }    
        });
    
     $('#encryptPassphrase').click( function ()
        {
            if($("#encryptPassphraseBox").is(":visible")) {
                $("#encryptPassphraseBox").hide();
                //$("#revealPassphrase").html("Reveal Passphrase");
            } else {
                $("#encryptPassphraseBox").show(); 
                //$("#newpassphrase").hide();
                //$("#revealPassphrase").html("Hide Passphrase");
            }    
        });
    
    $('#sendAssetButton').click( function () {
        
        
        
        $("#btcsendbox").toggle();
        
        
        
        if($("#moreBTCinfo").is(":visible")) {
            $("#moreBTCinfo").hide();
        }
            
            
    });
    
    $('#manualAddressButton').click( function ()
        {
            
            var passphrase = $('#manualMnemonic').val();
            $('#manualMnemonic').val("");
            manualPassphrase(passphrase);
            $('#walletLink').trigger('click');
            
        });
 
      $(document).on("click", '#depositBTC', function (event)
  {
            if($("#btcsendbox").is(":visible")) {
                $("#btcsendbox").hide();
            }
      
      
        if ($("#moreBTCinfo").length){
          
            $("#moreBTCinfo").toggle();
            
            
          
        } else {
      
            var currentaddr = $("#xcpaddress").html();
            $("#btcbalance").append("<div id='moreBTCinfo'><div id='btcqr' style='margin: 20px auto 20px auto; height: 100px; width: 100px;'></div><div>Cost per BTC transaction is 0.0001 BTC<br>Cost per asset transaction is 0.0001547 BTC</div></div>");  
            var qrcode = new QRCode(document.getElementById("btcqr"), {
    			text: currentaddr,
    			width: 100,
    			height: 100,
    			colorDark : "#ffffff",
    			colorLight : "#000000",
    			correctLevel : QRCode.CorrectLevel.H
				});
        }
        });

    
    $(document).on("click", '#saveLabelButton', function (event)
      {
          
          var newlabel = $("#newPocketLabel").val();
          
          var labelfixed = newlabel.replace(/'/g, '');

          insertAddressLabel(labelfixed, dynamicAddressDropdown); 
          
      });
 
     $(document).on("click", '#newLabelButton', function (event)
      {
          
          var currentlabel = $('select option:selected').attr('label');
          $("#newPocketLabel").val(currentlabel); //.slice(0, -18)
          $("#addresslabeledit").toggle();
          $("#pocketdropdown").toggle();
          
      });
    

    
    
    
    $(document).on("click", '.tokenlistingheader', function (event)
  {
      
            $( ".tokenlistingbody" ).remove(); 
  });
    
     $(document).on("click", '.swapbotselect', function (event)
  { 
      console.log($(this).data("url"));
      
      
            chrome.tabs.create({url: $(this).data("url")});
            return false; 
  });
    
$(document).on("click", '.tokenlisting', function (event)
  {
        
      var currenttoken = $(this).data("token"); 
      
      if ($( "div:contains('"+currenttoken+" Swapbots')" ).length) {
      
          $( ".tokenlistingbody" ).remove(); 
      
      } else {
      
          if ($('.tokenlistingbody').length) {

                $( ".tokenlistingbody" ).remove(); 

          } 

          var row = $(this).closest('tr');

         $("<tr class='tokenlistingbody' style='background-color: #2EA1CC;'><td colspan='3'><div class='lead' style='text-align: center; width: 100%; color: #fff; margin: 17px 0 0 0; padding: 3px; font-size: 24px;'>"+currenttoken+" Swapbots</div><div class='swaplistbody' style='width: 100%; margin: auto; text-align: center;'><div style='padding: 20px; color: #fff;'><i class='fa fa-cog fa-spin fa-5x'></i></div></div></td></tr>").insertAfter(row);
          
          
           loadSwaplist(currenttoken);
      
      
      }
      
  });
    
  $(document).on("click", '#refreshWallet', function (event)
  {
      
        if($("#createDexOrder").html() == "Reset") {
            $("#dex-order-message").html("");
            $("#createDexOrder").html("Create Order");
            $("#createDexOrder").addClass("btn-success");
            $("#createDexOrder").removeClass("btn-info");
            $("#giveQuantityInput").val("0");
            $("#getQuantityInput").val("0");
            $("#getAssetInput").val("");
            $("#getExpirationInput").val("100");
        }
      
      
      
        $("#encrypted-message-window").hide();
        $("#decrypted-message-window").show();
      
      
      $("#currenttoken-pending").html("");

      $("#ltbDirectorySearchResults").html("");
      $("#ltbUserSearch").val("");
      //$("#searchLTBuser").text("Search");

      $("#freezeUnconfirmed").css("display", "none");
      $("#mainDisplay").css("display", "block");
      
      //$("#sendtokenbutton").html("Send Token");
      $("#sendtokenbutton").prop('disabled', false);
      $("#sendtoaddress").prop('disabled', false);
      $("#sendtoamount").prop('disabled', false);
      
      $("#sendtoaddress").val("");
      $("#sendtoamount").val("");

      $(".sendlabel").html("");
      
      var assetbalance = $("#xcpbalance").html();
      var array = assetbalance.split(" ");
      
      
      var pubkey = $("#xcpaddress").html();
      var currenttoken = $(".currenttoken").html();
      
      $("#sendtokenbutton").html("SEND "+currenttoken);
      //$("#sendtokenbutton").html("SEND TIME");
      
      $('#allTabs a:first').tab('show');
      
      getRate(array[0], pubkey, currenttoken);
      
      getPrimaryBalance(pubkey);
      
      currenttokenpending(currenttoken);
  });
    
  $('#switchtoxcp').click(function ()
  {
      $("#currenttoken-pending").html("");
      $(".currenttoken").html("BTC"); 
      $("#sendtokenbutton").html("Send BTC");
      var pubkey = $("#xcpaddress").html();
      getPrimaryBalance(pubkey);
      //$('#allTabs a:first').tab('show');
  });


//  $('#txHistory').click(function ()
//  {
//    var address = $("#xcpaddress").html();
//    chrome.tabs.create(
//    {
//      url: "http://blockscan.com/address/" + address
//    });
//  });

//  $('#contact').click(function ()
//  {
//    chrome.tabs.create({ url: "mailto:support@letstalkbitcoin.com" });
//  });
//
//    $('#navbar-id').click(function ()
//  {
//    $("#infoPage").click();
//      
//      
//      
//  }); 
    
    
  $('#refresharrow').click(function ()
  {
    var pubkey = $("#xcpaddress").html();
    getPrimaryBalance(pubkey);
  });
    
  
   $(document).on("click", '.movetowallet', function (event)
  {  
      $("#currenttoken-pending").html("");
      
      var $assetdiv = $( this ).prev();
      
      var currentasset = $assetdiv.html();
      
      var subassetname = $("#"+currentasset+"-subasset").html();
      
      if(subassetname != undefined) {
         $("#subassetname").html(subassetname);
        $("#sendtokenbutton").html("Send");
      } else {
         $("#subassetname").html("");
          $("#sendtokenbutton").html("Send "+currentasset);
      }

      
          
      
      
      $(".currenttoken").html(currentasset);
      
      var qtypending = $("."+currentasset+"-pending").html();
      
      $("#currenttoken-pending").html(qtypending);
      

      
      var pubkey = $("#xcpaddress").html();
      
      
      getPrimaryBalance(pubkey);
      
      
      
      
      $('#allTabs a:first').tab('show');
      
  });
    
    
    
    
     $(document).on("click", '.movetosend', function (event)
  {  
  
      var sendaddress = $( this ).text();
      
      var username = $( this ).data("user");
      
      $("#sendtoaddress").val(sendaddress);
      
      $(".sendlabel").html(username);
      
      $("#btcsendbox").show();
      $("#moreBTCinfo").hide();

      $('#allTabs a:first').tab('show');
      
  });
    
    


  $('#transactionTab').click(function ()
  {
    
    //$('.bg').css({"width":"320px"});  
      
//      $('#buysellTab').css({"margin-left":"12px"});
//      //$("#priceBox").show();
//      $("#priceBoxBank").hide();
      
//      
//      $('.bg').animate({
//            width: "320px"
//        }, 100 );
      
    var address = $("#xcpaddress").html();
        
//    if ($('#assettransactiontoggle').html() == "View Tokens") {
      $('#alltransactions').show();
        loadTransactions(address);
//    } else {
//        loadAssets(address);
//    }
//      
  });  
    
    $('#inventoryTab').click(function ()
    { 
        
        var address = $("#xcpaddress").html();
    
    loadAssets(address);
      
      });
    

    
    $(document).on('click', '#walletTab', function () {
        
        //$('.bg').css({"width":"320px"});
        $('.bg').animate({
            width: "320px"
        }, 100 );
        $('#buysellTab').css({"margin-left":"12px"});
        //$("#priceBox").show();
        $("#priceBoxBank").hide();
        
    });
    
        $(document).on('click', '#settingsTab', function () {
        
        //$('.bg').css({"width":"320px"});
        $('.bg').animate({
            width: "320px"
        }, 100 );
        $('#buysellTab').css({"margin-left":"12px"});
        //$("#priceBox").show();
        $("#priceBoxBank").hide();
    });
    
$(document).on('click', '#toolsTab', function () {
    
            //$('.bg').css({"width":"320px"});
        
        $('.bg').animate({
            width: "320px"
        }, 100 );
    $('#buysellTab').css({"margin-left":"12px"});
        //$("#priceBox").show();
        $("#priceBoxBank").hide();
    
    var $link = $('li.active a[data-toggle="tab"]');
    $link.parent().removeClass('active');
    var tabLink = $link.attr('href');
    $('#allTabs a[href="' + tabLink + '"]').tab('show');
    
    loadAddresslist();
});
    
   
    
   $(document).on("click", '#encryptPasswordButton', function (event) 
    {
        chrome.storage.local.get(["passphrase"], function (data)
        {       
            
            var password = $("#encryptPassword").val();
            $("#encryptPassword").val("");
            var encrypted = CryptoJS.AES.encrypt(data.passphrase, password, { format: JsonFormatter });
               
            chrome.storage.local.set(
                    {
                        
                        'passphrase': encrypted,
                        'encrypted': true
                        
                    }, function () {
                    
                        $(".hideEncrypted").hide();
                    
                    });
        
        });
    });

    $('.signMessageButton').click(function ()
        {
            var inputaddr = $("#signPubAddress").val();
            var inputpassphrase = $("#newpassphrase").html();
            var message = $("#messagetosign").val();
            
            var privkey = getprivkey(inputaddr, inputpassphrase);
            var signed = signwith(privkey, inputaddr, message);
            
            
            if($(this).hasClass("copy")){
                copyToClipboard(signed);
            }
            
            $("#postSign").html(signed);
            
            $("#postSign").show();
            $("#resetsignbox").show();
            
            $("#preSign").hide();
             
        });
    
    $('#resetSignButton').click(function ()
        {
            $("#messagetosign").val("");
            $("#resetsignbox").hide();
            $("#postSign").hide();
            
            $("#preSign").show();            
        });   
    
     $('#IssueTool').click(function (){
         var newasset = create_new_assetid();
         
         $("#issue-asset").val(newasset);
       
     });         
    
    $('#sendbroadcastbutton').click(function ()
        {
            var txsAvailable = $("#txsAvailable").html();
            var broadcastvalue = $("#broadcastvalue").val();
            var broadcastfeefraction = $("#broadcastfeefraction").val();
            
            if ($.isNumeric(broadcastvalue) == true && $.isNumeric(broadcastfeefraction) == true && txsAvailable > 1) {
            
                $("#sendbroadcastbutton").prop('disabled', true);
                $("#sendbroadcastbutton").html("Sending Broadcast...");
            
                var pubkey = $("#walletaddresses").val();
                var broadcastmessage = $("#broadcastmessage").val();
                             
                console.log("sent!");

                var minersfee = 0.0001;
                
                var mnemonic = $("#newpassphrase").html();
                
                sendBroadcast_opreturn(pubkey, broadcastmessage, broadcastvalue, broadcastfeefraction, minersfee, mnemonic, function(){

                    $('#allTabs a:first').tab('show');
                
                });
            }
            
        });
    
      $(document).on("keyup", '#broadcastmessage', function (event)
    { 
        var message = $("#broadcastmessage").val();
        var broadcastvalue = $("#broadcastvalue").val();
        var broadcastfeefraction = $("#broadcastfeefraction").val();
        
        
        if (message.length > 0){
            $("#sendbroadcastbutton").removeAttr("disabled");    
       	} else { 
            $('#sendbroadcastbutton').prop('disabled', true);
        }      
        
        
    });
    
    
    $('#sendtokenbutton').click(function ()
        {
            sendtokenaction();      
        });
    
    $(document).on("keyup", '#sendtoaddress', function (event)
    { 
        
        $(".sendlabel").html("");
    });
    
    
    $(document).on("keyup", '#sendtoamount', function (event)
    { 
        
        var sendamount = parseFloat($("#sendtoamount").val());
        var currenttoken = $(".currenttoken").html();
        
        if (currenttoken == "BTC") {
            var currentbalance = parseFloat($("#btcbalhide").html());
        } else {
            var currentbalance = parseFloat($("#assetbalhide").html());
        }
        
        //console.log(sendamount);
        //console.log(currentbalance);
        
        if (sendamount > currentbalance) {
            $('#sendtokenbutton').prop('disabled', true);
       	} else {
            $("#sendtokenbutton").removeAttr("disabled");
        }
        
        
        if (currenttoken == "BTC") {
// || currenttoken == "XCP"
            
            if (isNaN(sendamount) == false && $("#sendtoamount").filter(function() { return $(this).val(); }).length > 0){
            
                
          //      if (currenttoken == "BTC") {
                    
                    var ltbtousd = $("#ltbPrice").data("btc").price;
                    var sendinusd = sendamount / parseFloat(ltbtousd);
            
                    $("#sendUSD").html("($"+sendinusd.toFixed(2)+")");
                    
           //     } 
//                else {
//                    
//                    chrome.storage.local.get(["assetrates"], function (data)
//                        {  
//                            
//                            for(i=0; i < data["assetrates"].length; i++){
//                                
//                                var findassetrate = data["assetrates"][i];
//                                
//                                if (data["assetrates"][i]["assetname"] == "XCP") {
//                    
//                                    var ltbtousd = data["assetrates"][i]["assetprice"];
//                                    var sendinusd = sendamount * parseFloat(ltbtousd);
//            
//                                    $("#sendUSD").html("($"+sendinusd.toFixed(2)+")");
//                    
//                                    
//                                }
//                            
//                            }
//                            
//                        })
//                    
//                }
                
 
            } else {
            
                $("#sendUSD").html("");
            }
            
        } else {
            
            $("#sendUSD").html("");
            
        }
        
    });
    

   
    $('#ExchangeRateApp').click(function(){
        
        getExchangeRatesList();
        
   });
    

    
    
    $('#hideshowpass').click(function(){
            
        var status = $('#hideshowpass').html();
        
        if (status == "Hide Passphrase") {
            
            $('#hideshowpass').html("Show Passphrase");
            
            $('#inputSplashPassphrase').prop('type', 'password');
            
        } else {
            
            $('#hideshowpass').html("Hide Passphrase");
            
            $('#inputSplashPassphrase').prop('type', 'text');
            
        }
        
   });
    
    
   $('#hideshowpassSettings').click(function(){
       
        var status = $('#hideshowpassSettings').html();
        
        if (status == "Hide") {
            
            $('#hideshowpassSettings').html("Show");
            
            $('#manualMnemonic').prop('type', 'password');
            
        } else {
            
            $('#hideshowpassSettings').html("Hide");
            
            $('#manualMnemonic').prop('type', 'text');
            
        }
                
   });    
    
       $('#chainsobutton').click( function ()
        {
            var state = $('#turnoffchainso').html();
            

            
            if (state == "Disable Chain.so Transaction Detection") {
                
                var detect = "no";

                chrome.storage.local.set(
                        {
                            'chainso_detect': detect
                        }, function () {
                            
                            $('#turnoffchainso').html("Enable Chain.so Transaction Detection");
                        
                        });
                
                
            } else {
                
                var detect = "yes";

                chrome.storage.local.set(
                        {
                            'chainso_detect': detect
                        }, function () {
                            
                            $('#turnoffchainso').html("Disable Chain.so Transaction Detection");
                        
                        });
                
            }
        });
    

        $(".sendinputbox").keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A, Command+A
            (e.keyCode == 65 && ( e.ctrlKey === true || e.metaKey === true ) ) || 
             // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
        });
    
        $(".collapsenav").click(function(){
            $('.navbar-collapse').collapse('hide');
        });

    
    $("#MessagingTool").click(function(){  
                        
        $("#receiver-encrypt").val("");
        $("#message-encrypt").val("");

         var pubkey = $("#walletaddresses").val();

         $("#sender-encrypt").val(pubkey);
       
     });
    
    
$(document).on("click", '.checkmessage', function (event) {

    var txid = $(this).data("txid");
    
    var element = this;
    
    var mnemonic = $("#newpassphrase").html();
    
    get_message_encoded(txid, mnemonic, function(message, from) {
        
        var messagebody = "<div style='width: 100%; color: #000;' align='left'><div style='font-weight: bold; font-size: 10px; padding-bottom: 2px;'>Received From:</div><div style='font-size: 12px; padding-bottom: 5px;'>"+from+"</div><div style='font-weight: bold; font-size: 10px; padding-bottom: 2px;'>Message:</div><div style='padding-bottom: 5px;'>"+message+"</div></div>"
        
        
        $(element).parent().html(messagebody);
        
    })
    
});
    


$("#encrypt-button").click(function(){
    
        var btcrate = $("#ltbPrice").data("btc").price;
        var usdrate = 1 / parseFloat(btcrate);
        var usdValue = usdrate * 0.0003107;
    
        $("#usdMessageCost").html(usdValue.toFixed(2));
        
        var pubkey = $("#walletaddresses").val();
        var mnemonic = $("#newpassphrase").html();
        var sender = getprivkey(pubkey, mnemonic);

        var addr = $("#receiver-encrypt").val();
        var message = $("#message-encrypt").val();
        
        if (bitcore.Address.isValid(addr)){
            
            
        
            getpubkey(addr, function(receiver_hex) {
                
                if (receiver_hex != "error") {
                    
                    $("#messagingPage").data("pkg", { sender: sender, receiver: receiver_hex } );

                    encryptECIES(sender, receiver_hex, message, function(encryptedmess){

                        $("#encrypted-message").html(encryptedmess.substr(66));
                        
                        $("#encrypted-message-window").show();
                        $("#decrypted-message-window").hide();
                        
                    })
                    
                } else {
                    
                    $("#receiver-encrypt").val("Public Key not found!");
                    
                }

            })
        
        } else {
            
            $("#receiver-encrypt").val("Address Invalid!");
            
        }
    
})
    
    

$("#send-encrypt-message").click(function(){   
    
    var unencrypted_message_length = $("#message-encrypt").val().length;
    
    var message = $("#encrypted-message").html();
      
    var sender = $("#messagingPage").data("pkg").sender;
    var receiver = $("#messagingPage").data("pkg").receiver;
    
//    seedMessage(sender, receiver, message, function(){
//    
//        $("#encrypted-message-window").hide();
//        
//        $("#message-sent-window").show();
//    
//    })

    var pubkey = $("#walletaddresses").val();
    var mnemonic = $("#newpassphrase").html();
    
    var btc_total = 0.00005468; 
    var msig_total = 0.000078;  //total btc to multisig output (returned to sender)
    var transfee = 0.0001;  //bitcoin tx fee
       
    var add_to = address_from_pubkeyhash(receiver);
//    console.log(add_to);
     
    sendMessage(pubkey, add_to, message, msig_total, btc_total, transfee, mnemonic, 2, function(){

        $('#allTabs a:first').tab('show');
                
    });
    
})
    

$("#DEXTool").click(function(){     

     var pubkey = $("#dexOrderAddress").val();   
    loadAssetsDex(pubkey)  
    
    $("#createDexOrder").html("Create Order");
    $("#createDexOrder").prop('disabled', false);
    $("#giveQuantityInput").val("0");
    $("#getQuantityInput").val("0");
    $("#getAssetInput").val("");
    $("#getExpirationInput").val("100");
        
    
     $("#dexOptions").show();
    $("#dexOpenOrders").hide();
    $("#dexOpenOrdersTable-loading").show();
     $("#dexBuyOrder").hide();
    $("#dexViewMarket").hide();
    
});
    

    
$("#dexOrderAddress").change(function(){     

     var pubkey = $("#dexOrderAddress").val();   
    loadAssetsDex(pubkey)  
    
    //$("#giveQuantityInput").val("")
  
    
});
    

$(document).on("keyup", '#getAssetInput', function (event) {
    var inputval = $(this).val();
    $(this).val(inputval.toUpperCase());
})
    
$("#dexSellAssets").change(function(){     

     // $("#dexSellAssets").data(assetname, { bal: assetbalance });

    var assetname = $("#dexSellAssets").val();
    var assetbalance = $("#dexSellAssets").data(assetname).bal;
    $("#sellAssetBal").html("Balance: "+assetbalance)
    
    
    
});
    
$("#createDexOrder").click(function(){    
    
    if($(this).html() != "Reset") {

        
        var sell_asset = $("#dexSellAssets").val()
        var sell_qty = $("#giveQuantityInput").val()
        var buy_asset = $("#getAssetInput").val()
        var buy_qty = $("#getQuantityInput").val()
        var expiration = $("#getExpirationInput").val()
        
        var sell_asset_balance = $("#dexSellAssets").data(sell_asset).bal;
        
        if(sell_asset_balance == undefined){
            sell_asset_balance = 0;
        }

        console.log(sell_asset_balance);
        console.log(sell_qty);

        if(parseFloat(sell_asset_balance) < parseFloat(sell_qty) || $("#giveQuantityInput").val() == "0" || $("#getQuantityInput").val() == "0") {
            
            if($("#giveQuantityInput").val() == "0" || $("#getprivkeyQuantityInput").val() == "0") {
                
                $("#dex-order-message").html("<div style='margin-top: 15px;' class='alert alert-warning'>Buy and Sell cannot be zero</div>");
                
            } else {
                
                if(sell_asset == null){sell_asset = $("#dexSellAssets").data("nullasset");}
            
                $("#dex-order-message").html("<div style='margin-top: 15px;' class='alert alert-warning'>You do not have enough "+sell_asset+" at this address</div>");
                    
            }

            $("#createDexOrder").html("Reset");
            $("#createDexOrder").removeClass("btn-success");
            $("#createDexOrder").addClass("btn-info");

        } else {
            
            var txsAvailable = $("#txsAvailable").html();
            
            if ($.isNumeric(sell_qty) == true && $.isNumeric(buy_qty) == true && $.isNumeric(expiration) == true && buy_asset.length <= 12 && sell_asset.length <= 12 && expiration > 0 && expiration <= 65535 && txsAvailable > 1) {
            
                $("#createDexOrder").prop('disabled', true);
                $("#createDexOrder").html("Creating New Order... <i class='fa fa-cog fa-spin'></i>");
            
                var pubkey = $("#dexOrderAddress").val();
                             
                console.log("sent!");

                var minersfee = 0.0001;
                
                var mnemonic = $("#newpassphrase").html();
                
                createOrder_opreturn(pubkey, sell_asset, sell_qty, buy_asset, buy_qty, expiration, minersfee, mnemonic, function(){

                    $('#allTabs a:first').tab('show');
                
                });
                

                
//                createOrder_opreturn(pubkey, sell_asset, sell_qty, buy_asset, buy_qty, expiration, minersfee, mnemonic, function(status, txid){
//                    
//                    if (status != "success") {
//                
//                        $("#sendtokenbutton").html("Refresh to continue...");
//
//                        $("#freezeUnconfirmed").css("display", "block");
//                        $("#mainDisplay").css("display", "none");
//                        //$("#yourtxid").html("<a href='https://blockchain.info/tx/"+newTxid+"'>View Transaction</a>");
//                        $("#yourtxid").html("Transaction Failed!");
//                        $("#txsendstatus").html("Something is wrong, please try again later");
//                        $(".tipsendcomplete").html("<div class='h1' style='padding: 60px 0 30px 0;'>Transaction Failed!</div><div class='h4'>Something is wrong, please try again later.</div></div>");
//
//                    } else {
//
//                        $("#sendtokenbutton").html("Sent! Refresh to continue...");
//                        //$("#sendtokenbutton").prop('disabled', true);
//
//
//                        $("#freezeUnconfirmed").css("display", "block");
//                        $("#mainDisplay").css("display", "none");
//                        //$("#yourtxid").html("<a href='https://blockchain.info/tx/"+newTxid+"'>View Transaction</a>");
//                        $("#yourtxid").html("<a href='https://chain.so/tx/BTC/"+txid+"'>View Transaction</a>");
//                        $("#txsendstatus").html("Balance will update after one confirmation");
//                        $(".tipsendcomplete").html("<div class='h1' style='padding: 60px 0 30px 0;'>Send Complete!</div><div class='h4'>Token balances update in wallet after one confirmation</div><hr><div class='h2'><a href='https://chain.so/tx/BTC/"+txid+"'>View Transaction</a></div>");
//
//                    }
//
//                    $('#allTabs a:first').tab('show');
//                
//                });
                
            }
            
            
            
        }
        
       
        
        
        
        
    } else {
        
        $("#dex-order-message").html("");
        $("#createDexOrder").html("Create Order");
        $("#createDexOrder").addClass("btn-success");
        $("#createDexOrder").removeClass("btn-info");
        $("#giveQuantityInput").val("0");
        $("#getQuantityInput").val("0");
        $("#getAssetInput").val("");
        $("#getExpirationInput").val("100");
        
    }
        
    
});

    
$("#openOrdersDex").click(function(){    
    
    var pubkey = $("#dexOpenOrdersAddress").val();  
    refreshOpenOrdersDex(pubkey);
    
    $("#dexOptions").hide();
    $("#dexOpenOrders").show();

})

$("#dexOpenOrdersAddress").change(function(){     

    var pubkey = $("#dexOpenOrdersAddress").val();   
    refreshOpenOrdersDex(pubkey);
    
});
    
    $("#buynewDex").click(function(){
        
        $("#dexOptions").hide();
        $("#dexOrderRate").html("");
        $("#giveQuantityInput").val("0");
        $("#getQuantityInput").val("0");
        $("#getAssetInput").val("");
        $("#dexBuyOrder").show();
        $("#dexBuyOrder").data("order", "");
        
    });
    
    $("#browseDexOrders").click(function(){
        
        $("#dexOptions").hide();
        $("#dexViewMarket").show();
        $("#dexMarketAssets-loading").show();

        $("#dexMarketAssets").html("");
        
        
          
        getMarketsList(true, function(markets){
            
            $("#dexMarketAssets-loading").hide();
            
            chrome.storage.local.get(function(data) {
            
              //  console.log(markets);
    //            i: Object
    //                base_asset: "GUERILLA"
    //                base_divisibility: 1
    //                market_cap: "50000000000.0000"
    //                pos: 10
    //                price: "0.01000000"
    //                price_24h: "0.25000000"
    //                progression: "-96.00"
    //                quote_asset: "XCP"
    //                quote_divisibility: true
    //                supply: 5000000000000
    //                trend: -1
    //                volume: 500000000
    //                with_image: false


                for(var i = 0; i < markets.length; i++){



    //                markets[i].base_asset
    //                quote_asset
    //                quote_divisibility
    //                price

                    if(markets[i].quote_divisibility == true) {

                        var truevolume = markets[i].volume / 100000000;

                    } else {

                        var truevolume = markets[i].volume;

                    }
                    
                    var marketprice = "";
                    
                    var volumeprice = "";
                    
                  //  console.log(data.assetrates.length);
                    
                    for(var j = 0; j < data.assetrates.length; j++) {
  
                        if(data.assetrates[j].assetname == markets[i].quote_asset) {
                    
                            var assetprice = parseFloat(data.assetrates[j].assetprice);
                            var price = parseFloat(markets[i].price);
                            
                            var volumeusd = (truevolume*assetprice).toFixed(2);
                            
                            //console.log(volumeusd);
                            
                            var assetusd = (assetprice*price).toFixed(2);
                            
                            marketprice = markets[i].price+" "+markets[i].quote_asset+" ($"+assetusd+")";
                            
                            volumeprice = truevolume+" "+markets[i].quote_asset+" ($"+volumeusd+")";
                            
                        }
                    
                    };
                    
                    if(marketprice.length == 0) {
                        
                        marketprice = markets[i].price;
                        
                    }
                    
                    if(volumeprice.length == 0) {
                        
                        volumeprice = truevolume;
                        
                    }


                    $("#dexMarketAssets").append("<tr class='dexMarketSingle' data-base_asset='"+markets[i].base_asset+"' data-quote_asset='"+markets[i].quote_asset+"' data-quote_divisibility='"+markets[i].quote_divisibility+"'><td><div align='center' style='color: #000; background-color: #fff; padding: 5px; border-radius: 5px;'><img src='http://counterpartychain.io/content/images/icons/"+markets[i].base_asset.toLowerCase()+".png' width='46' height='46'><div style='padding-top: 4px;'>"+markets[i].base_asset+"</div></div></td><td style='background-color: #000;'><div><div><span style='text-decoration: underline; font-size: 10px;'>Last Price:</span><br><span style='color: #fff;'>"+marketprice+"</span></div><div style='padding-top: 5px;'><span style='text-decoration: underline; font-size: 10px;'>24hr Vol:</span><br><span style='color: #fff;'>"+volumeprice+"</span></div></div></td></tr>")

                }
                                           
              
                
            })

        
        })
        
    });
//    getBuySell("BITCRYSTALS", "XCP", function(data){console.log(data);})
//    

    $(document).on("click", '.dexMarketSingle', function (event)
    {
         
        var base_asset = $(this).data("base_asset");
        var quote_asset = $(this).data("quote_asset");
        var quote_divisibility = $(this).data("quote_divisibility");
             
        var currenttoken = $(this).data("token"); 
      
        if ($( "div:contains('"+base_asset+" Order Book')" ).length) {

              $( ".orderbookbody" ).remove(); 

        } else {
      
            if ($('.orderbookbody').length) {

                $( ".orderbookbody" ).remove(); 

            } 

            var row = $(this).closest('tr');

            $("<tr class='orderbookbody'><td colspan='3'><div class='lead' style='text-align: center; width: 100%; color: #fff; margin: 17px 0 0 0; padding: 3px 3px 20px 3px; font-size: 16px;'>"+base_asset+" Order Book</div><div class='MarketSingleOrders' style='width: 100%; margin: auto; text-align: center;'><div style='padding: 20px 20px 50px 20px; color: #fff;'><i class='fa fa-cog fa-spin fa-5x'></i></div></div></td></tr>").insertAfter(row);


            getBuySell(base_asset, quote_asset, function(orders){
             //   console.log(orders);
                
 
                var orderbook_body = "<tr><td colspan='3'>";
                
                var orderbook_body_sell = "<table class='table table-hover' style='background-color: #000;'><thead><tr><th>Price</th><th>"+base_asset+"</th><th>"+quote_asset+"</th></tr></thead><tbody class='dex-single-order' style='cursor: pointer;'>";
                   
                var orderbook_body_buy = "<table class='table table-hover' style='background-color: #000;'><thead><tr><th>Price</th><th>"+base_asset+"</th><th>"+quote_asset+"</th></tr></thead><tbody class='dex-single-order' style='cursor: pointer;'>";
          
//0: Object
    //amount: 289625145978
    //price: "0.05550001"     XCP / base_asset
    //total: 16074198000      XCP
    //type: "SELL"
    
    
                checkDivisibility(base_asset, function(divisible){
                    
                        orderbook_body_buy_array = new Array();
          
                      $.each(orders, function(i, item) {
                          
                          if(divisible == "true") {
                              var order_amount = orders[i].amount / 100000000;
                          } else {
                              var order_amount = orders[i].amount;
                          }
                          
                          if(quote_divisibility == true) {
                              var order_total = orders[i].total / 100000000;
                          } else { 
                              var order_total = orders[i].total;
                          }
                          
                          var order_price = parseFloat(orders[i].price);
                          

                          if(orders[i].type == "SELL") {

                              orderbook_body_sell += "<tr class='single-order-dex' style='text-align: left;' data-order_price='"+order_price+"' data-order_amount='"+order_amount+"' data-order_total='"+order_total+"' data-base_asset='"+base_asset+"' data-quote_asset='"+quote_asset+"' data-order_type='sell'><td>"+order_price+"</td><td>"+order_amount+"</td><td>"+order_total+"</td></tr>";

                          } else if(orders[i].type == "BUY") {
                              
                              orderbook_body_buy_array = orderbook_body_buy_array.concat({order_price: order_price, order_amount: order_amount, order_total: order_total}); 

                          }


                      });
                    
                    
                        var reverse_buy_array = orderbook_body_buy_array.reverse();
                    
                        $.each(reverse_buy_array, function(i, item) {
                            
                            orderbook_body_buy += "<tr class='single-order-dex' style='text-align: left;' data-order_price='"+reverse_buy_array[i].order_price+"' data-order_amount='"+reverse_buy_array[i].order_amount+"' data-order_total='"+reverse_buy_array[i].order_total+"' data-base_asset='"+base_asset+"' data-quote_asset='"+quote_asset+"' data-order_type='buy'><td>"+reverse_buy_array[i].order_price+"</td><td>"+reverse_buy_array[i].order_amount+"</td><td>"+reverse_buy_array[i].order_total+"</td></tr>";
                            
                        });
                    
                    
                    
                    orderbook_body_buy += "</tbody></table>";
                    orderbook_body_sell += "</tbody></table>";

                    orderbook_body += "<div class='row'><div class='col-xs-12'><div>Sell Orders</div><div>"+orderbook_body_sell+"</div></div><div class='col-xs-12'><div>Buy Orders</div><div>"+orderbook_body_buy+"</div></div></td></tr>";

                    $( ".MarketSingleOrders").html(orderbook_body);


                });

                
                
                
            })
      
        }
      
  });
    
$(document).on("click", '.cancel-order-dex', function (event)
    {    
                
                $(this).html("<i class='fa fa-cog fa-spin'></i>");
                $(this).prop('disabled', true);
        
                var txid = $(this).data("txid");
                
                var pubkey = $("#dexOpenOrdersAddress").val();

                var minersfee = 0.0001;
                
                var mnemonic = $("#newpassphrase").html();
                
                cancelOrder_opreturn(pubkey, txid, minersfee, mnemonic, function(){

                    $('#allTabs a:first').tab('show');
                
                });
        
    });
    
    
    $(document).on("click", '.single-order-dex', function (event)
    {
    
        var order_price = $(this).data("order_price");
        var order_amount = $(this).data("order_amount");
        var order_total = $(this).data("order_total");
        var order_type = $(this).data("order_type");
        var base_asset = $(this).data("base_asset");
        var quote_asset = $(this).data("quote_asset");
        
        $("#dexBuyOrder").data("order", { order_price: order_price, order_amount: order_amount, order_total: order_total, order_type: order_type, base_asset: base_asset, quote_asset: quote_asset })
        
        $("#dexOrderRate").html("Rate: "+order_price+" "+quote_asset+"/"+base_asset);
        
        console.log(order_price);
        console.log(order_amount);
        console.log(order_total);
        console.log(order_type);
        console.log(base_asset);
        console.log(quote_asset);
        
        if(order_type == "sell") {
            
            
            
            $("#giveQuantityInput").val(order_total)
            $("#getQuantityInput").val(order_amount)
            $("#getAssetInput").val(base_asset)
            $("#dexSellAssets").val(quote_asset)

            if($("#dexSellAssets").data(quote_asset) == undefined) {
                $("#sellAssetBal").html("Balance: 0");
                $("#dexSellAssets").data(quote_asset, { bal: 0 });
                
                $("#dexSellAssets").append("<option label='"+quote_asset+"'>"+quote_asset+"</option>");
                $("#dexSellAssets").val(quote_asset)
            } else {
                var assetbalance = $("#dexSellAssets").data(quote_asset).bal;
                $("#sellAssetBal").html("Balance: "+assetbalance)
            }

        } else {
            

            
            $("#giveQuantityInput").val(order_amount)
            $("#getQuantityInput").val(order_total)
            $("#getAssetInput").val(quote_asset)
            $("#dexSellAssets").val(base_asset)
            
            if($("#dexSellAssets").val() == undefined) {
                $("#sellAssetBal").html("Balance: 0");
                $("#dexSellAssets").data(base_asset, { bal: 0 });
                
                $("#dexSellAssets").append("<option label='"+base_asset+"'>"+base_asset+"</option>");
                $("#dexSellAssets").val(base_asset) 
            } else {
                var assetbalance = $("#dexSellAssets").data(base_asset).bal;
                $("#sellAssetBal").html("Balance: "+assetbalance)
            }
            
        }

        $("#dexViewMarket").hide();
        $("#dexBuyOrder").show();

    
    });  
    
        $(document).on("keyup", '#giveQuantityInput', function (event)
    { 
        
        var order = $("#dexBuyOrder").data("order");
        
        //console.log(order);
        
        var sell_asset = $("#dexSellAssets").val();
        var buy_asset = $("#getAssetInput").val();
        
        
        if(order != undefined) {
            
            //0: Object
                //amount: 289625145978
                //price: "0.05550001"     XCP / base_asset
                //total: 16074198000      XCP
                //type: "SELL"
            
            //$("#dexBuyOrder").data("order", { order_price: order_price, order_amount: order_amount, order_total: order_total, order_type: order_type, base_asset: base_asset, quote_asset: quote_asset }

            var entered = $(this).val();
            
            if(sell_asset == order.quote_asset && buy_asset == order.base_asset){
                
                var price = ((entered / order.order_price)).toFixed(8); 
                
            } else if(sell_asset == order.base_asset && buy_asset == order.quote_asset) {
                
                var price = ((entered * order.order_price)).toFixed(8); 
                
            }
            
            
            if (sell_asset == order.quote_asset && buy_asset == order.base_asset && order.order_type == "sell" || sell_asset == order.base_asset && buy_asset == order.quote_asset && order.order_type == "buy") {
            
                if(order.order_type == "buy" && entered < order.order_amount || order.order_type == "sell" && entered < order.order_total) 
                {
                    $("#dexOrderRate").html("");
                    $("#getQuantityInput").val(price);
                    $("#dexOrderRate").html("Rate: "+order.order_price+" "+order.quote_asset+"/"+order.base_asset);
                } else {
                    $("#dexOrderRate").html("Exceeds Order Amount");
                } 

            } else {
                $("#dexOrderRate").html("");
            }

        }
        
    });
    
   
   $(document).on("click", '.orderDetailsBlockscan', function (event) {
        
     var txid = $(this).data("txid")
        
     var url = "http://blockscan.com/tx?txhash="+txid;    
        
     chrome.tabs.create({url: url});
     
   });
    
            
      
       
});