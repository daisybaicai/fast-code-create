import { TYPES } from '../../common/enum';
import { handleApi, handleComponents, handleModel } from '../common';

const handleList =  async (api, text, options) => {
  var jsonData = eval('(' + text + ')');

  // 类型处理
  if (typeof jsonData !== 'object') {
    return;
  }

  const absPath = api.paths.absSrcPath;
  console.log('absPath', absPath)

  handleApi(absPath, jsonData, options);

  // 创建默认template useRequest 模板
  // 2. 创建model
  // handleModel(absPath, jsonData, TYPES.LIST, options)
  // 3. 创建components
  if(jsonData.isCreate) {
    handleComponents(absPath, jsonData, TYPES.LIST, options)
  }
};

export default handleList;