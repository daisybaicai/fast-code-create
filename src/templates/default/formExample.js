export const baseFormText = `import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import { Checkbox, Col, Form, Input, InputNumber, Radio, Row, Select } from 'antd';
import { EditableProTable, ProFormDigitRange } from '@ant-design/pro-components';
import ApplyItem from '@/components/ApplyItem';
import loadApplyItem from '@/components/ApplyItem/loadApplyItem';
import BaseCascader from '@/components/BaseCascader';
import BaseDatePicker from '@/components/BaseDatePicker';
import EmailSearch from '@/components/EmailSearch';
import FileUpload from '@/components/FileUpload';
import { UPLOAD_TYPE } from '@/components/FileUpload/fileUtils';
import { useProTableParams } from '@/utils/hooks';
import { isEmptyArray } from '@/utils/utils';
import { FORM_ITEM_TYPE } from '@/common/enum';
import { PATTERN } from '@/common/pattern';
import { getNormalRules } from '@/common/project';

const FORM_LAYOUT = {
  sm: 24,
  md: 12,
  xl: 8,
};

const ACTION = \`https://mock.apifox.cn/m1/1961007-0-default/api/v1/file/upload\`;
const defaultOptions = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
];
const proTableColumns = [
  {
    title: '活动名称',
    dataIndex: 'title',
    width: '30%',
  },
  {
    title: '状态',
    key: 'state',
    dataIndex: 'state',
    valueType: 'select',
    valueEnum: {
      all: { text: '全部', status: 'Default' },
      open: {
        text: '未解决',
        status: 'Error',
      },
      closed: {
        text: '已解决',
        status: 'Success',
      },
    },
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项是必填项',
        },
      ],
    },
    renderFormItem: () => {
      return <EmailSearch />;
    },
  },
  {
    title: '附件',
    dataIndex: 'file',
    renderFormItem: (_, { record }) => {
      return (
        <FileUpload
          uploadType={UPLOAD_TYPE.PICTURE.code}
          accept={['png', 'jpeg', 'jpg']}
          fileLen={1}
          action={ACTION}
        />
      );
    },
    render: (val) => {
      return <ApplyItem value={val} type="file" />;
    },
  },
  {
    title: '操作',
    valueType: 'option',
    render: () => '-',
  },
];

const FormItemGroup = React.memo(({ gutter = [20, 20], children, ...props }) => {
  const renderItem = (v) => {
    const {
      props: { colProps = {}, label = '', ...extraProps },
      key = '',
      ...extraEleProps
    } = v;
    const child = {
      ...extraEleProps,
      key,
      props: {
        label,
        ...extraProps,
      },
    };
    return (
      <Col {...colProps} key={key || label}>
        {child}
      </Col>
    );
  };
  return (
    <Row gutter={gutter} {...props}>
      {children instanceof Array ? (
        <>{children.map((v, index) => renderItem(v))}</>
      ) : (
        renderItem(children)
      )}
    </Row>
  );
});

const BaseForm = React.memo(
  forwardRef(({ readonly = false, value = {} }, ref) => {
    const [form] = Form.useForm();
    useImperativeHandle(ref, () => {
      return {
        submit: handleSubmit,
        getFieldsValue: form.getFieldsValue,
        setFieldsValue: form.setFieldsValue,
        scrollToField: form.scrollToField,
      };
    });
    const proTableParams = useProTableParams(value?.list1, readonly);

    const handleSubmit = (cb = () => {}) => {
      form.validateFields().then((values) => {
        cb(values);
      });
    };

    useEffect(() => {
      if (value && form && typeof form.setFieldsValue === 'function') {
        form.setFieldsValue({
          ...value,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (
      <Form
        name="base-form"
        form={form}
        onValuesChange={(_, values) => {
          console.log(values);
        }}
        layout="horizontal"
        initialValues={value}
        requiredMark={readonly ? false : true}
      >
        <FormItemGroup>
          <Form.Item
            name="entName"
            label="企业名称"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('企业名称', {
              pattern: PATTERN.CH_EN,
              maxLen: 20,
            })}
            validateFirst
          >
            {loadApplyItem(<Input placeholder="请输入" />, !readonly)}
          </Form.Item>
          <Form.Item
            name="endCode"
            label="统一社会信用代码"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('统一社会信用代码', {
              pattern: PATTERN.CREDIT_CODE,
              validateLen: false,
            })}
            validateFirst
          >
            {loadApplyItem(<Input placeholder="请输入" />, !readonly)}
          </Form.Item>
          <Form.Item
            name="mobile"
            label="联系方式"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('联系方式', {
              pattern: PATTERN.PHONE,
              validateLen: false,
            })}
            validateTrigger="onBlur"
            validateFirst
          >
            {loadApplyItem(<Input placeholder="请输入" />, !readonly)}
          </Form.Item>

          <Form.Item
            name="status"
            label="企业状态"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('企业状态', { select: true })}
            validateFirst
          >
            {loadApplyItem(
              <Select placeholder="请选择">
                {[
                  {
                    value: 'enable',
                    label: '启用中',
                  },
                  {
                    value: 'disable',
                    label: '禁用中',
                  },
                ].map((item) => (
                  <Select.Option value={item.value} key={item.value}>
                    {item.label}
                  </Select.Option>
                ))}
              </Select>,
              !readonly,
            )}
          </Form.Item>
          <Form.Item
            name="type"
            label="企业类型"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('企业类型', { select: true })}
            validateFirst
          >
            {loadApplyItem(
              <Radio.Group buttonStyle="solid">
                {[
                  {
                    label: '工业',
                    value: 'a',
                  },
                  {
                    label: '农业',
                    value: 'b',
                  },
                ].map((item) => (
                  <Radio.Button value={item.value} key={item.value}>
                    {item.label}
                  </Radio.Button>
                ))}
              </Radio.Group>,
              !readonly,
            )}
          </Form.Item>
          <Form.Item
            name="level"
            label="级别"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('级别', { select: true })}
            validateFirst
          >
            {loadApplyItem(
              <Checkbox.Group>
                {['A', 'B', 'C', 'D', 'E', 'F'].map((v) => (
                  <Checkbox value={v} key={v}>
                    {v}
                  </Checkbox>
                ))}
              </Checkbox.Group>,
              !readonly,
            )}
          </Form.Item>
        </FormItemGroup>
        <FormItemGroup>
          <Form.Item
            name="address"
            label="联系地址"
            colProps={{
              ...FORM_LAYOUT,
              xl: 16,
            }}
          >
            {loadApplyItem(<Input.TextArea maxLength={200} showCount />, !readonly)}
          </Form.Item>
        </FormItemGroup>
        <FormItemGroup>
          <Form.Item
            name="email"
            label="邮箱"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('邮箱', {
              pattern: PATTERN.EMAIL,
              validateLen: false,
            })}
            validateFirst
          >
            {loadApplyItem(<EmailSearch placeholder="请输入邮箱" />, !readonly)}
          </Form.Item>
          <Form.Item
            name="date"
            label="日期"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('日期', {
              select: true,
            })}
            validateFirst
          >
            {loadApplyItem(
              <BaseDatePicker
                type={FORM_ITEM_TYPE.DATE.code}
                placeholder="请选择日期"
                formatTimeStamp={false}
              />,
              !readonly,
            )}
          </Form.Item>
          <ProFormDigitRange
            name="numRange"
            label="数值区间"
            colProps={FORM_LAYOUT}
            fieldProps={{ precision: 2 }}
            rules={[
              {
                validator: (_, val) => {
                  const [num1, num2] = val || [];
                  if (!val || num1 === undefined || num2 === undefined) {
                    return Promise.reject(new Error('请输入数值'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            validateTrigger="onBlur"
            required
            readonly={readonly}
          />
          <Form.Item
            name="num"
            label="单一数值"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('数值', {
              required: true,
              validateLen: false,
            })}
            validateFirst
          >
            {loadApplyItem(
              <InputNumber
                min={0}
                max={999999}
                precision={0}
                placeholder="请输入"
                style={{ width: '100%' }}
              />,
              !readonly,
            )}
          </Form.Item>
          <Form.Item
            label="附件"
            name="file"
            colProps={FORM_LAYOUT}
            rules={[
              {
                validator: (_, val) => {
                  if (isEmptyArray(val)) {
                    return Promise.reject(new Error('请上传附件'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            validateFirst
            required
          >
            <FileUpload
              accept={['pdf', 'doc', 'docx']}
              fileLen={1}
              limitSize={20}
              uploadType={UPLOAD_TYPE.BUTTON.code}
              action={ACTION}
              tooltipTitle="仅支持.pdf,.doc,.docx后缀的文件，文件大小不得超过20M"
              readonly={readonly}
            />
          </Form.Item>
          <Form.Item
            name="area"
            label="地区（级联）"
            colProps={FORM_LAYOUT}
            rules={[
              {
                validator: (_, val) => {
                  if (!val || isEmptyArray(val)) {
                    return Promise.reject(new Error('请选择地区'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            validateFirst
            required
          >
            {loadApplyItem(
              <BaseCascader
                placeholder="请选择"
                defaultOptions={defaultOptions}
                isFetch={false}
                fieldNames={{ label: 'label', value: 'value' }}
                changeOnSelect={false}
              />,
              !readonly,
              'text',
              (val) => val?.join('/') || '-',
            )}
          </Form.Item>
        </FormItemGroup>
        <Form.Item name="list1" trigger="onValuesChange" noStyle>
          <EditableProTable
            headerTitle="可编辑表格示例"
            rowKey="id"
            columns={proTableColumns}
            {...proTableParams.props}
            recordCreatorProps={readonly ? false : proTableParams.props?.recordCreatorProps}
            toolBarRender={null}
            maxLength={5}
            readonly={readonly}
          />
        </Form.Item>
      </Form>
    );
  }),
);

export default BaseForm;`

export const proFormText = `import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Col } from 'antd';
import {
  EditableProTable,
  ProForm,
  ProFormCheckbox,
  ProFormDigit,
  ProFormDigitRange,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import ApplyItem from '@/components/ApplyItem';
import loadApplyItem from '@/components/ApplyItem/loadApplyItem';
import BaseCascader from '@/components/BaseCascader';
import BaseDatePicker from '@/components/BaseDatePicker';
import EmailSearch from '@/components/EmailSearch';
import FileUpload from '@/components/FileUpload';
import { UPLOAD_TYPE } from '@/components/FileUpload/fileUtils';
import { useProTableParams } from '@/utils/hooks';
import { isEmptyArray } from '@/utils/utils';
import { FORM_ITEM_TYPE } from '@/common/enum';
import { PATTERN } from '@/common/pattern';
import { getNormalRules } from '@/common/project';

const FORM_LAYOUT = {
  sm: 24,
  md: 12,
  xl: 8,
};

const ACTION = \`https://mock.apifox.cn/m1/1961007-0-default/api/v1/file/upload\`;
const defaultOptions = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            label: 'West Lake',
          },
        ],
      },
    ],
  },
];
const proTableColumns = [
  {
    title: '活动名称',
    dataIndex: 'title',
    width: '30%',
  },
  {
    title: '状态',
    key: 'state',
    dataIndex: 'state',
    valueType: 'select',
    valueEnum: {
      all: { text: '全部', status: 'Default' },
      open: {
        text: '未解决',
        status: 'Error',
      },
      closed: {
        text: '已解决',
        status: 'Success',
      },
    },
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    formItemProps: {
      rules: [
        {
          required: true,
          message: '此项是必填项',
        },
      ],
    },
    renderFormItem: () => {
      return <EmailSearch />;
    },
  },
  {
    title: '附件',
    dataIndex: 'file',
    renderFormItem: (_, { record }) => {
      return (
        <FileUpload
          uploadType={UPLOAD_TYPE.PICTURE.code}
          accept={['png', 'jpeg', 'jpg']}
          fileLen={1}
          action={ACTION}
        />
      );
    },
    render: (val) => {
      return <ApplyItem value={val} type="file" />;
    },
  },
  {
    title: '操作',
    valueType: 'option',
    render: () => '-',
  },
];

const TemplatesForm = React.memo(
  forwardRef(({ readonly = false, value = {} }, ref) => {
    const formRef = useRef();
    useImperativeHandle(ref, () => {
      return {
        submit: handleSubmit,
        getFieldsValue: formRef.current?.getFieldsValue,
        setFieldsValue: formRef.current?.setFieldsValue,
        scrollToField: formRef.current?.scrollToField,
      };
    });
    const proTableParams = useProTableParams(value?.list1, readonly);

    const handleSubmit = (cb = () => {}) => {
      formRef.current.validateFields().then((values) => {
        cb(values);
      });
    };

    useEffect(() => {
      if (value && formRef && typeof formRef.current?.setFieldsValue === 'function') {
        formRef.current?.setFieldsValue({
          ...value,
        });
      }
    }, [value]);

    return (
      <ProForm
        name="templates-form"
        formRef={formRef}
        onValuesChange={(_, values) => {
          console.log(values);
        }}
        grid
        rowProps={{
          gutter: [20, 20],
        }}
        layout="horizontal"
        readonly={readonly}
        submitter={false}
        initialValues={value}
        requiredMark={readonly ? false : true}
      >
        <ProForm.Group>
          <ProFormText
            name="entName"
            label="企业名称"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('企业名称', {
              pattern: PATTERN.CH_EN,
              maxLen: 20,
            })}
            validateFirst
          />
          <ProFormText
            name="endCode"
            label="统一社会信用代码"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('统一社会信用代码', {
              pattern: PATTERN.CREDIT_CODE,
              validateLen: false,
            })}
            validateTrigger="onBlur"
            validateFirst
          />
          <ProFormText
            name="mobile"
            label="联系方式"
            colProps={FORM_LAYOUT}
            rules={getNormalRules('联系方式', {
              pattern: PATTERN.PHONE,
              validateLen: false,
            })}
            validateTrigger="onBlur"
            validateFirst
          />
          <ProFormSelect
            name="status"
            label="企业状态"
            colProps={FORM_LAYOUT}
            options={[
              {
                value: 'enable',
                label: '启用中',
              },
              {
                value: 'disable',
                label: '禁用中',
              },
            ]}
            rules={getNormalRules('企业状态', { select: true })}
            validateFirst
          />
          <ProFormRadio.Group
            name="type"
            label="企业类型"
            radioType="button"
            fieldProps={{
              buttonStyle: 'solid',
            }}
            colProps={FORM_LAYOUT}
            options={[
              {
                label: '工业',
                value: 'a',
              },
              {
                label: '农业',
                value: 'b',
              },
            ]}
            rules={getNormalRules('企业类型', { select: true })}
            validateFirst
          />
          <ProFormCheckbox.Group
            name="level"
            label="级别"
            colProps={FORM_LAYOUT}
            options={['A', 'B', 'C', 'D', 'E', 'F']}
            rules={getNormalRules('级别', { select: true })}
            validateFirst
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormTextArea
            name="address"
            label="联系地址"
            colProps={{
              ...FORM_LAYOUT,
              xl: 16,
            }}
            fieldProps={{ showCount: true, maxLength: 200 }}
          />
        </ProForm.Group>
        <ProForm.Group>
          <Col {...FORM_LAYOUT}>
            <ProForm.Item
              name="email"
              label="邮箱"
              rules={getNormalRules('邮箱', {
                pattern: PATTERN.EMAIL,
                validateLen: false,
              })}
              validateFirst
            >
              {loadApplyItem(<EmailSearch placeholder="请输入邮箱" />, !readonly)}
            </ProForm.Item>
          </Col>
          <Col {...FORM_LAYOUT}>
            <ProForm.Item
              name="date"
              label="日期"
              rules={getNormalRules('日期', {
                select: true,
              })}
              validateFirst
            >
              {loadApplyItem(
                <BaseDatePicker
                  type={FORM_ITEM_TYPE.DATE.code}
                  placeholder="请选择日期"
                  formatTimeStamp={false}
                />,
                !readonly,
              )}
            </ProForm.Item>
          </Col>
          <ProFormDigitRange
            name="numRange"
            label="数值区间"
            colProps={FORM_LAYOUT}
            fieldProps={{ precision: 2 }}
            rules={[
              {
                validator: (_, val) => {
                  const [num1, num2] = val || [];
                  if (!val || num1 === undefined || num2 === undefined) {
                    return Promise.reject(new Error('请输入数值'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            validateTrigger="onBlur"
            validateFirst
            required
          />
          <ProFormDigit
            name="num"
            label="单一数值"
            colProps={FORM_LAYOUT}
            fieldProps={{ precision: 0 }}
            rules={getNormalRules('数值', {
              required: true,
              validateLen: false,
            })}
            validateFirst
            min={0}
            max={999999}
          />
          <Col {...FORM_LAYOUT}>
            <ProForm.Item
              label="附件"
              name="file"
              rules={[
                {
                  validator: (_, val) => {
                    if (isEmptyArray(val)) {
                      return Promise.reject(new Error('请上传附件'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              validateFirst
              required
            >
              <FileUpload
                accept={['pdf', 'doc', 'docx']}
                fileLen={1}
                limitSize={20}
                uploadType={UPLOAD_TYPE.BUTTON.code}
                action={ACTION}
                tooltipTitle="仅支持.pdf,.doc,.docx后缀的文件，文件大小不得超过20M"
                readonly={readonly}
              />
            </ProForm.Item>
          </Col>
          <Col {...FORM_LAYOUT}>
            <ProForm.Item
              name="area"
              label="地区（级联）"
              rules={[
                {
                  validator: (_, val) => {
                    if (!val || isEmptyArray(val)) {
                      return Promise.reject(new Error('请选择地区'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              validateFirst
              required
            >
              {loadApplyItem(
                <BaseCascader
                  placeholder="请选择"
                  defaultOptions={defaultOptions}
                  isFetch={false}
                  fieldNames={{ label: 'label', value: 'value' }}
                  changeOnSelect={false}
                />,
                !readonly,
                'text',
                (val) => val?.join('/') || '-',
              )}
            </ProForm.Item>
          </Col>
          <ProForm.Item name="list1" trigger="onValuesChange" noStyle>
            <EditableProTable
              headerTitle="可编辑表格示例"
              rowKey="id"
              columns={proTableColumns}
              {...proTableParams.props}
              recordCreatorProps={readonly ? false : proTableParams.props?.recordCreatorProps}
              toolBarRender={null}
              maxLength={5}
            />
          </ProForm.Item>
        </ProForm.Group>
      </ProForm>
    );
  }),
);

export default TemplatesForm;`

const defaultFormExampleTemplate = ({isProForm = false}) => isProForm ? proFormText: baseFormText;

export default defaultFormExampleTemplate;