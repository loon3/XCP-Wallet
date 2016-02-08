var bitcore = require('bitcore');
var INSIGHT_SERVER = getInsightServer();

//unit test
//---------

//var data_chunk = xcp_rc4("59f88c1b996ea76f65d8ee308317f7bad1e360924f35820af935ce22c543b4e7", "4949941ae8a5f77b3c0388704a5612708927605de18d9fb9d03161fab883cddd2908e16c816fe1fbe97184f92bd6752e1ffc7c30f8fdac9617ae48c0758bb66ad6ed3306d1d5ce80768a");
//
//var data_chunk2 = create_issuance_data_opreturn("COUPONBOOK", 0, false, ";;rA11102651893268768391cFREECOFFEE");
//
//console.log(data_chunk);
//console.log(data_chunk2);


function ajax_issue_test(url, data, rawtx) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            alert(xhr.responseText);
            
            xhr.close;
        }
    }
    xhr.open(data ? "POST" : "GET", url, true);
    if (data) xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(data);
}


function sendBTCissue_test(hextx) {
    
    url = 'https://chain.so/api/v2/send_tx/BTC';
    postdata = 'tx_hex=' + hextx;
    
    if (url != null && url != "")
    {
        ajax_issue_test(url, postdata, hextx);
    }
}
   
$( document ).ready(function() {
    

    
    
    
//    findSubassetGrand("A11195036174647799399", function(subasset) {
//        
//       
//            console.log(subasset);
//            
//       
//    });

    
    $( "#txtype" ).change(function () {

        var txtype = $("#txtype").val();
        
        if(txtype == "child"){
            $("#reference_asset").val("");
            $("#child_asset").val("");
        } else {
            $("#parent_asset").val("");
        }
    
        $("#childinputs").toggle();
        $("#parentinputs").toggle();

    })
    
    $("#sendraw").click(function(){
        
                    
            var final_trans = $("#raw").html();

            sendBTCissue_test(final_trans);
        
    });
          
    $("#gettransbutton").click(function(){
    
        var mnemonic = $("#mnemonic").val();
    
        var add_from = $("#add_from").val();  // issuing address  
        var assetid = $("#asset").val();
        var quantity = $("#asset_total").val();
        
        var txtype = $("#txtype").val();
        
        var reference = $("#reference_asset").val();
        var child = $("#child_asset").val();
        var parent = $("#parent_asset").val();
        
        if (reference.length > 0 && child.length > 0) {
        
            var description = ";;r"+reference+"c"+child;
            var quantity = 0;
            
        } else if (parent.length > 0) {
        
            var description = ";;p"+parent;
            
        }
        
        var divisible = $("#divisible").val();

        var transfee = 0.0001;  //bitcoin tx fee
        
        createIssuance_opreturn(add_from, assetid, quantity, divisible, description, transfee, mnemonic) 
    });
});
