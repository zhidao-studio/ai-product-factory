import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, type FormInstance } from 'antd';
import type { ClientUserForm } from '@/api/client/user/types';

interface ClientUserFormModalProps {
  open: boolean;
  title: string;
  form: FormInstance<ClientUserForm>;
  initialValues: ClientUserForm;
  genderOptions: Array<{ label: string; value: string }>;
  statusOptions: Array<{ label: string; value: string }>;
  onClose: () => void;
  onFinish: (values: ClientUserForm) => Promise<boolean>;
}

export default function ClientUserFormModal({
  open,
  title,
  form,
  initialValues,
  genderOptions,
  statusOptions,
  onClose,
  onFinish
}: ClientUserFormModalProps) {
  const editingUserId = Form.useWatch('userId', form);

  return (
    <ModalForm<ClientUserForm>
      title={title}
      open={open}
      width={720}
      form={form}
      layout="vertical"
      initialValues={initialValues}
      modalProps={{
        destroyOnHidden: true,
        onCancel: () => {
          onClose();
          form.resetFields();
        }
      }}
      onOpenChange={nextOpen => !nextOpen && onClose()}
      onFinish={onFinish}
    >
      <ProFormText name="userId" hidden />
      <ProFormText name="version" hidden />
      <div className="form-grid">
        <ProFormText
          name="userName"
          label="用户账号"
          fieldProps={{ maxLength: 30, disabled: !!editingUserId }}
          placeholder="请输入用户账号"
          rules={[
            { required: true, message: '用户账号不能为空' },
            { min: 2, max: 30, message: '用户账号长度必须介于 2 和 30 之间' }
          ]}
        />
        <ProFormText
          name="nickName"
          label="用户昵称"
          fieldProps={{ maxLength: 30 }}
          placeholder="请输入用户昵称"
          rules={[{ required: true, message: '用户昵称不能为空' }]}
        />
        {!editingUserId && (
          <ProFormText.Password
            name="password"
            label="用户密码"
            fieldProps={{ maxLength: 20 }}
            placeholder="请输入用户密码"
            rules={[
              { required: true, message: '用户密码不能为空' },
              { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间' },
              { pattern: /^[^<>"'|\\]+$/, message: `不能包含非法字符：< > " ' \\ |` }
            ]}
          />
        )}
        <ProFormText
          name="phoneNumber"
          label="手机号码"
          fieldProps={{ maxLength: 11 }}
          placeholder="请输入手机号码"
          rules={[{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }]}
        />
        <ProFormText
          name="email"
          label="邮箱"
          fieldProps={{ maxLength: 50 }}
          placeholder="请输入邮箱"
          rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
        />
        <ProFormSelect name="gender" label="用户性别" allowClear options={genderOptions} placeholder="请选择" />
        <ProFormSelect name="status" label="状态" options={statusOptions} placeholder="请选择" />
      </div>
      <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} placeholder="请输入内容" />
    </ModalForm>
  );
}
