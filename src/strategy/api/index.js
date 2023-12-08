import createApi from '../../templates/create/api';
import defaultApiTemplate from '../../templates/default/api';
import { dirExists, getStat, readFile, writeFile } from '../../utils/fs';
import { prettify } from '../../utils/utils';

/**
 * handleApi
 * @param {*} absPath 
 * @param {*} jsonData 
 */
export default async function handleApi(api, arr = [], options, servicePath = '/services/api.js') {
    const absPath = api.paths.absSrcPath;

    const inputString = servicePath;
    const regex = /(.+\/)([^\/]+)$/;

    const match = inputString.match(regex);

    let beforeLastSlash = '/services/', afterLastSlash = 'api.js';

    if (match) {
        // console.log("🚀 ~ file: index.js:22 ~ handleApi ~ match:", match)
        beforeLastSlash = match[1]; // 获取最后一个/前面的内容
        afterLastSlash = match[2]; // 获取当前最后一个/后面的内容
    }

    // console.log("🚀 ~ file: index.js:20 ~ handleApi ~ beforeLastSlash:", beforeLastSlash, afterLastSlash)
    const PrefixPath = absPath + beforeLastSlash;
    const fileName = afterLastSlash;
  
    // 1. 创建service
    const isExist = await getStat(PrefixPath + fileName);
    if(!isExist) {
      // 新建路径
      await dirExists(PrefixPath);
      // 创建文件，加入默认模板
      await writeFile(PrefixPath + fileName, defaultApiTemplate)
    }
  
    const templateContent = await readFile(PrefixPath + fileName);
  
    let resultText = ``;

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      const r = createApi(item, options, false, templateContent);
      resultText += r;
    }

    // 拼接
    await writeFile(PrefixPath + fileName, prettify(`${templateContent} ${resultText}`))
  }