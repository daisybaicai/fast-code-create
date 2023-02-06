import { TYPES } from '../../common/enum';
import { handleApi, handleComponents } from '../common';


const handleForm = async (api, text, options) => {
  var jsonData = eval('(' + text + ')');

  // 类型处理
  if (typeof jsonData !== 'object') {
    return;
  }
  const absPath = api.paths.absSrcPath;

  handleApi(absPath, jsonData, options);
  // 2. 创建model
  if(jsonData.isCreate) {
    // 3. 创建components
    handleComponents(absPath, jsonData, TYPES.EXAMPLE_FORM, options);
  }
};

export default handleForm;
