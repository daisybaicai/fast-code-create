import { getDetailInfos, getDetailParams } from '../../utils/utils';

const text = ({fetchName, params, response}) => `
import React, { useRef } from 'react';
import { Card, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { formatObject } from '@/utils/format';
import { ${fetchName}  } from '@/services/api';

export default function Detail({ route = {},  match: { params }, }) {
  const {
    loading,
    data: detail,
    run: getDetail,
  } = useRequest(
    (v) =>
      ${fetchName} ({
        ${getDetailParams(params)},
        ...v,
      }),
    {
      onError: (res) => {
        message.error(res?.message || '请求失败');
      },
      // 数据处理
      formatResult: ({ data: res }) => {
        return formatObject(res);
      },
    },
  );

  ${
    getDetailInfos(response, 'detail')
  }


  return (
    <PageContainer title="列表详情" breadcrumb={null} loading={loading}>
      <Card bordered={false}>
        <Descriptions title="详情">
          {
            cardInfo?.map(item => (
              <Descriptions.Item label={item.name} key={item.name}>{item.value}</Descriptions.Item>
            ))
          }
        </Descriptions>
      </Card>
    </PageContainer>
  );
}

  
`
export default text;