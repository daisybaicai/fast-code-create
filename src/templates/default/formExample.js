import { FORM_ITEM_TYPE } from "../../common/enum";
import { removeUnusedCode } from "../../utils/code";
import { prettify } from "../../utils/utils";

export const baseFormText = (params) => `
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import QuillEditer from '@/components/QuillEditer';
import { Checkbox, Col, Form, Input, InputNumber, Radio, Row, Select } from 'antd';
import { EditableProTable, ProFormDigitRange } from '@ant-design/pro-components';
import ApplyItem from '@/components/ApplyItem';
import loadApplyItem from '@/components/ApplyItem/loadApplyItem';
import BaseCascader from '@/components/BaseCascader';
import BaseDatePicker from '@/components/BaseDatePicker';
import EmailSearch from '@/components/EmailSearch';
import FileUpload from '@/components/FileUpload';
import { UPLOAD_TYPE } from '@/components/FileUpload/fileUtils';
import { useEditableProTableParams } from '@/utils/hooks';
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
    const handleSubmit = (cb = () => {}) => {
      form.validateFields().then((values) => {
        cb(values);
      });
    };
    useImperativeHandle(ref, () => {
      return {
        submit: handleSubmit,
        getFieldsValue: form.getFieldsValue,
        setFieldsValue: form.setFieldsValue,
        scrollToField: form.scrollToField,
      };
    });

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
        requiredMark={!readonly}
      >
        <FormItemGroup>
          ${baseRenderText(params)}
        </FormItemGroup>
      </Form>
    );
  }),
);

export default BaseForm;`;

const renderFormItemType = (type, v) => {
  switch (type) {
    case FORM_ITEM_TYPE.INPUT.code:
      return `<Input placeholder="请输入" />`;
    case FORM_ITEM_TYPE.SELECT.code:
      return ` <Select placeholder="请选择">
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
              </Select>`;
    case FORM_ITEM_TYPE.RADIO.code:
      return `<Radio.Group buttonStyle="solid">
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
              </Radio.Group>`;
    case FORM_ITEM_TYPE.CHECKBOX.code:
      return `<Checkbox.Group>
                {['A', 'B', 'C', 'D', 'E', 'F'].map((v) => (
                  <Checkbox value={v} key={v}>
                    {v}
                  </Checkbox>
                ))}
              </Checkbox.Group>`;
    case FORM_ITEM_TYPE.TEXT_AREA.code:
      return `<Input.TextArea maxLength={200} showCount />`;
    case FORM_ITEM_TYPE.EMAIL.code:
      return `<EmailSearch placeholder="请输入邮箱" />`;
    case FORM_ITEM_TYPE.DATE.code:
      return `<BaseDatePicker
                type={FORM_ITEM_TYPE.DATE.code}
                placeholder="请选择日期"
                formatTimeStamp={false}
              />`;
    case FORM_ITEM_TYPE.NUM_RANGE.code:
      return `<ProFormDigitRange 
                name="numRange"
                label="数值区间"
                colProps={${
                  v.formCol === "8"
                    ? "FORM_LAYOUT"
                    : `{
                    ...FORM_LAYOUT,
                    xl: ${v.formCol}
                  }`
                }}
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
              />`;
    case FORM_ITEM_TYPE.NUM.code:
      return `<InputNumber
                min={0}
                max={999999}
                precision={0}
                placeholder="请输入"
                style={{ width: '100%' }}
              />`;
    case FORM_ITEM_TYPE.FILE.code:
      return `<FileUpload
                accept={['pdf', 'doc', 'docx']}
                fileLen={1}
                limitSize={20}
                uploadType={UPLOAD_TYPE.BUTTON.code}
                action={ACTION}
                tooltipTitle="仅支持.pdf,.doc,.docx后缀的文件，文件大小不得超过20M"
                readonly={readonly}
              />`;
    case FORM_ITEM_TYPE.CASCADER.code:
      return `<BaseCascader
                placeholder="请选择"
                defaultOptions={defaultOptions}
                isFetch={false}
                fieldNames={{ label: 'label', value: 'value' }}
                changeOnSelect={false}
              />`;
    case FORM_ITEM_TYPE.RICH_TEXT.code:
      return `<QuillEditer />`;
    default:
      return `<Input placeholder="请输入" />`;
  }
};

const baseRenderText = (params) => {
  let result = "";
  params.forEach((v) => {
    // 跳过非formItem的字段
    if (!v.isFormItem) {
      return;
    }
    if (v.formType === FORM_ITEM_TYPE.NUM_RANGE.code) {
      result += `${renderFormItemType(v.formType, v)}`;
      return;
    }

    const shouldSelect = [
      FORM_ITEM_TYPE.CASCADER.code,
      FORM_ITEM_TYPE.DATE.code,
      FORM_ITEM_TYPE.CHECKBOX.code,
      FORM_ITEM_TYPE.RADIO.code,
      FORM_ITEM_TYPE.SELECT.code,
    ].includes(v.formType);

    result += `
    <Form.Item
      name="${v.name}"
      label="${v.description}"
      colProps={${
        v.formCol === "8"
          ? "FORM_LAYOUT"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }}
      rules={getNormalRules('${v.description}', {
        ${shouldSelect ? `select: true,` : ""}
        ${v.formPattern ? `pattern: PATTERN.${v.formPattern},` : ""}
        ${v.formType === FORM_ITEM_TYPE.TEXT_AREA.code ? `maxLen: 200,` : ""}
      })}
      validateFirst
    >
      {loadApplyItem(${renderFormItemType(v.formType, v)}, !readonly)}
    </Form.Item>
    `;
  });
  return result;
};

const proRenderText = (params) => {
  let result = "";
  params.forEach((v) => {
    // 跳过非formItem的字段
    if (!v.isFormItem) {
      return;
    }
    result += `
    ${renderProFormItemType(v)}
    `;
  });
  return result;
};

const renderProFormItemType = (v) => {
  switch (v.formType) {
    case FORM_ITEM_TYPE.INPUT.code:
      return `
      <ProFormText
      name="${v.name}"
      label="${v.description}"
      colProps={${
        v.formCol === "8"
          ? "FORM_LAYOUT"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }}
      rules={getNormalRules('${v.description}', {
        ${v.formPattern ? `pattern: PATTERN.${v.formPattern},` : ""}
      })}
      validateFirst
    />`;
    case FORM_ITEM_TYPE.SELECT.code:
      return `           <ProFormSelect
      name="${v.name}"
      label="${v.description}}"
      colProps={${
        v.formCol === "8"
          ? "FORM_LAYOUT"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }}
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
      rules={getNormalRules('${v.description}', { select: true })}
      validateFirst
    />`;
    case FORM_ITEM_TYPE.RADIO.code:
      return `          <ProFormRadio.Group
      name="${v.name}"
      label="${v.description}}"
      colProps={${
        v.formCol === "8"
          ? "FORM_LAYOUT"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }}
      radioType="button"
      fieldProps={{
        buttonStyle: 'solid',
      }}
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
      rules={getNormalRules('${v.description}', { select: true })}
      validateFirst
    />`;
    case FORM_ITEM_TYPE.CHECKBOX.code:
      return `<ProFormCheckbox.Group
      name="${v.name}"
      label="${v.description}}"
      colProps={${
        v.formCol === "8"
          ? "FORM_LAYOUT"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }}
      options={['A', 'B', 'C', 'D', 'E', 'F']}
      rules={getNormalRules('${v.description}', { select: true })}
      validateFirst
    />`;
    case FORM_ITEM_TYPE.TEXT_AREA.code:
      return `
      <ProFormTextArea
      name="${v.name}"
      label="${v.description}}"
      colProps={${
        v.formCol === "8"
          ? "FORM_LAYOUT"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }}
      rules={getNormalRules('${v.description}', { maxLen: 200 })}
      fieldProps={{ showCount: true, maxLength: 200 }}
    />
      `;
    case FORM_ITEM_TYPE.EMAIL.code:
      return `<Col
      ${
        v.formCol === "8"
          ? "{...FORM_LAYOUT}"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }
      >
      <ProForm.Item
        name="${v.name}"
        label="${v.description}}"
        rules={getNormalRules('${v.description}', {
          pattern: PATTERN.EMAIL,
          validateLen: false,
        })}
        validateFirst
      >
        {loadApplyItem(<EmailSearch placeholder="请输入邮箱" />, !readonly)}
      </ProForm.Item>
    </Col>`;
    case FORM_ITEM_TYPE.DATE.code:
      return `
      <Col       ${
        v.formCol === "8"
          ? "{...FORM_LAYOUT}"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }>
      <ProForm.Item
          name="${v.name}"
          label="${v.description}}"
          rules={getNormalRules('${v.description}', {
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
      
      `;
    case FORM_ITEM_TYPE.NUM_RANGE.code:
      return `<ProFormDigitRange 
                name="numRange"
                label="数值区间"
                colProps={${
                  v.formCol === "8"
                    ? "FORM_LAYOUT"
                    : `{
                    ...FORM_LAYOUT,
                    xl: ${v.formCol}
                  }`
                }}
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
              />`;
    case FORM_ITEM_TYPE.NUM.code:
      return `<ProFormDigit
      fieldProps={{ precision: 0 }}
      name="${v.name}"
      label="${v.description}}"
      colProps={${
        v.formCol === "8"
          ? "FORM_LAYOUT"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }}
      rules={getNormalRules('${v.description}', { validateLen: false })}
      validateFirst
      min={0}
      max={999999}
    />`;
    case FORM_ITEM_TYPE.FILE.code:
      return `
      <Col       ${
        v.formCol === "8"
          ? "{...FORM_LAYOUT}"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }>
      <ProForm.Item
      name="${v.name}"
      label="${v.description}}"
        rules={[
          {
            validator: (_, val) => {
              if (isEmptyArray(val)) {
                return Promise.reject(new Error('请上传${v.description}'));
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
      `;
    case FORM_ITEM_TYPE.CASCADER.code:
      return `
      <Col       ${
        v.formCol === "8"
          ? "{...FORM_LAYOUT}"
          : `{
          ...FORM_LAYOUT,
          xl: ${v.formCol}
        }`
      }>
      <ProForm.Item
      name="${v.name}"
      label="${v.description}}"
        rules={[
          {
            validator: (_, val) => {
              if (!val || isEmptyArray(val)) {
                return Promise.reject(new Error('请选择${v.description}'));
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
    </Col>`;
    case FORM_ITEM_TYPE.RICH_TEXT.code:
      return `
              <Col ${
                v.formCol === "8"
                  ? "{...FORM_LAYOUT}"
                  : `{
                  ...FORM_LAYOUT,
                  xl: ${v.formCol}
                }`
              }>
              <ProForm.Item
                  name="${v.name}"
                  label="${v.description}}"
                  rules={getNormalRules('${v.description}', {
                  })}
                validateFirst
              >
                {loadApplyItem(
                  <QuillEditer />,
                  !readonly,
                )}
              </ProForm.Item>
            </Col>
              `;
    default:
      return `
        <ProFormText
        name="${v.name}"
        label="${v.description}"
        colProps={${
          v.formCol === "8"
            ? "FORM_LAYOUT"
            : `{
            ...FORM_LAYOUT,
            xl: ${v.formCol}
          }`
        }}
        rules={getNormalRules('${v.description}', {
          ${v.formPattern ? `pattern: PATTERN.${v.formPattern},` : ""}
        })}
        validateFirst
      />`;
  }
};

export const proFormText = (params) => `
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Col } from 'antd';
import QuillEditer from '@/components/QuillEditer';
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
import { useEditableProTableParams } from '@/utils/hooks';
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

const TemplatesForm = React.memo(
  forwardRef(({ readonly = false, value = {} }, ref) => {
    const formRef = useRef();
    const handleSubmit = (cb = () => {}) => {
      formRef.current.validateFields().then((values) => {
        cb(values);
      });
    };

    useImperativeHandle(ref, () => {
      return {
        submit: handleSubmit,
        getFieldsValue: formRef.current?.getFieldsValue,
        setFieldsValue: formRef.current?.setFieldsValue,
        scrollToField: formRef.current?.scrollToField,
      };
    });


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
        requiredMark={!readonly}
      >
        <ProForm.Group>
          ${proRenderText(params)}
        </ProForm.Group>
      </ProForm>
    );
  }),
);

export default TemplatesForm;`;

const defaultFormExampleTemplate = ({ isProForm = false, params = [] }) => {
  // console.log(baseFormText(params))
  const code = isProForm ? proFormText(params) : baseFormText(params);
  const result = prettify(removeUnusedCode(code));
  return result;
};

export default defaultFormExampleTemplate;
