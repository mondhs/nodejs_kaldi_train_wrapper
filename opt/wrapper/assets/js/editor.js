function fileSelected(fileName){
  if(fileName){
    $("#serverFileName").text(fileName);
    $.get( "/file?"+fileName, function( data ) {
      var received_msg = JSON.parse(data);
      console.log(data);
      if(received_msg.content){
        $("#editBox").val(received_msg.content);
      }
    });
  }
}

$(document).ready(function() {
  var fileName = window.location.hash.substr(1);
  console.log("fileName: " + fileName);
  fileSelected(fileName);



  $.get( "/file? ", function( data ) {
    var received_msg = JSON.parse(data);
    var fileList = $("#fileList");
    received_msg.files.forEach(function each(file) {
      if(file){
        var fileMenu = $( "<li file-data=\""+file+"\"><a href=\"#\">"+file+"</a></li>" );
        fileMenu.click(function() {
          var href =$( this ).attr("file-data");
          console.log(href);
          fileSelected(href);
        });
        fileMenu.appendTo( fileList );
      }

    });
  });




  $("#refreshCtrl").click(function() {
    var fileName = window.location.hash.substr(1);
    location.href = "#"+fileName;
    $.get( "/file?"+fileName, function( data ) {
      var received_msg = JSON.parse(data);
      console.log(data);
      $("#editBox").val(received_msg.content);
    });
    return false;
  });

  $("#saveCtrl").click(function() {
    var fileName = $("#serverFileName").text();
    var content = $("#editBox").val();
    console.log("send file: " + content);
    var requestObj = {"fileName":fileName,"content":content};
    $.post( "/file", JSON.stringify(requestObj) );
  });


});
