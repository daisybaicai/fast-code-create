import { TYPES } from '../../common/enum';
import createApi from '../../templates/create/api';
import defaultApiTemplate from '../../templates/default/api';
import defaultListTemplate from '../../templates/default/list';
import defaultDetailTemplate from '../../templates/default/detail';
import defaultFormTemplate from '../../templates/default/form'
import defaultActionTemplate from '../../templates/default/action';
import defaultFormExampleTemplate from '../../templates/default/formExample';
import defaultFormExampleDetailTemplate from '../../templates/default/formExampleDetail';
import defaultApiModel from '../../templates/default/model';
import traverseTemplates from '../../traverse/index';
import { dirExists, getStat, readFile, writeFile } from '../../utils/fs';
import { createStateName, getTime, prettify, urlTransform } from '../../utils/utils';

const strategyEnum = {
  [TYPES.LIST]: traverseTemplates.traverseList,
  [TYPES.DETAIL]: traverseTemplates.traverseDetail,
  [TYPES.FORM]: traverseTemplates.traverseForm,
  [TYPES.ACTION]: traverseTemplates.traverseForm,
  [TYPES.DIALOG]: traverseTemplates.traverseForm,
}

const templatesEnum = {
  [TYPES.LIST]: defaultListTemplate,
  [TYPES.DETAIL]: defaultDetailTemplate,
  [TYPES.FORM]: defaultFormTemplate,
  [TYPES.ACTION]: defaultActionTemplate,
  [TYPES.DIALOG]: defaultActionTemplate,
  [TYPES.EXAMPLE_FORM]: defaultFormExampleTemplate,
  [TYPES.EXAMPLE_FORM_DETAIL]: defaultFormExampleTemplate,
}


const handleExampleForm = async ({absPath, jsonData, payload}) => {
  const index = jsonData.componentsPath.lastIndexOf("\/");  
  let comPathPrefix = '';
  console.log('index', index)
  if(index === 0) {
    comPathPrefix = absPath + '/pages' + '/components/';
  } else {
    comPathPrefix = absPath + '/pages' + jsonData.componentsPath.slice(0,index) + '/components/';
  }
  const formType = payload.isProForm ? 'ProForm' : 'BaseForm';
  let formFileName = `${formType}.jsx`;
  const isExist = await getStat(comPathPrefix + formFileName);
  if(!isExist) {
    await dirExists(comPathPrefix);
  } else {
    formFileName = formType + getTime() + '.jsx';
  }
  // 增加formTemplate;
  const defaultTemplate = templatesEnum[TYPES.EXAMPLE_FORM];
 const  truePath = comPathPrefix + formFileName;
  // 拼接
  await writeFile(truePath, defaultTemplate(payload))
  // writeFile
  return formFileName;
}

/**
 * handleApi
 * @param {*} absPath 
 * @param {*} jsonData 
 */
export async function handleApi(absPath, jsonData, options) {
  const PrefixPath = absPath + '/services/';
  const fileName = 'api.js';

  // 1. 创建service
  const isExist = await getStat(PrefixPath + fileName);
  if(!isExist) {
    // 新建路径
    await dirExists(PrefixPath);
    // 创建文件，加入默认模板
    await writeFile(PrefixPath + fileName, defaultApiTemplate)
  }

  const templateContent = await readFile(PrefixPath + fileName);

  const createApiText = createApi(jsonData.api, options, true, templateContent);
  // 拼接
  await writeFile(PrefixPath + fileName, prettify(`${templateContent} ${createApiText}`))
}

/**
 * handleModel
 * @param {*} absPath 
 * @param {*} jsonData 
 * @param {*} type
 */
export async function handleModel(absPath, jsonData, type, options) {
  const PrefixPath = absPath + '/models/';
  const modelName = jsonData.modelName;
  const fileName = `${modelName}.js`;

  // 1. 创建service
  const isExist = await getStat(PrefixPath + fileName);
  if(!isExist) {
    // 新建路径
    const stats = await dirExists(PrefixPath);
    // 创建文件，加入默认模板
    const file = await writeFile(PrefixPath + fileName, defaultApiModel(jsonData.modelName))
  }

  const handleBabelTraverseFunc = strategyEnum[type];
  const newCode = await handleBabelTraverseFunc(PrefixPath + fileName, jsonData, options);

  // 拼接
  await writeFile(PrefixPath + fileName, prettify(newCode))
}

/**
 * handleComponents
 * @param {*} absPath 
 * @param {*} jsonData 
 * @param {*} type
 */
export async function handleComponents(absPath, jsonData, type, options) {
  const PrefixPath = absPath + '/pages' + jsonData.componentsPath;
  const str = PrefixPath;
  var index = str.lastIndexOf("\/");  
 
  const fileName  = str.substring(index + 1, str.length);
  // const fileName = PrefixPath.;

  // 1. 创建service
  const isExist = await getStat(PrefixPath + fileName);
  if(!isExist) {
    // 新建路径
    const stats = await dirExists(PrefixPath.slice(0, index));
    // // 创建文件，加入默认模板
    // const file = await writeFile(PrefixPath + fileName, defaultApiTemplate)
  }

  const {api, loadItem  = false, ...rest} = jsonData;

  const fetchName = `fetch` + urlTransform(jsonData.api.url, options.prefix);
  // const saveName = `save` + urlTransform(jsonData.api.url, options.prefix);
  // const clearName = `clear` + urlTransform(jsonData.api.url, options.prefix);
  // const stateName =  createStateName(urlTransform(jsonData.api.url, options.prefix), type);

  const payload = {
    fetchName, params: api.params, response: api.response, loadItem, ...rest
  }


  if(type === TYPES.EXAMPLE_FORM) {
    // 先判断是否有先baseForm 和 proForm 需要先检查当前路由下是否有该文件;
    // 同时创建example 表单
    const formFileName = await handleExampleForm({
      absPath, jsonData, type, options, payload
    });
    // 然后返回文件名字
    // 创建detail文件
    console.log('PrefixPath', PrefixPath, formFileName)
    await writeFile(PrefixPath, defaultFormExampleDetailTemplate({
      fetchName,
      fileName: formFileName,
      params: api.params
    }))

  } else {
    const defaultTemplate = templatesEnum[type];
    console.log('PrefixPath', PrefixPath, type)

    // 拼接
    await writeFile(PrefixPath, defaultTemplate(payload))
  }
}

/**
 * 
 * @param {*} absPath 
 * @param {*} jsonData 
 * @param {*} type 
 * @param {*} options 
 */
 export async function handleInsertComponent(absPath, jsonData, type, options) {
  const PrefixPath = absPath + '/pages' + jsonData.componentsPath;
  const str = PrefixPath;
  var index = str.lastIndexOf("\/");  
 
const fileName  = str.substring(index + 1, str.length);
  // const fileName = PrefixPath.;

  // 1. 创建service
  const isExist = await getStat(PrefixPath + fileName);
  if(!isExist) {
    // 新建路径
    const stats = await dirExists(PrefixPath.slice(0, index));
    // // 创建文件，加入默认模板
    // const file = await writeFile(PrefixPath + fileName, defaultApiTemplate)
  }

  const {api} = jsonData;

  const fetchName = `fetch` + urlTransform(jsonData.api.url, options.prefix);
  // const saveName = `save` + urlTransform(jsonData.api.url, options.prefix);
  // const clearName = `clear` + urlTransform(jsonData.api.url, options.prefix);
  // const stateName =  createStateName(urlTransform(jsonData.api.url, options.prefix), type);

  const payload = {
     fetchName, params: api.params, response: api.response
  }

  let newCode;
  

  newCode = await traverseTemplates.traverseActionModal(PrefixPath, jsonData, options, payload);

  // if(jsonData.position === 'tableTop') {
  //   newCode = await traverseTemplates.traverseActionTop(PrefixPath, jsonData, options, payload);
  // }
  // if(jsonData.position === 'modal') {
  // }
  // if(jsonData.position === 'tableColumns') {
  //   newCode = await traverseTemplates.traverseActionColumns(PrefixPath, jsonData, options, payload);
  // }

  // 拼接
  await writeFile(PrefixPath, prettify(newCode))
}