import {sliceApiUrl, urlTransform} from '../../utils/utils'
/**
 * 生成api 配置
 * @param payload
 */
export default function(payload, options) {
  const { url, methods = 'GET', params, description } = payload;

  const upperMethods = methods.toUpperCase();

  const functionName = urlTransform(url, options?.prefix);

  const hasparams = Array.isArray(params) && params.length > 0;

  const getParams = hasparams && upperMethods === 'GET';

  let requestUrl = "`${HOST}";
  requestUrl+= sliceApiUrl(url, options?.prefixHost);
  requestUrl+="`";

  const code = `
    \n
    // ${description}
    export async function fetch${functionName}(${hasparams ? 'params': ''}, options) {
      return request(${requestUrl}, {
        method: '${upperMethods}',
        params: {
          ...params,
        },
        ...(options || {})
      });
    }
  `;

  return code;
}