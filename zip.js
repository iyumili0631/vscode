const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const _rootPath = path.resolve('.', __dirname);
// 待打包的文件夾
const _distPath = '/dist';
const distPath = path.join(_rootPath, _distPath);
const zipFilePath = path.join(_rootPath, 'dist.zip');
// 獲取參數配置，用於創建文件夾
const pathName = process.argv[2] || '';

/**
 * 壓縮文件夾
 * @param sourceFolder，待壓縮的文件夾路徑
 * @param destZip，壓縮後的zip文件路徑
 */
function zipFolder(sourceFolder, destZip) {
  // 創建文件輸出流
  const output = fs.createWriteStream(destZip);
  // 設置壓縮級別
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });
  // 監聽文件輸出流結束
  output.on('close', function () {
    console.log('zip folder success!');
  });
  // 監聽壓縮是否出錯
  archive.on('error', function (err) {
    console.log('zip folder fail!', err);
  });
  // 通過管道方法將輸出流存檔到文件
  archive.pipe(output);
  // 追加一層文件夾
  archive.directory(sourceFolder, pathName);
  // 追加一個index.html避開網站的校驗
  archive.append('', { name: 'index.html' });
  // 完成壓縮
  archive.finalize();
}

if (fs.existsSync(distPath)) {
  zipFolder(distPath, zipFilePath);
} else {
  console.log('dist文件夾不存在，請執行打包命令生成dist文件夾內容！');
}

