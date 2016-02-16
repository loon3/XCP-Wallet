//434e545250525459  = CNTRPRTY prefix (hex to text)
//0000000a          = Transaction ID = 10 (hex to dec)
//00098b174a7d3945  = Asset to Sell = 2686206940625221 = TATIANACOIN (hex to dec)
//00000022ecb25c00  = Amount to Sell = 150000000000 (hex to dec)
//0000000000000001  = Asset to Buy = 1 = XCP (hex to dec)
//0000000035a4e900  = Amount to Buy = 900000000 (hex to dec)
//03e8              = Expiration = 1000 blocks (hex to dec)

function getOrdersAddr(addr, callback) {
    
    var source_html = "http://joelooney.org/xcp-wallet/orders.php?addr="+addr;
    
    $.getJSON( source_html, function( data ) {
        
       //var data = "hey" 
        callback(data);
    
        
    });
    
}

function refreshOpenOrdersDex(pubkey) {
    
    $("#dexOpenOrdersTable-loading").show();
    $("#dexOpenOrdersTable").html("");
 
    getOrdersAddr(pubkey, function(data){

        console.log(data);
        
        $("#dexOpenOrdersTable-loading").hide();
        
        
        for(var i = 0; i < data.length; i++) {
         
//                "give_asset": "LTBCOIN",
//                "fee_provided_remaining": 20000,
//                "get_remaining": 1600000000,
//                "get_asset": "XCP",
//                "tx_hash": "3a0c283c8574205c2cc95cea0e603bfff9087af2ab0360ebd2e98740a3193a18",
//                "block_index": 308799,
//                "fee_required": 0,
//                "fee_provided": 20000,
//                "status": "cancelled",
//                "give_remaining": 15532064576,
//                "get_quantity": 1600000000,
//                "give_quantity": 15532064576,
//                "fee_required_remaining": 0,
//                "tx_index": 20647,
//                "source": "1GcFhAQGFZVDAr4jiR2tKwisHcgNUjhGNC",
//                "expire_index": 309799,
//                "expiration": 1000
            
            if (data[i].status == "open") {
            
            
            
                var content = "<tr><td>"+data[i].give_asset+"</td><td>"+data[i].get_asset+"</td><td>"+data[i].status+"</td><td><div style='padding: 4px; width: 100%;'><button class='orderDetailsBlockscan btn btn-block btn-xs btn-primary' data-txid='"+data[i].tx_hash+"'>Details</button></div><div style='padding: 4px; width: 100%;'><button class='cancel-order-dex btn btn-block btn-xs btn-danger' type='button' data-txid='"+data[i].tx_hash+"'>Cancel</button></div></td></tr>";
                
                
            
            } else {
                
                var content = "<tr><td>"+data[i].give_asset+"</td><td>"+data[i].get_asset+"</td><td>"+data[i].status+"</td><td><div style='padding: 4px; width: 100%;'><button class='orderDetailsBlockscan btn btn-block btn-xs btn-primary' data-txid='"+data[i].tx_hash+"'>Details</button></div></td></tr>";
                
            }
            
            $("#dexOpenOrdersTable").append(content);
            
        }
        
        
        
    })
    
    
}



function getBuySell(asset1, asset2, callback){

    var url = "http://public.coindaddy.io:4100/api/";


    var request = {
      "method": "get_market_orders",
      "params": {"asset1": asset1, 
                 "asset2": asset2, 
                 "addresses": [], 
                 "min_fee_provided": 0, 
                 "max_fee_required": 0
                },
      "jsonrpc": "2.0",
      "id": 0,
    }
    
 

    $.post(url, JSON.stringify(request), function(response){
    
        if (response.result) {
            //success!
            
                callback(response.result);
        } else if (response.error) {
            //error!
            
                console.log("Search error: " + response.error.message);
        }
    
    }, "json");

}


function getMarketsList(active, callback) {
 

    var url = "http://public.coindaddy.io:4100/api/";


    var request = {
      "method": "get_markets_list",
      "params": {},
      "jsonrpc": "2.0",
      "id": 0,
    }
    
 

    $.post(url, JSON.stringify(request), function(response){
    
        if (response.result) {
            //success!
            
            var markets = response.result;
            
            if(active == true){
                
                var activemarkets = new Array();
                
                for(var i = 0; i < markets.length; i++){
                    
                    if(markets[i].volume > 0) {
                        
                        var addmarket = markets[i]
                        
                        activemarkets = activemarkets.concat(markets[i]);
                        
                    }
                    
                }
                
                callback(activemarkets);
                
            } else {
                
                callback(markets);
                
            }
            

        } else if (response.error) {
            //error!
            
                console.log("Search error: " + response.error.message);
        }
    
    }, "json");
    
}



function create_order_data(sell_asset, sell_qty, buy_asset, buy_qty, expiration, callback){
    
    var prefix = "434e5452505254590000000a"; //CNTRPRTY + transaction id (10)

    var sell_asset_id = assetid(sell_asset); 
    var buy_asset_id = assetid(buy_asset); 
    
    var sell_asset_id_hex = padprefix(sell_asset_id, 16);
    var buy_asset_id_hex = padprefix(buy_asset_id, 16);
    
    if(expiration > 0 && expiration < 65535) {
        var expiration_hex = padprefix(parseInt(expiration).toString(16),4);
    } else {
        //default to 1000 blocks if out of allowable range
        var expiration_hex = padprefix((1000).toString(16),4);
    }
    
    checkDivisibility(sell_asset, function(sell_asset_div){
    
        if(sell_asset_div == "true"){
            sell_qty = sell_qty * 100000000;
        } else {
            sell_qty = sell_qty.toFixed(0);
        }
        
        checkDivisibility(buy_asset, function(buy_asset_div){
            
            if(buy_asset_div == "true"){
                buy_qty = buy_qty * 100000000;
            } else {
                buy_qty = parseInt(buy_qty);
            } 
    
            var sell_qty_hex = padprefix((parseInt(sell_qty)).toString(16), 16);
            var buy_qty_hex = padprefix((parseInt(buy_qty)).toString(16), 16);
            
            
            console.log("sell_asset: "+sell_asset_id_hex)
            console.log("sell_qty: "+sell_qty_hex)
            console.log("buy_asset: "+buy_asset_id_hex)
            console.log("buy_qty: "+buy_qty_hex)
            console.log("expiration: "+expiration_hex)
                               
            var data = prefix + sell_asset_id_hex + sell_qty_hex + buy_asset_id_hex + buy_qty_hex + expiration_hex + "0000000000000000";
            
            console.log(data)
    
            callback(data);
            
        })
    
    })
    
   
}


function createOrder_opreturn(add_from, sell_asset, sell_qty, buy_asset, buy_qty, expiration, transfee, mnemonic, callback) {
    
    var privkey = getprivkey(add_from, mnemonic);
     
    var source_html = "https://"+INSIGHT_SERVER+"/api/addr/"+add_from+"/utxo";     
    
    var total_utxo = new Array();   
       
    $.getJSON( source_html, function( data ) {
        
        var amountremaining = (parseFloat(transfee)*100000000)/100000000;
        
        console.log(amountremaining);
        
        data.sort(function(a, b) {
            return b.amount - a.amount;
        });
        
        $.each(data, function(i, item) {
            
             var txid = data[i].txid;
             var vout = data[i].vout;
             var script = data[i].scriptPubKey;
             var amount = parseFloat(data[i].amount);
             
             amountremaining = amountremaining - amount;            
             amountremaining.toFixed(8);
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
            
             total_utxo.push(obj);
              
             //dust limit = 5460 
            
             if (amountremaining == 0 || amountremaining < -0.00005460) {                                 
                 return false;
             }
             
        });
    
        var utxo_key = total_utxo[0].txid;
        
        if (amountremaining < 0) {
            var satoshi_change = -(amountremaining.toFixed(8) * 100000000).toFixed(0);
        } else {
            var satoshi_change = 0;
        }
        
        console.log(buy_qty);
        console.log(expiration);
        
        create_order_data(sell_asset, sell_qty, buy_asset, buy_qty, expiration, function(datachunk_unencoded){
        
            if (datachunk_unencoded != "error") {
                
                var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);

                var bytelength = datachunk_encoded.length / 2;
                
                var scriptstring = "OP_RETURN "+bytelength+" 0x"+datachunk_encoded;      
                console.log(scriptstring);
                
                var data_script = new bitcore.Script(scriptstring);
                var transaction = new bitcore.Transaction();

                for (i = 0; i < total_utxo.length; i++) {
                    transaction.from(total_utxo[i]);     
                }

                console.log(total_utxo);

                var xcpdata_opreturn = new bitcore.Transaction.Output({script: data_script, satoshis: 0}); 

                transaction.addOutput(xcpdata_opreturn);

                console.log(satoshi_change);

                if (satoshi_change > 5459) {
                    transaction.change(add_from);
                }

                transaction.sign(privkey);

                var final_trans = transaction.uncheckedSerialize();
             
            } else {

                var final_trans = "error";

            }

            console.log(final_trans);
            
            sendBTCpush(final_trans);  //uncomment to push raw tx to the bitcoin network
            
            callback();
            
//            sendBTCpushCB(final_trans, function(status){
//                
//                var txid = rawtotxid(final_trans);
//                
//                callback(status, txid);
//                
//            });  
            
            
        });
    
    });
    
}



function cancelOrder_opreturn(add_from, order_txid, transfee, mnemonic, callback) {
    
    var privkey = getprivkey(add_from, mnemonic);
     
    var source_html = "https://"+INSIGHT_SERVER+"/api/addr/"+add_from+"/utxo";     
    
    var total_utxo = new Array();   
       
    $.getJSON( source_html, function( data ) {
        
        var amountremaining = (parseFloat(transfee)*100000000)/100000000;
        
        console.log(amountremaining);
        
        data.sort(function(a, b) {
            return b.amount - a.amount;
        });
        
        $.each(data, function(i, item) {
            
             var txid = data[i].txid;
             var vout = data[i].vout;
             var script = data[i].scriptPubKey;
             var amount = parseFloat(data[i].amount);
             
             amountremaining = amountremaining - amount;            
             amountremaining.toFixed(8);
    
             var obj = {
                "txid": txid,
                "address": add_from,
                "vout": vout,
                "scriptPubKey": script,
                "amount": amount
             };
            
             total_utxo.push(obj);
              
             //dust limit = 5460 
            
             if (amountremaining == 0 || amountremaining < -0.00005460) {                                 
                 return false;
             }
             
        });
    
        var utxo_key = total_utxo[0].txid;
        
        if (amountremaining < 0) {
            var satoshi_change = -(amountremaining.toFixed(8) * 100000000).toFixed(0);
        } else {
            var satoshi_change = 0;
        }
        
        var datachunk_unencoded = "434e54525052545900000046"+order_txid;
        
        console.log(datachunk_unencoded);
        
        if (datachunk_unencoded.length == 88) {

            var datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded);

            var bytelength = datachunk_encoded.length / 2;

            var scriptstring = "OP_RETURN "+bytelength+" 0x"+datachunk_encoded;      
            console.log(scriptstring);

            var data_script = new bitcore.Script(scriptstring);
            var transaction = new bitcore.Transaction();

            for (i = 0; i < total_utxo.length; i++) {
                transaction.from(total_utxo[i]);     
            }

            console.log(total_utxo);

            var xcpdata_opreturn = new bitcore.Transaction.Output({script: data_script, satoshis: 0}); 

            transaction.addOutput(xcpdata_opreturn);

            console.log(satoshi_change);

            if (satoshi_change > 5459) {
                transaction.change(add_from);
            }

            transaction.sign(privkey);

            var final_trans = transaction.uncheckedSerialize();

        } else {

            var final_trans = "error";

        }

        console.log(final_trans);
        
        sendBTCpush(final_trans);  //uncomment to push raw tx to the bitcoin network

        callback();


    });
    
}


