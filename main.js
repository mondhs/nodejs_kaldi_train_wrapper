var http = require('http');
var fs = require('fs');
var url = require('url');
const spawn = require('child_process').spawn;
const WebSocket = require('ws');


var g_cmdProcess = null;
var g_satusObj = {"status":"idle", bufferOut:null};
var g_ws_server = new WebSocket.Server({ port: 8082 });


g_ws_server.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
  var sendMessage = {"msg":"Starting..."};
  ws.send(JSON.stringify(sendMessage));

});

function sendMessageObj(messageObj){
  g_ws_server.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
     client.send(JSON.stringify(messageObj));
    }
  });
}

function readAssetsAndRespond(pathname, request, response){
  // Read the requested file content from file system
  fs.readFile("./assets/"+pathname.substr(1), function (err, data) {
     if (err) {
        console.log(err);
        // HTTP Status: 404 : NOT FOUND
        // Content Type: text/plain
        response.writeHead(404, {'Content-Type': 'text/html'});
     }else {
        //Page found
        // HTTP Status: 200 : OK
        // Content Type: text/plain
        response.writeHead(200, {'Content-Type': 'text/html'});

        // Write the content of the file to response body
        response.write(data.toString());
     }
     // Send the response body
     response.end();
  });
}

function readControlFilesAndRespond(pathname, request, response){
  // Read the requested file content from file system
  var commandArr = request.url.split("?");

  console.log(`[readControlFilesAndRespond] commandArr: [${commandArr[1].length == 0}]`);
  if(commandArr[1].length == 0){

    var execFile = require('child_process').execFile;
    execFile('find', [ './contol_files/', '-type', "f"], function(err, stdout, stderr) {
      var file_list = stdout.split('\n');
      var fileArr = [];
      var responseObj = {"files":fileArr}
      file_list.forEach(function each(file) {
        fileArr.push(file.replace("./contol_files/", ""));
      });
      console.log(file_list);
      response.write(JSON.stringify(responseObj));

      response.end();
    });

    return;
  }

  fs.readFile("./contol_files/"+commandArr[1], function (err, data) {
    var responseObj = {};
     if (err) {
        console.log(err);
        responseObj.content=null;
     }else {
       response.writeHead(200, {'Content-Type': 'text/html'});
       responseObj.content=data.toString();

        // Write the content of the file to response body
        response.write(JSON.stringify(responseObj));
     }
     // Send the response body
     response.end();
  });
}

  function writeControlFilesAndRespond(pathname, request, response){
    // Read the requested file content from file system
    var commandArr = request.url.split("?");

    console.log(`[writeControlFilesAndRespond] commandArr:  ${commandArr}`);
    response.writeHead(200, {'Content-Type': 'application/json'});
    var body = [];
    request.on('data', function(chunk) {
      body.push(chunk);
    }).on('end', function() {
      body = Buffer.concat(body).toString();
      var requestJson = JSON.parse(body);
      // at this point, `body` has the entire request body stored in it as a string
      console.log(`[writeControlFilesAndRespond] body: ${body}`);
      fs.writeFile("./contol_files/"+requestJson.fileName, requestJson.content, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
      });

    });
    response.end();

  }


function executeAndRespond(pathname, request, response){
  var responseObj = {"cmd":"status", "status": g_satusObj.status};
  var commandArr = request.url.split("?");

  if(commandArr.length == 2){
    command = commandArr[1];
    responseObj.cmd = command
  }
  console.log("Request for " + responseObj.cmd + " received.");

  // Read the requested file content from file system
  //Page found
  // HTTP Status: 200 : OK
  // Content Type: text/plain
  response.writeHead(200, {'Content-Type': 'application/json'});

  if(responseObj.cmd == "status"){
    responseObj.status=g_satusObj.status;
  }else if(responseObj.cmd == "logs"){
    responseObj.status=g_satusObj.status;
    responseObj.bufferOut=g_satusObj.bufferOut;
  }else if(responseObj.cmd == "kill"){
    responseObj.status="stoping";
    stopCmd(g_cmdProcess);
  }else if(responseObj.cmd == "run"){
    responseObj.status="starting";
    g_cmdProcess = startCmd();
  }



  // Write the content of the file to response body
  response.write(JSON.stringify(responseObj));
  // Send the response body
  response.end();
}

function startCmd(){
  // while sleep 1; do ls; done
  var cmdProcess = spawn('./contol_files/run.sh');
  g_satusObj.bufferOut = "";

  cmdProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    var nowStr = new Date().toISOString();
    var msg = nowStr + " >>> " +data.toString()
    var sendMessage = {"msg":msg};
    g_satusObj.bufferOut +=  msg;
     sendMessageObj(sendMessage)
  });

  cmdProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  cmdProcess.on('close', (code) => {
    g_satusObj.status="closed";
    console.log(`child process exited with code ${code}`);
  });

  g_satusObj.status = "running";

  return cmdProcess;
}

function stopCmd(cmdProcess){
  if(cmdProcess!=null){
    cmdProcess.kill('SIGHUP');
  }
}


// Create a server
http.createServer( function (request, response) {
  // Parse the request containing file name
  var pathname = url.parse(request.url).pathname;
  var method = request.method;
  if(pathname == "" || pathname == "/"){
   pathname = "/index.html";
  }

  // Print the name of the file for which request is made.
  console.log("Request for " + pathname + " received.");
  if(pathname == "/process"){
    executeAndRespond(pathname, request, response);
  }else if(pathname == "/file"){
    if(method == "POST"){
      writeControlFilesAndRespond(pathname, request, response);
    }else{
      readControlFilesAndRespond(pathname, request, response);
    }

   }else{
     readAssetsAndRespond(pathname, request, response);
   }

}).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');
