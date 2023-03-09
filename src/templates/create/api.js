import {sliceApiUrl, urlTransform} from '../../utils/utils'
/**
 * 生成api 配置
 * @param payload
 * @options
 * @checkParams 默认check， 如果不check，则走默认全部都生成相关params
 */
export default function(payload, options, checkParams = true) {
  const { url, methods = 'GET', params = [], description } = payload;

  const upperMethods = methods.toUpperCase();

  const functionName = urlTransform(url, options?.prefix);


  let requestUrl = "`${HOST}";
  requestUrl+= sliceApiUrl(url, options?.prefixHost);
  requestUrl+="`";

  // 参数类型 body / query
  const paramsInType = params.some(item => item.in === 'body') ? 'body' : 'query';
  

  const code = `
    \n
    // ${description}
    export async function fetch${functionName}(params = {}, options) {
      return request(${requestUrl}, {
        method: '${upperMethods}',
        ${paramsInType === 'body' ? 'data: params,': 'params: {\n ...params, \n},'}
        ...(options || {})
      });
    }
  `;

  console.log('code', code)
  return code;
}