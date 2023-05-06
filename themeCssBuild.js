var fs = require('fs'),
  path = require('path'),
  exec = require('child_process').exec,
  less = require('less'),
  sourcePath, targetPath;

sourcePath = 'src/app/theme'; // less檔來源路徑
targetPath = 'src/assets/themes'; // 轉換為css後存檔路徑
cssPath = 'assets/themes'; // 專案存取css路徑
//自訂路徑:获取命令行中的路径
process.argv.forEach(function (val, index, array) {
  console.log(val);
  if (index == 2) {
    sourcePath = val;
  }
  if (index == 3) {
    targetPath = val;
  }
  if (index == 4) {
    cssPath = val;
  }
})

var lessc = function (rootPath, targetPath, cssPath) {



  rootPath = path.resolve(rootPath);
  targetPath = path.resolve(targetPath);
  
  fs.exists(rootPath, function (exists) {
    if (exists) {
      var jsonArr=[];
      var childArray = fs.readdirSync(rootPath);
      if (childArray.length) {
        var id = '';
        var themePath = '';
        var jsonFilePath = path.resolve(targetPath, "themeJson.json");
        for (var i = 0; i < childArray.length; i++) {
          var currentFilePath = path.resolve(rootPath, childArray[i]);
          var currentTargetPath = path.resolve(targetPath, childArray[i])
          var stats = fs.statSync(currentFilePath);
          if (stats.isDirectory()) {
          } else {
            if (path.extname(currentFilePath) === ".less") {
              var newFilePath = path.resolve(targetPath, path.basename(currentFilePath, '.less') + ".css");
              id = path.basename(currentFilePath, '.less');
              themePath = cssPath + '/' + id + '.css';
              if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath);
              }
              (function(currentFilePath, newFilePath, id, themePath) {
                less.render(fs.readFileSync(currentFilePath).toString(), {
                  filename: path.resolve(currentFilePath),
                }, function (e, output) {
                  if (e) {
                    console.log(e); // 錯誤訊息
                  }
                  console.log(newFilePath);
                  jsonArr.push({"id":id, "path":themePath});
                  fs.writeFileSync(newFilePath, output.css);　// 寫入css
                  fs.writeFileSync(jsonFilePath,JSON.stringify(jsonArr)); // 產生css名稱及路徑
                });
            })(currentFilePath, newFilePath, id, themePath);              

            }
          }
        }
      }
      
    } else {
      console.log("directory is not exists");
    }
  });

}

lessc(sourcePath, targetPath, cssPath);
