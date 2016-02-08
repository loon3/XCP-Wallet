// function bulkSeed (files, callback) {
//  var index = 0
//  function seeder () {
//    client.seed(files[index], function onseed (torrent) {
//    // do something with torrent
//    if (index < files.lenght) {
//      seeder()
//      index ++
//      }
//      else callback()
//    })
//    }
//    }

//"scripts": [ "js/content.js", "js/jquery.min.js", "js/bitcoinjs-min.js", "js/webtorrent/webtorrent.min.js", "js/webtorrent/bvam-seed.js" ]






function startWebTorrents() {
    
    chrome.storage.local.get(function(data) {

        var enabled = data["bvamwt_enabled"];

        if (enabled == "yes") {
            
         //$("#seedinfo").append("<br>calculating local bvam infohashes...");

         chrome.storage.local.get(function(data) {

            if(typeof(data["bvam"]) !== 'undefined') { 
                
                var jsontoseed = new Array();

                var allbvam = data["bvam"];
                
                var k = 0;

                for (var i = 0; i < allbvam.length; i++) {

                    var type = allbvam[i]["type"];

                    if (type == "BVAMWT") {

                        var filename_base58 = allbvam[i]["hash"];

                        var filename_base58_decode = Bitcoin.Base58.decode(filename_base58)
                        var hash = Crypto.util.bytesToHex(filename_base58_decode)

                        //$("#seedinfo").append("<br>"+hash);

                        var assetid = allbvam[i]["data"]["asset"];
                        var assetname = allbvam[i]["data"]["assetname"];
                        var assetdesc = allbvam[i]["data"]["assetdescription"];
                        var assetweb = allbvam[i]["data"]["assetwebsite"];

                        var ownername = allbvam[i]["data"]["ownername"];
                        var ownertwitter = allbvam[i]["data"]["ownertwitter"];
                        var owneraddress = allbvam[i]["data"]["owneraddress"];

                        var prejsonform = {ownername: ownername, ownertwitter: ownertwitter, owneraddress: owneraddress, asset: assetid, assetname: assetname, assetdescription: assetdesc, assetwebsite: assetweb};

                        //var filename = "BVAMWT.json";

                        var jsonstring = JSON.stringify(prejsonform);
                        

                        jsontoseed[k] = jsonstring;
                        
                        k++;

                    }

                }
                
                //$("#seedinfo").append(jsontoseed);
                
                (function TorrentLoop (i) {          
                   
                  torrentfunc = setTimeout(function () {   
                       
                        jsonstring = jsontoseed[i-1];
                      
                        var jsondata = JSON.parse(jsonstring);
                      
                        console.log(jsondata);
    
                        var asset = jsondata["asset"];
                        var assetname = jsondata["assetname"];
                                            
                        var blob = new Blob([jsonstring], {type: "application/json"});
                
                        client.seed(blob, {name: "BVAMWT.json"}, function (torrent) {

                             $("#seedinfo").append('<div>Client is seeding ' + asset + " - " + assetname + " - <a href='https://instant.io/#" + torrent.infoHash + "'>" + torrent.infoHash + "</a></div>");


                            torrent.on('wire', function (wire, addr) {
                                $("#seedinfo").append('<br>' + torrent.infoHash + ' connected to peer with address ' + addr);
                            })     
        
                        })   

                       if (--i) TorrentLoop(i);  
                       
                   }, 250)
                })(jsontoseed.length);  
                
                
                $("#seedinfo").append("<br>start seeding!");

               

            }



         })


        } 

    })
    
}

function seedNewTorrent(bvam){
    
    var jsondata = JSON.parse(bvam);
    
    var asset = jsondata["asset"];
    var assetname = jsondata["assetname"];
    
    var blob = new Blob([bvam], {type: "application/json"});
                
    client.seed(blob, {name: "BVAMWT.json"}, function (torrent) {

        $("#seedinfo").append('<div>Client is seeding ' + asset + " - " + assetname + " - <a href='https://instant.io/#" + torrent.infoHash + "'>" + torrent.infoHash + "</a></div>");
        
        torrent.on('wire', function (wire, addr) {
            $("#seedinfo").append('<br>' + torrent.infoHash + ' connected to peer with address ' + addr);
        })     

    })   
   
}



//chrome.runtime.onMessage.addListener(
//    function(request) {
//        
//        if (request.bvamwt == "seed_new") {
//            
//            //$("#seedinfo").append(request.bvamjson);
//            
//            var newbvam = request.bvamjson;
//            
//            var jsondata = JSON.stringify(newbvam);
//
//            seedNewTorrent(jsondata);
//
//        }
//        
//        if (request.bvamwt == "end") {
//
//            if (typeof(client) !== undefined) {
//                
//                clearTimeout(torrentfunc);
//
//                //$("#seedinfo").append(client.torrents);
//
//                client.destroy(function () {
//
//                    $("#seedinfo").append("<br>client destroyed!");
//
//                })   
//
//            } 
//
//        } 
//        
//    }
//);
//
//
//
//var client = new WebTorrent();
//
//startWebTorrents();
//
//setTimeout(function(){
//    
//        chrome.tabs.getCurrent(function(tab) {
//            chrome.tabs.reload(tab.id, function() { });
//        });
//    
//    
//    
//    }, 60000);
//
//$( document ).ready(function() { 
//    
//     $(document).on("click", 'a', function (event)
//        {
//            event.preventDefault();
//            chrome.tabs.create({url: $(this).attr('href')});
//            
//        })
//     
//    
//});

//setInterval(function(){
//    
//        chrome.tabs.getCurrent(function(tab) {
//            
//            chrome.processes.getProcessIdForTab(tab.id, function(processId) { 
//                
//                chrome.processes.getProcessInfo(processId, function(processes) {
//                    
//                    console.log(processes);
//     
//                });
//               
//            });
//            
//        });
//    
//    }, 5000);