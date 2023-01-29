import { getFormItemsInForm } from "../../utils/utils";

const text = ({
  fetchName,
  params,
  loadItem = false,
}) => `import React, { useEffect, useState } from 'react';
import { Card, Button, message, Form, Input, Row, Col } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import BaseDatePicker from '@/components/BaseDatePicker';
import EmailSearch from '@/components/EmailSearch';
import { UPLOAD_TYPE } from '@/components/FileUpload/fileUtils';
import FileUpload from '@/components/FileUpload/index';
import { LIST_FORM_LAYOUT, FORM_ITEM_TYPE } from '@/common/enum';
import { PATTERN } from '@/common/pattern';
import styles from './index.less';
import { ${fetchName} } from '@/services/api';
import { useRequest } from 'ahooks';

export default function FormApply() {
  const [form] = Form.useForm();

  const { run: submitForm, loading } = useRequest(${fetchName}, { manual: true });

  const handleSubmit = () => {
    form
      .validateFields()
      .then((value) => {
        const data = {
          ...value,
        };
        submitForm(data).then(res => {
          message.success("提交成功")
        }).catch(err => {
          message.error("提交失败")
        })
      })
      .catch((err) => {
        message.error('请按要求填写表单');
      });
  };

  return (
    <div style={{ position: 'relative' }}>
      <PageContainer
        title="表单应用"
        breadcrumb={null}
        footer={
          <Button
            onClick={() => {
              handleSubmit();
            }}
            type="primary"
            loading={loading}
          >
            提交
          </Button>
        }
      >
        <Form
          form={form}
          name="form"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
        >
          <Card bordered={false}>
            ${getFormItemsInForm(params, loadItem)}
          </Card>
        </Form>
      </PageContainer>
    </div>
  );
}
`;
export default text;
