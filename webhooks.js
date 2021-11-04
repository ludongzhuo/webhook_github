var http = require('http')
var createHandler = require('github-webhook-handler')
var handler = createHandler({ path: '/postreceive', secret: '123' })
// 上面的 path和 secret保持和 GitHub后台设置的一致

function run_cmd(cmd, args, callback) {
  var spawn = require('child_process').spawn;
  var child = spawn(cmd, args);
  var resp = "";

  child.stdout.on('data', function (buffer) { resp += buffer.toString(); });
  child.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  child.stdout.on('end', function () { callback(resp) });
}

http.createServer(function (req, res) {

  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(6000, () => { //监听的端口，对应 GitHub设置
  console.log('WebHooks Listern at 6000');
})
handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);
  // 判断是否为 main分支，也可以自行修改
  if (event.payload.ref === 'refs/heads/main') {
    console.log('deploy main..')
    run_cmd('sh', ['./deploy.sh'], function (text) { console.log(text) });
  }
})