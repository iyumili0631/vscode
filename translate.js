const path = require('path');
const fs = require('fs');
const axios = require('axios');

// 由簡體zh_CN翻譯到繁體zh_TW，並寫入到zh_TW文件夾中
const _rootPath = path.resolve('.', __dirname);
const i18nPath = '/src/assets/i18n';
const _originI18nDir = '/zh_CN';
const _targetI18nDir = '/zh_TW';
const originI18nPathName = path.join(_rootPath, i18nPath, _originI18nDir);
const targetI18nPathName = path.join(_rootPath, i18nPath, _targetI18nDir);

function translateApi(jsonData) {
  // 接口文檔地址： http://10.40.46.16:22694/html/web/controller/share/share.html#6310205052a244000d150a61
  return axios({
    url: 'https://translation.digiwincloud.com/restful/service/translater/IDWTranslateService/translate',
    method: 'POST',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
    data: {
      content: jsonData,
      convertTypes: ['zh2Hant'], //'zh2Hant'- 中文簡體轉繁體；'zh2En' - 中文簡體轉英文
    },
  });
}

function execTranslate(fileInfo) {
  const originfile = path.join(fileInfo.originPath, fileInfo.name);
  let jsonData = fs.readFileSync(originfile, { encoding: 'utf-8' });
  if (!jsonData) {
    return;
  }
  jsonData = JSON.parse(jsonData);
  translateApi(jsonData).then(
    function (res) {
      if (res.data && res.data.response && res.data.response.success) {
        const translatedData = res.data.response.data;
        const hantJSON = JSON.stringify(translatedData.zh2Hant, null, 2);

        const targetfile = path.join(fileInfo.targetPath, fileInfo.name);
        fs.writeFileSync(targetfile, hantJSON);
      } else {
        console.log(`翻譯API調用失敗，請重試！`);
      }
    },
    function (err) {
      console.log(`翻譯API調用失敗，請重試！`);
    }
  );
}

function init() {
  fs.readdirSync(originI18nPathName).forEach(function (filename) {
    // 針對zh_CN文件夾下的json文件進行逐一翻譯，並寫入
    execTranslate({
      originPath: originI18nPathName,
      targetPath: targetI18nPathName,
      name: filename,
    });
  });
  console.log("翻譯結束！")
}

init();
