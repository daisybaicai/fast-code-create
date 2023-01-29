import { getColumnsNew, getFormItems, prettify } from "../../utils/utils";

const text = ({ fetchName, params, response }) => prettify(`import React from 'react';
import {
  Card,
  Table,
  message,
  Button,
  Modal,
  Form,
  Space,
  Row,
  Col,
  Input,
  Select,
  Badge,
} from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { useModel, history } from '@umijs/max';
import { isFunction } from 'lodash';
import BasePopconfirm from '@/components/BasePopconfirm';
import { formatTimeToDateSecond } from '@/utils/format';
import { useSearchFormTable, useModalParams, useResetFormOnCloseModal } from '@/utils/hooks';
import { formatQuery, UrlQueryParamTypes, replaceRoute } from '@/utils/query';
import { getPageQuery } from '@/utils/utils';
import { LIST_FORM_LAYOUT, ACCOUNT_STATUS_MAP, OPERATE_TYPE } from '@/common/enum';
import { ${fetchName} } from '@/services/api';

const urlPropsQueryConfig = {
  name: { type: UrlQueryParamTypes.string },
  enabled: { type: UrlQueryParamTypes.boolean },
  pageNo: { type: UrlQueryParamTypes.number },
  pageSize: { type: UrlQueryParamTypes.number },
};

export default function TableApply() {
  const { run: fetchTableList, data: tableList } = useRequest((v) => ${fetchName}(v), {
    manual: true,
    onError: (res) => {
      message.error(res?.message || '请求失败');
    },
    // 数据处理
    formatResult: ({ data: res }) => {
      const arr = res?.items.map((item, index) => ({
        ...item,
      }));
      return {
        ...res,
        items: arr,
      };
    },
  });

  const queryParams = formatQuery(getPageQuery(window.location.href), urlPropsQueryConfig);

  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const modalParams = useModalParams();
  const { modalProps, params } = modalParams;
  useResetFormOnCloseModal({ form: modalForm, visible: modalParams.visible });

  const getTableData = ({ current = 1, pageSize = 10 }, formData) => {
    const payload = {
      pageNo: current,
      pageSize,
      ...formData,
    };
    replaceRoute(payload);
    return fetchTableList(payload);
  };

  const {
    tableProps,
    refresh,
    search: { reset, submit },
  } = useSearchFormTable(getTableData, {
    form,
    paginated: true,
    total: tableList?.total,
    dataSource: tableList?.items,
    defaultParams: [
      {
        current: queryParams?.pageNo || 1,
        pageSize: queryParams?.pageSize || 10,
      },
      queryParams,
    ],
  });

  // 启用/禁用规则
  const handleOperateStatus = (item) => {
    const operate = item.enabled ? '禁用' : '启用';
    Modal.confirm({
      title: \`您确定\${operate}该规则吗\`,
      okText: '确定',
      cancelText: '取消',
      icon: <QuestionCircleOutlined />,
      onOk: () => {
        message.success(\`${operate}成功\`);
        submit();
      },
    });
  };

  // 新增/修改规则
  const handleEdit = () => {
    modalForm.validateFields().then((value) => {
      console.log('payload', value, params?.id);
      message.success(params?.modalOperateType === OPERATE_TYPE.EDIT ? '修改成功' : '新增成功');
      modalParams.hideModal();
      refresh();
    });
  };

  // 删除规则
  const handleDelete = (id) => {
    console.log('id', id);
    message.success('删除成功');
    refresh();
  };

  const columns = [
    ${getColumnsNew(response)},
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <a
            onClick={() => handleOperateStatus(record)}
            style={{ color: record.enabled ? '#DE3535' : '#6BC251' }}
          >
            {record.enabled ? '禁用' : '启用'}
          </a>
          <a onClick={() => history.push(\`/application/table/detail/\${record?.id}\`)}>详情</a>
          <a
            onClick={() => {
              modalParams.showModal({ ...record, modalOperateType: OPERATE_TYPE.EDIT });
              if (modalForm && isFunction(modalForm.setFieldsValue)) {
                modalForm.setFieldsValue(record);
              }
            }}
          >
            修改
          </a>
          <BasePopconfirm handleConfirm={() => handleDelete(record.id)}>
            <a>删除</a>
          </BasePopconfirm>
        </Space>
      ),
    },
  ];

  const searchForm = (
    <Form form={form} name="search">
      <Row gutter={24}>
      ${getFormItems(params)}
        <Col {...LIST_FORM_LAYOUT} xl={8}>
          <Form.Item label="规则状态" name="enable">
            <Select placeholder="请选择" allowClear>
              {[ACCOUNT_STATUS_MAP.true, ACCOUNT_STATUS_MAP.false].map((item) => (
                <Select.Option value={item.code} key={item.code}>
                  {item.desc}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col {...LIST_FORM_LAYOUT} sm={24} xl={8} style={{ textAlign: 'right' }}>
          <Space style={{ marginBottom: 24 }}>
            <Button style={{ marginLeft: 8 }} onClick={reset}>
              重置
            </Button>
            <Button type="primary" htmlType="submit" onClick={submit}>
              搜索
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );

  return (
    <PageContainer breadcrumb={null} title="表格应用">
      <Card bordered={false} className="search">
        {searchForm}
      </Card>
      <Card bordered={false} style={{ marginTop: 24 }}>
        <Button
          type="primary"
          onClick={() => {
            modalParams.showModal({
              modalOperateType: OPERATE_TYPE.CREATE,
            });
          }}
          style={{ marginBottom: 20, float: 'right' }}
        >
          <PlusOutlined /> 新增规则
        </Button>
        <Table columns={columns} rowKey={(r) => r.id} {...tableProps} className="myTable" />
        <Modal
          title={\`\${params?.modalOperateType?.desc || '新增'}规则\`}
          open={modalProps.visible}
          onCancel={modalProps.onCancel}
          destroyOnClose={modalProps.destroyOnClose}
          maskClosable={modalProps.maskClosable}
          onOk={handleEdit}
        >
          <Form
            form={modalForm}
            name="drawer-form"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
          >
            <Form.Item
              name="name"
              label="规则名称"
              rules={[
                {
                  required: true,
                  message: '请输入规则名称',
                },
              ]}
              validateTrigger="onChange"
              validateFirst
            >
              <Input placeholder="请输入规则名称" maxLength={50} />
            </Form.Item>
            <Form.Item
              name="desc"
              label="描述"
              rules={[
                {
                  required: true,
                  message: '请输入描述',
                },
              ]}
              validateTrigger="onChange"
              validateFirst
            >
              <Input placeholder="请输入描述" maxLength={50} />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </PageContainer>
  );
}
`);
export default text;
