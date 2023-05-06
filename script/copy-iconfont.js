const mvDir = require('mvdir');
let sourcePath = './src/assets/iconfont';
let destPath = './dist/iconfont';
mvDir(sourcePath, destPath, { copy: true }).then((res) => {
  console.log('iconfont複製成功');
}, () => {
  console.error('iconfont複製失敗');
});
