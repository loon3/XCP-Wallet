

function getpubkey(addr, callback){
    


        $.getJSON("https://crossorigin.me/https://blockchain.info/rawaddr/"+addr, function(data){
            
            if(data.total_sent > 0){

                for(var i = 0; i < data.txs.length; i++){

                    if(data.txs[i].inputs[0].prev_out.addr == addr) {

                        var pubkey = data.txs[i].inputs[0].script.slice(-66);

                        $("body").data("pubkey", pubkey);

                        callback(pubkey);

                    }

                }


            } else {
                
                callback("error");
                
            }

        })
    

        
}

function encryptECIES(sender_priv, receiver_pub, message, callback) {

    var aliceKey = bitcore.PrivateKey.fromWIF(sender_priv);

    var bobpub = bitcore.PublicKey.fromString(receiver_pub)

    //alice encrypts message that can only be read by bob's public key
    var alice = ECIES().privateKey(aliceKey).publicKey(bobpub);

    var encrypted = alice.encrypt(message); //encrypted buffer
    var encrypted_hex = encrypted.toString('hex'); //convert buffer to hex for transmission
  
    callback(encrypted_hex);
  
}

function decryptECIES(receiver_priv, encrypted_message, callback) {
    
    var sender_pub = encrypted_message.substr(0, 66);
    
    var bobKey = bitcore.PrivateKey.fromWIF(receiver_priv);
    var alicepub = bitcore.PublicKey.fromString(sender_pub);  
    
    var encrypted_buffer = bitcore.util.buffer.hexToBuffer(encrypted_message); //convert hex to buffer
    
    //bob decrypts message from alice using alice's public key and his private key
    var bob = ECIES().privateKey(bobKey).publicKey(alicepub);
    var decrypted = bob.decrypt(encrypted_buffer).toString();
    
    callback(decrypted);
    
}

function seedMessage(sender, receiver_hex, message, callback) {
     
    //v2 webtorrent infohash
    var blob = new Blob([message], {type: "text/plain"});
    console.log(blob);

    var client = new WebTorrent()    

    client.seed(blob, {name: "message.txt"}, function (torrent) {

        var hash = "WT:"+torrent.infoHash;
        
        encryptECIES(sender, receiver_hex, hash, function(encryptedhash){
        
            console.log("Seeding "+hash);

            $("#message-sent-window").html("Sending Message... <br>"+encryptedhash);

            $("#message-sent-window").show();
            
        });
        
    })

}

function sendMessage(add_from, add_to, message, msig_total, btc_total, transfee, mnemonic, msig_outputs, callback) {
       
    var privkey = getprivkey(add_from, mnemonic);
     
    var source_html = "https://"+INSIGHT_SERVER+"/api/addr/"+add_from+"/utxo";
    var total_utxo = new Array();   
       
    $.getJSON( source_html, function( data ) {
        
        var amountremaining = parseFloat(btc_total) + parseFloat(msig_total) + parseFloat(transfee);
        
        if (msig_outputs > 1) {
        
            amountremaining += ((msig_outputs - 1) * msig_total);
        
        }
        
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
        
        //4543494553 = ECIES (hex)
        
        var messagelength = message.length/2;
        var messagelength_hex = messagelength.toString(16);
            
        var datachunk_unencoded_pre = "4543494553"+messagelength_hex+message;
        
        console.log(datachunk_unencoded_pre);
        
        var datachunk_1 = datachunk_unencoded_pre.substr(0,124);
        var datachunk_2 = padtrail(datachunk_unencoded_pre.substr(124), 124);
        
        var datachunk_unencoded = [datachunk_1, datachunk_2];
        
        if (datachunk_unencoded != "error") {
                   
                var sender_pubkeyhash = new bitcore.PublicKey(bitcore.PrivateKey.fromWIF(privkey));

                var transaction = new bitcore.Transaction();

                for (i = 0; i < total_utxo.length; i++) {
                    transaction.from(total_utxo[i]);
                }

                var msig_total_satoshis = parseFloat((msig_total * 100000000).toFixed(0));

                var first_datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded[0]);
                var first_address_array = addresses_from_datachunk(first_datachunk_encoded);

                var second_datachunk_encoded = xcp_rc4(utxo_key, datachunk_unencoded[1]);
                var second_address_array = addresses_from_datachunk(second_datachunk_encoded);

                var first_scriptstring = "OP_1 33 0x"+first_address_array[0]+" 33 0x"+first_address_array[1]+" 33 0x"+sender_pubkeyhash+" OP_3 OP_CHECKMULTISIG";
                console.log(first_scriptstring);
                var first_data_script = new bitcore.Script(first_scriptstring);

                var second_scriptstring = "OP_1 33 0x"+second_address_array[0]+" 33 0x"+second_address_array[1]+" 33 0x"+sender_pubkeyhash+" OP_3 OP_CHECKMULTISIG";
                console.log(second_scriptstring);
                var second_data_script = new bitcore.Script(second_scriptstring);

                var xcpdata_msig_first = new bitcore.Transaction.Output({script: first_data_script, satoshis: msig_total_satoshis});
                var xcpdata_msig_second = new bitcore.Transaction.Output({script: second_data_script, satoshis: msig_total_satoshis}); 

                var btc_total_satoshis = parseFloat((btc_total * 100000000).toFixed(0));
                
                transaction.to(add_to, btc_total_satoshis);            
                
                transaction.addOutput(xcpdata_msig_first);
                transaction.addOutput(xcpdata_msig_second);
            


                if (satoshi_change > 5459) {
                    transaction.to(add_from, satoshi_change);
                }

                transaction.sign(privkey);

                var final_trans = transaction.serialize();
                    
        } else {

                var final_trans = "error";

        }

        console.log(final_trans);

        sendBTCpush(final_trans);  //uncomment to push raw tx to the bitcoin network

        callback();

    });
    
}



function get_message_encoded(tx_id, mnemonic, callback) {
    
    var source_html = "https://blockchain.info/rawtx/"+tx_id+"?format=json&cors=true";
    
    var target_tx = new Array(); 
     
    $.getJSON( source_html, function( target_tx ) {
        
        var sender_addr = target_tx.inputs[0].prev_out.addr;
        
        var sender_pub = (target_tx.inputs[0].script).substr(-66);
        
        var receiver_addr = target_tx.out[0].addr;
        
        var tx_index = target_tx.inputs[0].prev_out.tx_index;
        
        var source_html_tx_index = "https://blockchain.info/tx-index/"+tx_index+"?format=json&cors=true";
    
        $.getJSON( source_html_tx_index, function( data ) {

            var xcp_decoded = ""; 
            
            $.each(target_tx['out'], function(i, item) {
            
                if ("addr3" in target_tx['out'][i]){
                    var target_script = target_tx['out'][i].script;
                    var haystack = target_script;

                    var finddata = haystack.substring(68, 6);
                
                    finddata += haystack.substring(136, 74);
    
                    var xcp_pubkey_data = finddata;
                    var xcp_pre = xcp_rc4(data.hash, xcp_pubkey_data);
                    
                    xcp_decoded += xcp_pre
                    
                    //console.log(xcp_pre);   

                }
            
            
            });
            
            if(xcp_decoded.length > 0) {
            
                var type = xcp_decoded.substr(0,10);
                var type_text = hex2bin(type);

                if(type_text == "ECIES") {

                    var length = xcp_decoded.substr(10,2);
                    var length_num = hexToDec(length);
                    var message = xcp_decoded.substr(12,length_num*2);

                    var privkey = getprivkey(receiver_addr, mnemonic);
                    var encrypted_message = sender_pub + message;

                    decryptECIES(privkey, encrypted_message, function(unencrypted){

                        callback(unencrypted, sender_addr);

                    })
                    
                }
                
            }
            
        });
            
    });
        
}


//function findMessages(add) {
//    
//    var mnemonic = $("#newpassphrase").html();
//    
//    var source_html = "http://btc.blockr.io/api/v1/address/txs/"+add;
//    
//    $.getJSON( source_html, function( data ) {
// 
//        $.each(data.data.txs, function(i, item) {
//            
//            var tx = data.data.txs[i]["tx"];          
//            var time_utc = data.data.txs[i]["time_utc"];
//            var confirmations = data.data.txs[i]["confirmations"];
//            var amount = data.data.txs[i]["amount"];
//            
//            if (amount == 0.0000547) {
//          
//                    get_message_encoded(tx, mnemonic, function(message){
//
//                         console.log(message);
//
//                    }) 
//                
//            }
//            
//        });
//
//        
//    });
//    
//    
//}

