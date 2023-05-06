##新增git commit規則



**git提交資訊說明（注意冒號後面要有個空格，不然會不能commit）**

feat:添加新特性

fix:修復bug

docs:僅僅修改了檔案

style:僅僅修改了空格、格式縮進、逗號等等，不改變程式碼邏輯

refactor:程式碼重構，沒有加新功能或者修復bug

perf:優化相關，比如提升效能、體驗

test:新增測試用例

chore:改變構建流程、或者新增依賴庫、工具等

revert:回滾到上一個版本

例如：

```

fix:修復xxx問題

```




######專案中控台打包



控制台下在專案根目錄執行npm run build:task-project-center-console



然後把src/assets/plugins/list目錄下的打包好的挿件拷貝到支athena-web的master分相同目錄下




同時修改src/assets/plugins/plugins-config.json挿件注册檔案，如果不存在則添加對應的挿件資訊，如下：

`

{

“TaskProjectCenterConsoleModule”：{

“name”：“TaskProjectCenterConsoleModule”，

“path”：“/assets/plugins/list/task-project-center-console/TaskProjectCenterConsoleModule.js”，

“description”：“clarity form”，

“isRouter”：false，

“deps”：[]

}

}

`



然後提交上傳



athena-web正常運行或者打包