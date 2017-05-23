$(document).ready(function() {
  $.get( "/process?status", function( data ) {
    $("#serverStatus").text(data.status);
  });


 $("#startCtrl").click(function() {
   $.get( "/process?run", function( data ) {
     $("#serverStatus").text(data.status);
   });
   return false;
 });
 $("#stopCtrl").click(function() {
   $.get( "/process?kill", function( data ) {
     $("#serverStatus").text(data.status);
   });
   return false;
 });

 $("#refreshCtrl").click(function() {
   $.get( "/process?logs", function( data ) {
     $("#serverStatus").text(data.status);
     var box = $("#logBoxPanel");
     box.empty();
     $( "<pre>"+data.bufferOut+"</pre>" ).appendTo( box );
     //box.val(data.bufferOut);
   });
   return false;
 });
/*
 var loc = window.location;
 var ws_server_url="ws:";
 if (loc.protocol === "https:") {
     ws_server_url = "wss:";
 }
 */
 ws_server_url = "ws://localhost:8082/";

 var wss = new WebSocket(ws_server_url);
 wss.onopen = function()
 {
    // Web Socket is connected, send data using send()
    wss.send("Message to send");
    console.log("Message is sent...");
 };

 wss.onmessage = function (evt)
 {
    var received_msg = JSON.parse(evt.data);
    //console.log("Message is received...");
    //var box = $("#logBox");
    //box.val(box.val() + received_msg.msg);
    var box = $("#logBoxPanel");
    $( "<pre>"+received_msg.msg+"</pre>" ).appendTo( box );
    //console.log(received_msg);
 };

 wss.onclose = function()
 {
    // websocket is closed.
    console.log("Connection is closed...");
 };
 });
