import { FORM_ITEM_TYPE } from "../../common/enum";
import { removeUnusedCode } from "../../utils/code";
import { prettify } from "../../utils/utils";

const FORM_ARR_TYPE = {
  FORM_LIST: {
    code: "array",
    desc: "formList",
  },
  OBJECT: {
    code: 'object',
    desc: 'object'
  }
};

export const baseFormText = (params) => `
import React, { forwardRef, useEffect, useImperativeHandle } from 'react';
import QuillEditer from '@/components/QuillEditer';
import { Checkbox, Col, Form, Input, InputNumber, Radio, Row, Select, Card, Space, Button } from 'antd';
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
import FormItemGroup from '@/components/FormItemGroup';


const FORM_LAYOUT = {
  sm: 24,
  md: 12,
  xl: 8,
};

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
        ${baseRenderText(params)}
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

const renderFormListWrapper = (v, childrenText) => {
  if(v.type === FORM_ARR_TYPE.OBJECT.code) {
    return `
    <Card title="${v.description}">
      <FormItemGroup>
        ${childrenText}
      </FormItemGroup>
    </Card>
    `;
  }


  return `
  <Card title="${v.description}">
    <Form.List name="${v.name}">
      {(fields, { add, remove }) => (
        <div>
          {fields.map((field) => (
            <>
              <FormItemGroup>
                ${childrenText}

                <Col colProps={{ ...FORM_LAYOUT, xl: 24, marginBottom: 20 }}>
                {!readonly && (
                  <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button onClick={() => add()}>
                      添加
                    </Button>
                    {fields.length > 1 && (
                      <Button onClick={() => remove(field.name)}>
                        删除
                      </Button>
                    )}
                  </Space>
                )}
                </Col>
              </FormItemGroup>
            </>
          ))}
        </div>
      )}
    </Form.List>
  </Card>
  `;
};

const renderProFormListWrapper = (v, childrenText) => {
  return `
  <ProCard title="${v.description}">
    <ProFormList
        name="${v.name}"
        alwaysShowItemLabel
        copyIconProps={!readonly && { Icon: SmileOutlined, tooltipText: '复制此行到末尾' }}
        deleteIconProps={
          !readonly && {
            Icon: CloseCircleOutlined,
            tooltipText: '不需要这行了',
          }
        }
      >
      <ProForm.Group>
        ${childrenText}
      </ProForm.Group>
    </ProFormList>
  </ProCard>
  `;
};

const renderFormItemName = (parentFormType, v, parentName) => {
  if (parentFormType === FORM_ARR_TYPE.FORM_LIST.code) {
    return `{[field.name, "${v.name}"]}`;
  }
  if(parentFormType === FORM_ARR_TYPE.OBJECT.code) {
    return `{["${parentName}", "${v.name}"]}`;
  }

  return `"${v.name}"`;
};

const baseRenderText = (params, parentFormType = "", parentName = '') => {
  let result = "";
  const paramsBasic = params.filter(
    (v) => !(Array.isArray(v.children) && v.children.length > 0)
  );
  const paramsArray = params.filter(
    (v) => Array.isArray(v.children) && v.children.length > 0
  );

  if (!parentFormType) {
    result += `<Card title="基本表单">
    <FormItemGroup>`;
  }

  paramsBasic.forEach((v) => {
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
      name=${renderFormItemName(parentFormType, v, parentName)}
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

  if (!parentFormType) {
    result += `</FormItemGroup>
    </Card>`;
  }

  paramsArray.forEach((v) => {
    if (Array.isArray(v.children) && v.children.length > 0) {
      result += renderFormListWrapper(
        v,
        baseRenderText(v.children, v.type, v.name),
        v.type
      );
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
      name=${renderFormItemName(parentFormType, v, parentName)}
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

const proRenderText = (params, parentFormType = "") => {
  let result = "";
  const paramsBasic = params.filter(
    (v) => !(Array.isArray(v.children) && v.children.length > 0)
  );
  const paramsArray = params.filter(
    (v) => Array.isArray(v.children) && v.children.length > 0
  );

  if (parentFormType !== FORM_ARR_TYPE.FORM_LIST.code) {
    result += `<ProCard title="基本表单">
    <ProForm.Group>`;
  }

  paramsBasic.forEach((v) => {
    result += `
    ${renderProFormItemType(v)}
    `;
  });

  if (parentFormType !== FORM_ARR_TYPE.FORM_LIST.code) {
    result += `
    </ProForm.Group> 
    </ProCard>`;
  }
  paramsArray.forEach((v) => {
    result += `
    ${renderProFormListWrapper(
      v,
      proRenderText(v.children, FORM_ARR_TYPE.FORM_LIST.code)
    )}
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
      label="${v.description}"
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
      label="${v.description}"
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
      label="${v.description}"
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
      label="${v.description}"
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
        label="${v.description}"
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
          label="${v.description}"
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
      label="${v.description}"
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
      label="${v.description}"
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
      label="${v.description}"
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
                  label="${v.description}"
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
import { CloseCircleOutlined, SmileOutlined } from '@ant-design/icons';
import QuillEditer from '@/components/QuillEditer';
import {
  EditableProTable,
  ProCard,
  ProFormList,
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
        ${proRenderText(params)}
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
