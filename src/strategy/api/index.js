import createApi from '../../templates/create/api';
import defaultApiTemplate from '../../templates/default/api';
import { dirExists, getStat, readFile, writeFile } from '../../utils/fs';
import { prettify } from '../../utils/utils';

/**
 * handleApi
 * @param {*} absPath 
 * @param {*} jsonData 
 */
export default async function handleApi(api, arr = [], options) {
    const absPath = api.paths.absSrcPath;
    const PrefixPath = absPath + '/services/';
    const fileName = 'api.js';
  
    // 1. 创建service
    const isExist = await getStat(PrefixPath + fileName);
    if(!isExist) {
      // 新建路径
      const stats = await dirExists(PrefixPath);
      // 创建文件，加入默认模板
      const file = await writeFile(PrefixPath + fileName, defaultApiTemplate)
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